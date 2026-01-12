# ====== build stage ======
# Use a larger node image with more memory for npm install
FROM node:20-bullseye AS build
WORKDIR /app

# Increase Node memory limit for large dependency installs
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to avoid conflicts
# Use --ignore-scripts to skip native binary compilation issues
RUN npm install --legacy-peer-deps --ignore-scripts

# Rebuild only necessary native modules
RUN npm rebuild

# Copy source code
COPY . .

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
'  # SPA routing: serve index.html for unknown routes' \
'  location / {' \
'    try_files $uri $uri/ /index.html;' \
'  }' \
'}' \
> /etc/nginx/conf.d/app.conf

# Static files from build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
