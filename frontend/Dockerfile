FROM node:22 AS build
WORKDIR /web
COPY package*.json ./
RUN npm ci
COPY . .
ENV VITE_USE_MOCK_API=false
# VITE_API_BASE_URL intentionally unset -> relative /api/ URLs -> nginx proxy
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine
COPY --from=build /web/dist /usr/share/nginx/html
COPY default.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 8080