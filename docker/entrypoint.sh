#!/bin/bash
# Seeds DSH_HOME on first boot, then serves the NousAI web surface.
#
# Everything below is written only when absent, so a mounted /data volume keeps
# whatever the user changed through the UI across restarts and image rebuilds.
set -euo pipefail

: "${DSH_HOME:=/data}"
# host.containers.internal is Podman's host alias. Docker Desktop resolves
# host.docker.internal instead, and Docker on Linux needs
# `--add-host=host.containers.internal:host-gateway` — or override this URL.
: "${LM_STUDIO_BASE_URL:=http://host.containers.internal:1234/v1}"
: "${LM_STUDIO_MODEL:=qwen3.6-35b-a3b-mlx}"
: "${LM_STUDIO_API_KEY:=lm-studio}"

DSH="node /app/apps/cli/lib/bin.js"
PROFILE="$DSH_HOME/profiles/web"

mkdir -p "$DSH_HOME"

# Copy the build-time profile seed in rather than resolving the bundle graph
# now: a fresh volume then boots without network access.
if [ ! -d "$PROFILE" ] && [ -d /opt/dsh-seed ]; then
  cp -a /opt/dsh-seed/. "$DSH_HOME"/
fi

# The CLI rejects `--host 0.0.0.0` on purpose (it would expose remote code
# execution to the network), but a container must bind all interfaces for port
# publishing to reach it. The profile patch is the supported route, and the
# safety it guards is restored by publishing to loopback only on the host.
# A patch replaces the row's whole config, so both keys are restated.
if [ ! -s "$PROFILE/cordis.patch.yml" ]; then
  mkdir -p "$PROFILE"
  cat > "$PROFILE/cordis.patch.yml" <<'YAML'
# Container bind. Publish with `-p 127.0.0.1:3080:3080` — never a routable interface.
- id: webserver
  config:
    host: '0.0.0.0'
    port: 3080
YAML
fi

# pi-ai's openai-completions client requires a non-empty apiKey OR a non-empty
# authorization header, even against a keyless local server. Without one every
# turn fails with "No API key for provider: lm-studio".
if [ ! -s "$DSH_HOME/settings.yaml" ]; then
  cat > "$DSH_HOME/settings.yaml" <<YAML
llm-pi-ai:
  providers:
    lm-studio:
      api: openai-completions
      baseURL: ${LM_STUDIO_BASE_URL}
      headers:
        Authorization: "Bearer ${LM_STUDIO_API_KEY}"
      models:
        - id: ${LM_STUDIO_MODEL}
          name: ${LM_STUDIO_MODEL}
      displayName: lm-studio
agent-default-model:
  provider: lm-studio
  model: ${LM_STUDIO_MODEL}
YAML
  chmod 600 "$DSH_HOME/settings.yaml"
fi

# Re-link the profile against this image's /app. Cheap when nothing moved, and
# it repairs a volume seeded by an older image. That repair failing is exactly
# the breakage this step exists to catch, so it stays visible in the container
# log; boot continues because the seeded profile may still be usable as-is.
$DSH plugin --profile web install >/dev/null \
  || echo "WARN: profile re-link failed; continuing with the existing profile" >&2

echo "NousAI harness: DSH_HOME=$DSH_HOME  model=$LM_STUDIO_MODEL  via $LM_STUDIO_BASE_URL"
exec $DSH web "$@"
