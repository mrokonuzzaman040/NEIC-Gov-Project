# syntax=docker/dockerfile:1.6

FROM node:20-bookworm-slim AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

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
