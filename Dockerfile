# ==============================================================================
# Multi-Stage Dockerfile for Smart Pali (Production-Hardened)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Base image
# ------------------------------------------------------------------------------
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ------------------------------------------------------------------------------
# Stage 2: Install dependencies
# ------------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --ignore-scripts

# ------------------------------------------------------------------------------
# Stage 3: Build application
# ------------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV AUTH_SECRET="build_placeholder_secret_min_16_chars_long"
ENV APP_URL="http://localhost:3010"

# Generate Prisma Client specifically into src/generated/prisma
RUN npx prisma generate

# Build Next.js with standalone output
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 4: Production runner (Hardened & Minimal)
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl wget

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3010
ENV HOSTNAME="0.0.0.0"
ENV NODE_PATH="/usr/local/lib/node_modules"

# 1. Create secure non-root user and group (Principle of Least Privilege)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 2. Setup persistent upload and cache directories with proper permissions
RUN mkdir -p /app/public/uploads && \
    mkdir -p /app/.next/cache && \
    chown -R nextjs:nodejs /app/public/uploads /app/.next/cache

# 3. Copy application bundle from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 4. Install Prisma CLI and dotenv globally and copy schema for container auto-migrations
RUN npm install -g prisma@6.19.3 dotenv
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated

# 5. Copy and configure entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# 6. Switch to non-root user
USER nextjs

EXPOSE 3010

# 7. Define Healthcheck for container orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3010/api/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
