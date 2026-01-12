# ====== build stage ======
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json ./

# Strip down to minimal dependencies (like InfoKiosk)
RUN node -e " \
  const pkg = require('./package.json'); \
  pkg.dependencies = { \
    'react': '^18.3.1', \
    'react-dom': '^18.3.1', \
    'react-router-dom': '^6.30.1', \
    'lucide-react': '^0.462.0' \
  }; \
  pkg.devDependencies = { \
    '@vitejs/plugin-react': '^4.2.1', \
    '@types/react': '^18.3.23', \
    '@types/react-dom': '^18.3.7', \
    '@types/node': '^22.16.5', \
    'autoprefixer': '^10.4.21', \
    'postcss': '^8.5.6', \
    'tailwindcss': '^3.4.17', \
    'typescript': '^5.8.3', \
    'vite': '^5.4.19' \
  }; \
  require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2)); \
"

RUN npm install

COPY . .
RUN npm run build

# ====== runtime stage ======
FROM nginx:alpine

RUN rm -f /etc/nginx/conf.d/default.conf && \
    printf '%s\n' \
'server {' \
'  listen 80;' \
'  server_name _;' \
'  root /usr/share/nginx/html;' \
'  index index.html;' \
'  location / {' \
'    try_files $uri $uri/ /index.html;' \
'  }' \
'}' \
> /etc/nginx/conf.d/app.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
