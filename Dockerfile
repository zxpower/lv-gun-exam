# Build stage
FROM node:24-alpine AS builder

WORKDIR /app
COPY web/package.json web/package-lock.json ./
RUN npm ci

COPY web/ ./
COPY questions.json ./public/
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html
COPY web/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
