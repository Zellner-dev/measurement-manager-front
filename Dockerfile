# ---- Build ----
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite embute VITE_* no build; quando passado, sobrescreve o valor do .env
ARG VITE_API_URL
RUN if [ -n "$VITE_API_URL" ]; then export VITE_API_URL; fi && npm run build

# ---- Serve ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY --chmod=755 docker/40-runtime-env.sh /docker-entrypoint.d/40-runtime-env.sh

EXPOSE 2004
CMD ["nginx", "-g", "daemon off;"]