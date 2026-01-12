# ====== build stage ======
FROM node:20-alpine AS build
WORKDIR /app

# Reduce npm memory usage
ENV NODE_OPTIONS="--max-old-space-size=512"
ENV npm_config_jobs=1

# Copy package.json only
COPY package.json ./

# Create minimal package.json with only essential dependencies
RUN node -e " \
  const pkg = require('./package.json'); \
  const essentialDeps = { \
    'react': pkg.dependencies['react'], \
    'react-dom': pkg.dependencies['react-dom'], \
    'react-router-dom': pkg.dependencies['react-router-dom'], \
    'lucide-react': pkg.dependencies['lucide-react'], \
    'clsx': pkg.dependencies['clsx'], \
    'tailwind-merge': pkg.dependencies['tailwind-merge'], \
    'class-variance-authority': pkg.dependencies['class-variance-authority'], \
    '@radix-ui/react-slot': pkg.dependencies['@radix-ui/react-slot'], \
    'tailwindcss-animate': pkg.dependencies['tailwindcss-animate'] \
  }; \
  const essentialDevDeps = { \
    '@vitejs/plugin-react': '^4.2.1', \
    'autoprefixer': pkg.devDependencies['autoprefixer'], \
    'postcss': pkg.devDependencies['postcss'], \
    'tailwindcss': pkg.devDependencies['tailwindcss'], \
    'typescript': pkg.devDependencies['typescript'], \
    'vite': pkg.devDependencies['vite'], \
    '@types/react': pkg.devDependencies['@types/react'], \
    '@types/react-dom': pkg.devDependencies['@types/react-dom'], \
    '@types/node': pkg.devDependencies['@types/node'] \
  }; \
  pkg.dependencies = essentialDeps; \
  pkg.devDependencies = essentialDevDeps; \
  require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2)); \
"

# Install minimal dependencies
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy source code
COPY . .

# Update vite config to use standard React plugin
RUN sed -i 's/@vitejs\/plugin-react-swc/@vitejs\/plugin-react/g' vite.config.ts

# Remove lovable-tagger from vite config (not needed for prod)
RUN sed -i '/lovable-tagger/d' vite.config.ts
RUN sed -i 's/mode === "development" && componentTagger()/false/g' vite.config.ts

# Build
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
