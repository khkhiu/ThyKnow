FROM node:20-slim

# Install required packages
RUN apt-get update && apt-get install -y \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Create the project structure Firebase expects
WORKDIR /app
RUN mkdir -p functions

# Set up functions directory
WORKDIR /app/functions

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

# Build TypeScript
RUN npm run build

# Return to project root to create config files
WORKDIR /app

# Create firebase.json 
RUN echo '{"functions": {"source": "functions"}}' > firebase.json

# Create simple .firebaserc
RUN echo '{"projects": {"default": "kt-backend-a5250"}}' > .firebaserc

# Create .runtimeconfig.json for environment variables
WORKDIR /app/functions
RUN echo '{"telegram":{"token":"${TELEGRAM_BOT_TOKEN}"},"project":{"id":"kt-backend-a5250"}}' > .runtimeconfig.json

# Create a startup script
RUN echo '#!/bin/bash\nport=${PORT:-8080}\necho "Starting HTTP server on port $port for health checks"\n\n# Replace placeholder with actual token\nsed -i "s/\${TELEGRAM_BOT_TOKEN}/$TELEGRAM_BOT_TOKEN/g" /app/functions/.runtimeconfig.json\n\n# Start health check server\n(while true; do { echo -e "HTTP/1.1 200 OK\r\n\r\nHealthy"; } | nc -l -p $port; done) &\n\n# Start Firebase emulator\nfirebase emulators:start --only functions --project kt-backend-a5250' > /app/start.sh && \
    chmod +x /app/start.sh

# Use the startup script
CMD ["/app/start.sh"]