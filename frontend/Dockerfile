# ====== Build Stage ======
FROM node:20-slim AS build-stage
WORKDIR /app

# Enable pnpm if needed, but here we use npm for simplicity as per existing package.json
# Using corepack to enable pnpm if it's preferred
# RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# ====== Run Stage ======
FROM nginx:stable-alpine

# Copy the build output to Nginx's default public directory
# Ant Design Pro/Umi builds to 'dist' by default
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration to handle SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
