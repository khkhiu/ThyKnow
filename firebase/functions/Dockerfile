FROM node:20-slim

WORKDIR /app

# Install required packages
RUN apt-get update && apt-get install -y \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Install Firebase Tools globally
RUN npm install -g firebase-tools

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/
COPY tsconfig*.json ./
COPY .eslintrc.js ./
COPY scripts/ ./scripts/

# Create firebase.json in the parent directory
WORKDIR /
RUN echo '{"functions": {"source": "app"}}' > firebase.json

# Create simple .firebaserc to identify the project
RUN echo '{"projects": {"default": "kt-backend-a5250"}}' > .firebaserc

# Return to app directory
WORKDIR /app

# Build TypeScript
RUN npm run build

# Create a simple HTTP server for health checks
RUN echo '#!/bin/bash\nport=${PORT:-8080}\necho "Starting HTTP server on port $port for health checks"\n(while true; do { echo -e "HTTP/1.1 200 OK\r\n\r\nHealthy"; } | nc -l -p $port; done) &\ncd /\nfirebase emulators:start --only functions --project kt-backend-a5250' > /app/start.sh && \
    chmod +x /app/start.sh

# Use the startup script
CMD ["/app/start.sh"]