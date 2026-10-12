# syntax=docker/dockerfile:1
# =============================================================================
# Dockerfile: DEVELOPMENT image of the Next.js app.
# The code is not copied into the image: docker-compose.yml mounts it from your
# machine, so every save reloads the page (hot reload).
# =============================================================================

# Must match "devEngines" in package.json and .nvmrc, otherwise npm refuses
# to run (EBADDEVENGINES).
ARG NODE_VERSION=24
ARG NPM_VERSION=12.2.0

# `slim` = trimmed-down Debian (glibc): npm packages shipping native binaries
# (Prisma, etc.) install without surprises, unlike Alpine (musl).
FROM node:${NODE_VERSION}-slim AS dev
ARG NPM_VERSION
# OpenSSL is required by the Prisma engines.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
# The Node image ships its own npm version: pin the project's one.
RUN npm install -g npm@${NPM_VERSION} && npm cache clean --force

WORKDIR /app
# Run as `node` (UID 1000), not root: files written by Next and Prisma into the
# mounted folder (.next, src/generated) belong to you.
RUN chown node:node /app
USER node

# Copy ONLY the manifests: as long as they don't change, Docker reuses this
# cached layer instead of reinstalling everything.
COPY --chown=node:node package.json package-lock.json ./
# --ignore-scripts: `prisma generate` (postinstall) needs the schema and `husky`
# (prepare) needs the git repo, both missing at this point. They run at startup.
RUN npm ci --ignore-scripts

ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000

# At container STARTUP (the code only exists once the volume is mounted):
# 1. Prisma client  2. committed migrations not applied yet
# 3. dev server, listening on all interfaces (otherwise unreachable from
#    outside the container).
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run dev -- -H 0.0.0.0"]
