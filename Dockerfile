# ==========================================
# 1. Base Stage (Install dependencies)
# ==========================================
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .

# ==========================================
# 2. Development Stage (Local Dev Setup)
# ==========================================
FROM base AS development
EXPOSE 3000 5001 5005
# Default command for development (starts concurrently)
CMD ["npm", "run", "dev"]

# ==========================================
# 3. Builder Stage (Compiles frontend for production)
# ==========================================
FROM base AS builder
# Set build environment to production
ENV NODE_ENV=production
RUN npm run build

# ==========================================
# 4. Production Frontend (Nginx serving React app)
# ==========================================
FROM nginx:1.25-alpine AS production-frontend
COPY --from=builder /app/build /usr/share/nginx/html
# Custom Nginx configuration for SPA routing and reverse-proxying API
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ==========================================
# 5. Production Backend (Express Server)
# ==========================================
FROM node:18-alpine AS production-backend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production --legacy-peer-deps
COPY server.js simple-server.js ./
# Copy other files backend might need (like public pictures)
COPY picture ./picture
EXPOSE 5001 5005
CMD ["node", "server.js"]
