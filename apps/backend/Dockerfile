FROM node:20-alpine AS builder
WORKDIR /app

# Prisma requires OpenSSL on Alpine
RUN apk add --no-cache openssl

# Build context is apps/backend/ — copy files directly
COPY package*.json ./
COPY prisma ./prisma

# Install all deps
RUN npm install

# Copy remaining source
COPY . .

# Generate Prisma client + build NestJS
RUN npx prisma generate
RUN npm run build

# ─── Production image ───────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Prisma migrate deploy also needs OpenSSL at runtime
RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
