# syntax=docker/dockerfile:1
# =============================================================================
# Dockerfile: image de DÉVELOPPEMENT de l'app Next.js.
# Le code n'est pas copié dans l'image : il est monté depuis ta machine par
# docker-compose.yml, pour que chaque sauvegarde recharge la page (hot reload).
# =============================================================================

# Doit correspondre à "devEngines" dans package.json et à .nvmrc,
# sinon npm refuse de s'exécuter (EBADDEVENGINES).
ARG NODE_VERSION=24
ARG NPM_VERSION=12.2.0

# `slim` = Debian allégée (glibc) : les paquets npm avec binaires natifs
# (Prisma, etc.) s'installent sans surprise, contrairement à Alpine (musl).
FROM node:${NODE_VERSION}-slim AS dev
ARG NPM_VERSION
# OpenSSL est requis par les moteurs Prisma.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
# L'image Node embarque sa propre version de npm : on fixe celle du projet.
RUN npm install -g npm@${NPM_VERSION} && npm cache clean --force

WORKDIR /app
# On tourne en tant que `node` (UID 1000) et pas root : les fichiers que Next
# et Prisma écrivent dans le dossier monté (.next, src/generated) t'appartiennent.
RUN chown node:node /app
USER node

# Copier UNIQUEMENT les manifestes : tant qu'ils ne changent pas, Docker
# réutilise cette couche en cache au lieu de tout réinstaller.
COPY --chown=node:node package.json package-lock.json ./
# --ignore-scripts : `prisma generate` (postinstall) a besoin du schéma, et
# `husky` (prepare) du dépôt git, absents à ce stade. Ils tournent au démarrage.
RUN npm ci --ignore-scripts

ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000

# Au DÉMARRAGE du conteneur (le code n'existe qu'une fois le volume monté) :
# 1. client Prisma  2. migrations versionnées pas encore appliquées
# 3. serveur de dev, à l'écoute de toutes les interfaces (sinon injoignable
#    depuis l'extérieur du conteneur).
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run dev -- -H 0.0.0.0"]
