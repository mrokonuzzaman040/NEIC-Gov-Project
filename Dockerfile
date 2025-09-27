# syntax=docker/dockerfile:1.6

FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1 \
    npm_config_prisma_skip_postinstall_generate=true
COPY package.json package-lock.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npm ci

FROM base AS builder
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production

# Copy built application and dependencies
COPY --from=builder /app ./
RUN rm -rf node_modules
COPY --from=deps /app/node_modules ./node_modules

# Copy Docker entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
  && useradd -m -u 1001 nextjs \
  && mkdir -p /app/uploads/submissions \
  && chown -R nextjs:nextjs /app

USER nextjs
EXPOSE 3000
ENV PORT=3000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "run", "start"]
