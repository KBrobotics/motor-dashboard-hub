# ====== build stage ======
FROM node:20-bullseye AS build
WORKDIR /app

# Increase Node memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copy package files
COPY package*.json ./

# Replace SWC plugin with standard React plugin (SWC has ARM compatibility issues)
RUN sed -i 's/"@vitejs\/plugin-react-swc": "[^"]*"/"@vitejs\/plugin-react": "^4.2.1"/g' package.json

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Update vite config to use standard React plugin
RUN sed -i 's/@vitejs\/plugin-react-swc/@vitejs\/plugin-react/g' vite.config.ts

# Build Vite (generates /dist)
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
'  location / {' \
'    try_files $uri $uri/ /index.html;' \
'  }' \
'}' \
> /etc/nginx/conf.d/app.conf

# Static files from build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
