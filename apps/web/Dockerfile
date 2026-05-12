# ===== Base =====
FROM node:20-alpine AS base
WORKDIR /app

ARG NEXT_PUBLIC_ELYSIA_WS_URL
ENV NEXT_PUBLIC_ELYSIA_WS_URL=$NEXT_PUBLIC_ELYSIA_WS_URL

ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# ===== Dependencies =====
FROM base AS deps
COPY apps/web/package*.json .
COPY packages ./packages
RUN npm install --package-lock-only
RUN npm ci

# ===== Build =====
FROM deps AS build

ARG NEXT_PUBLIC_ELYSIA_WS_URL
ENV NEXT_PUBLIC_ELYSIA_WS_URL=$NEXT_PUBLIC_ELYSIA_WS_URL

ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL


COPY apps/web .
RUN npm run build

# ===== Development =====
FROM deps AS dev

ARG NEXT_PUBLIC_ELYSIA_WS_URL
ENV NEXT_PUBLIC_ELYSIA_WS_URL=$NEXT_PUBLIC_ELYSIA_WS_URL

ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

COPY apps/web .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ===== Production =====
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

ARG NEXT_PUBLIC_ELYSIA_WS_URL
ENV NEXT_PUBLIC_ELYSIA_WS_URL=$NEXT_PUBLIC_ELYSIA_WS_URL

ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

COPY apps/web/package*.json .
COPY packages ./packages
RUN npm install --package-lock-only
RUN npm ci --omit=dev

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
