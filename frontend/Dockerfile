# ====== Build Stage ======
FROM node:20-alpine AS build-stage
WORKDIR /app

# 复制 package.json 利用缓存
COPY package*.json ./
RUN npm install --quiet

# 复制源码并构建
COPY . .
RUN npm run build

# ====== Production Stage ======
FROM nginx:alpine

# 复制构建产物
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制自定义 Nginx 配置 (支持 SPA 路由)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
