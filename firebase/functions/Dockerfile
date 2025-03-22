FROM node:20-slim

WORKDIR /app

# Install Firebase Tools globally
RUN npm install -g firebase-tools

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src
COPY tsconfig*.json ./
COPY .eslintrc.js ./
COPY scripts ./scripts

# Build TypeScript
RUN npm run build

# Expose port 8080 for health checks
EXPOSE 8080

# Create a simple health check script
RUN echo '#!/bin/bash\nport=${PORT:-8080}\necho "Starting HTTP server on port $port for health checks"\nwhile true; do { echo -e "HTTP/1.1 200 OK\r\n\r\nHealthy"; } | nc -l -p $port; done &\nnpm run serve' > /app/start.sh && \
    chmod +x /app/start.sh

# Use the startup script
CMD ["/app/start.sh"]
