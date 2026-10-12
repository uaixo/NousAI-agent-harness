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

# The listener must bind one concrete address of a local interface: the
# webserver config rejects every wildcard (`0.0.0.0`, `::`) at load, so port
# publishing reaches the container through its own interface address, resolved
# at each boot because the engine may assign a different one per run. The host
# side keeps the exposure in check by publishing to loopback only.
BIND_HOST="$(node -e '
const { networkInterfaces } = require("node:os")
const address = Object.values(networkInterfaces()).flat()
  .find(iface => iface !== undefined && iface.family === "IPv4" && !iface.internal)?.address
if (address === undefined) { console.error("no non-loopback IPv4 interface"); process.exit(1) }
process.stdout.write(address)
')"
# The advertised root is what the browser on the host dials: the documented
# publish mapping by default, or the deployment's own URL through DSH_PUBLIC_URL.
: "${DSH_PUBLIC_URL:=http://127.0.0.1:3080/}"

# Images before 0.2.1-alpha.2 seeded a `webserver` patch binding `0.0.0.0`,
# which the current schema rejects at load. The seeded text is replaced by the
# bind flags below; a patch the user changed is left alone and fails loud.
WILDCARD_PATCH="$(cat <<'YAML'
# Container bind. Publish with `-p 127.0.0.1:3080:3080` — never a routable interface.
- id: webserver
  config:
    host: '0.0.0.0'
    port: 3080
YAML
)"
if [ -f "$PROFILE/cordis.patch.yml" ] && [ "$(cat "$PROFILE/cordis.patch.yml")" = "$WILDCARD_PATCH" ]; then
  rm "$PROFILE/cordis.patch.yml"
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

echo "NousAI harness: DSH_HOME=$DSH_HOME  bind=$BIND_HOST:3080  public=$DSH_PUBLIC_URL  model=$LM_STUDIO_MODEL  via $LM_STUDIO_BASE_URL"
exec $DSH web --host "$BIND_HOST" --port 3080 --public-url "$DSH_PUBLIC_URL" --no-open "$@"
