# Stage 1: build frontend
FROM node:20 AS build
WORKDIR /app

# Копируем package.json + package-lock (если есть)
COPY frontend/package*.json ./

# Установим зависимости (dev тоже)
RUN npm ci --legacy-peer-deps --unsafe-perm=true

# Копируем исходники фронта
COPY frontend/ ./

# Исправим права бинари и соберём
RUN if [ -d node_modules/.bin ]; then chmod -R a+rx node_modules/.bin || true; fi
RUN npx vite build

# Stage 2: nginx serve static + proxy
FROM nginx:1.27-alpine
# Копируем наш nginx-конфиг (deploy/nginx/default.conf)
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
# Копируем собранный фронт
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
