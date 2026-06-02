FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY apps/frontend/package*.json ./apps/frontend/

# Install root + backend deps
RUN npm ci --workspace=apps/backend 2>/dev/null || true
RUN cd apps/backend && npm ci

# Copy source
COPY apps/backend ./apps/backend

# Generate Prisma client + build NestJS
WORKDIR /app/apps/backend
RUN npx prisma generate
RUN npm run build

# ─── Production image ───────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/apps/backend/package.json ./package.json
COPY --from=builder /app/apps/backend/prisma ./prisma

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
