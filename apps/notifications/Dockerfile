FROM node:20-bookworm-slim AS deps
WORKDIR /repo

RUN npm install -g pnpm@10.33.2 bun@1.3.5

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/notifications/package.json apps/notifications/package.json
COPY packages/cache/package.json packages/cache/package.json
COPY packages/db/package.json packages/db/package.json

RUN pnpm install --frozen-lockfile --ignore-scripts

FROM deps AS build
WORKDIR /repo

ENV NODE_ENV=production

COPY apps/notifications apps/notifications
COPY packages/cache packages/cache
COPY packages/db packages/db

WORKDIR /repo/apps/notifications

RUN bun build \
  --compile \
  --outfile server \
  src/index.ts

RUN bun build \
  --compile \
  --outfile healthcheck \
  src/healthcheck.ts

FROM deps AS dev
WORKDIR /repo

ENV NODE_ENV=development

COPY apps/notifications apps/notifications
COPY packages/cache packages/cache
COPY packages/db packages/db

EXPOSE 3002
CMD ["bun", "run", "--cwd", "apps/notifications", "src/index.ts"]

FROM gcr.io/distroless/base AS prod
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /repo/apps/notifications/server ./server
COPY --from=build /repo/apps/notifications/healthcheck ./healthcheck

EXPOSE 3002
CMD ["./server"]
