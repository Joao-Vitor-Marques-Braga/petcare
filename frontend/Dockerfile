# ==========================================
# Multi-stage Dockerfile para Frontend (React + Vite + Nginx)
# ==========================================

# 1. Builder Stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./

# Build da aplicação SPA
RUN npm run build

# 2. Production Web Server Stage
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
