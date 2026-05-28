FROM node:20-alpine AS deps
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/cache/package.json packages/cache/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/rate-limit/package.json packages/rate-limit/package.json

RUN pnpm install --frozen-lockfile --ignore-scripts

FROM deps AS build
WORKDIR /repo

ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_ELYSIA_WS_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_EXPLORE_SOURCE

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_ELYSIA_WS_URL=$NEXT_PUBLIC_ELYSIA_WS_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_EXPLORE_SOURCE=$NEXT_PUBLIC_EXPLORE_SOURCE

COPY apps/web apps/web
COPY packages packages

RUN pnpm --filter @rensa/web build

FROM deps AS dev
WORKDIR /repo

ARG NEXT_PUBLIC_ELYSIA_WS_URL
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_ELYSIA_WS_URL=$NEXT_PUBLIC_ELYSIA_WS_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

COPY apps/web apps/web
COPY packages packages

EXPOSE 3000
CMD ["pnpm", "--filter", "@rensa/web", "dev", "--", "-H", "0.0.0.0"]

FROM node:20-alpine AS prod
WORKDIR /repo

ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /repo/apps/web/public apps/web/public
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static apps/web/.next/static

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
