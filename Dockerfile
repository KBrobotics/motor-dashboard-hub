# ====== build stage ======
FROM node:20-alpine AS build
WORKDIR /app

# dependencies (npm install works without package-lock.json)
COPY package*.json ./
RUN npm install

# source code
COPY . .

# build Vite (generates /dist)
RUN npm run build

# ====== runtime stage ======
FROM nginx:alpine

# Nginx config for SPA (React) on port 80
RUN rm -f /etc/nginx/conf.d/default.conf && \
    printf '%s\n' \
'server {' \
'  listen 80;' \
'  server_name _;' \
'' \
'  root /usr/share/nginx/html;' \
'  index index.html;' \
'' \
'  # SPA routing: serve index.html for unknown routes' \
'  location / {' \
'    try_files $uri $uri/ /index.html;' \
'  }' \
'}' \
> /etc/nginx/conf.d/app.conf

# static files from build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
