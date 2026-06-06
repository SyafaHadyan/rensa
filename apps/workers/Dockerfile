FROM node:20-bookworm-slim AS base
WORKDIR /repo

RUN npm install -g pnpm@10.33.2 bun@1.3.5

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/workers/package.json apps/workers/package.json
COPY packages/cache/package.json packages/cache/package.json
COPY packages/cloudinary/package.json packages/cloudinary/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/email/package.json packages/email/package.json
COPY packages/queue/package.json packages/queue/package.json

FROM base AS deps
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM base AS prod-deps
RUN pnpm install --filter @rensa/workers... --prod --frozen-lockfile --ignore-scripts

FROM deps AS dev
WORKDIR /repo

ENV NODE_ENV=development

COPY apps/workers apps/workers
COPY packages/cache packages/cache
COPY packages/cloudinary packages/cloudinary
COPY packages/db packages/db
COPY packages/email packages/email
COPY packages/queue packages/queue

EXPOSE 3010
CMD ["bun", "run", "--cwd", "apps/workers", "src/index.ts"]

FROM prod-deps AS prod
WORKDIR /repo

ENV NODE_ENV=production

# Replace the standard Bun binary with the baseline variant (no AVX2 required)
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl unzip ca-certificates && \
    curl -fsSL https://github.com/oven-sh/bun/releases/download/bun-v1.3.5/bun-linux-x64-baseline.zip \
      -o /tmp/bun-baseline.zip && \
    unzip /tmp/bun-baseline.zip -d /tmp/bun-baseline && \
    mv /tmp/bun-baseline/bun-linux-x64-baseline/bun /usr/local/bin/bun && \
    chmod +x /usr/local/bin/bun && \
    apt-get purge -y --auto-remove curl unzip && \
    rm -rf /tmp/bun-baseline.zip /tmp/bun-baseline /var/lib/apt/lists/*

COPY apps/workers apps/workers
COPY packages/cache packages/cache
COPY packages/cloudinary packages/cloudinary
COPY packages/db packages/db
COPY packages/email packages/email
COPY packages/queue packages/queue

EXPOSE 3010
CMD ["bun", "run", "--cwd", "apps/workers", "src/index.ts"]
