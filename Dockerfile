# NousAI agent harness — OCI image, builds identically under Podman and Docker.
#
# Two stages. `build` compiles the monorepo (TypeScript -> lib/*.js, plus the
# NousAI frontend dist) and seeds a throwaway DSH_HOME so the profile's bundle
# graph is resolved at build time, not on first boot. `runtime` carries the
# built tree and that seed.
#
# The image ships the whole workspace including devDependencies: dsh resolves
# its own profile bundles out of its installation tree, and `dsh plugin install`
# shells out to pnpm, so neither can be pruned away without breaking boot.

FROM node:24-bookworm-slim AS build

# python3/make/g++ build node-pty, the one native dependency pnpm has to compile.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ ca-certificates git \
 && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@11.7.0

WORKDIR /app
COPY . .

RUN pnpm install --frozen-lockfile

# Both builds are required. Without build:lib the loader dies with
# "typert contributor(s) failed to register"; without build:web:nousai it dies
# with "NousAI frontend dist not built".
RUN pnpm run build:lib \
 && pnpm run build:web:nousai

# Resolve the profile bundle graph now so the container starts offline.
#
# The profile manifest is written BEFORE the install, not left to dsh to
# scaffold: `dsh plugin install` happily creates a *default* profile when none
# exists, which succeeds and silently produces the stock DeepSeek surface with
# no NousAI bundle in it. The nousai bundle is a workspace package, so it is
# linked from /app rather than fetched — which is also why /app must stay put
# in the runtime stage.
RUN mkdir -p /opt/dsh-seed/profiles/web
COPY docker/profile-package.json /opt/dsh-seed/profiles/web/package.json
RUN DSH_HOME=/opt/dsh-seed node /app/apps/cli/lib/bin.js plugin --profile web install

# Fail the build rather than ship a stock-branded image: this is exactly the
# regression the manifest ordering above prevents.
RUN test -e /opt/dsh-seed/profiles/web/node_modules/@deepseek-ai/dsh-nousai-web-app \
 || (echo "FATAL: the NousAI bundle is not linked into the seeded profile" >&2; exit 1)
RUN for m in dsh-nousai-web-app dsh-client-ui-nousai-brand dsh-web-frontend-nousai; do \
      test -e "/opt/dsh-seed/profiles/web/node_modules/@deepseek-ai/$m" \
      || (echo "FATAL: $m is not linked into the seeded profile" >&2; exit 1); \
    done

FROM node:24-bookworm-slim AS runtime

# git and bash are runtime tools, not build tools: the harness's own bash tool
# spawns /bin/bash, and repository operations expect git on PATH.
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates git bash curl \
 && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@11.7.0

COPY --from=build /app /app
COPY --from=build /opt/dsh-seed /opt/dsh-seed
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# DSH_HOME holds settings, sessions and the installed profile. Mount a volume
# here or every session dies with the container.
ENV DSH_HOME=/data \
    NODE_ENV=production
VOLUME ["/data"]

# Bound to 0.0.0.0 inside the container by the profile patch the entrypoint
# writes. Publish it to loopback only — `-p 127.0.0.1:3080:3080`.
EXPOSE 3080

WORKDIR /workspace
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
