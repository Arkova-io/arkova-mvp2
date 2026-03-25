# Arkova Worker — Railway Build (minimal, single-stage)
# NOTE: Build context is repo root (Railway Root Directory is empty).
# All COPY paths use services/worker/ prefix.
FROM node:lts-alpine
WORKDIR /app

# Copy manifests and install ALL deps (need typescript for build)
COPY services/worker/package.json services/worker/package-lock.json ./
RUN npm install

# Copy source and build
COPY services/worker/tsconfig.json services/worker/tsconfig.build.json ./
COPY services/worker/src/ ./src/
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --omit=dev && npm cache clean --force

# Remove source (only need compiled dist/)
RUN rm -rf src/ tsconfig.json tsconfig.build.json

ENV PORT=3001
EXPOSE 3001
CMD ["node", "dist/index.js"]
