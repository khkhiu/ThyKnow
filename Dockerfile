# Dockerfile optimized for npm workspaces monorepo
FROM node:22-slim

# Install system dependencies
RUN apt-get update && apt-get install -y curl build-essential python3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files for dependency resolution
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install all dependencies using the monorepo root
# This handles workspace dependencies correctly
RUN npm install

# Copy source code after dependencies are installed
COPY . .

# Build backend using workspace command
RUN npm run build:backend

# Build frontend using workspace command  
RUN npm run build:frontend

# Create the expected directory structure for production
RUN mkdir -p dist/frontend

# Copy built files to expected locations
RUN cp -r backend/dist/* dist/
RUN cp -r frontend/dist/* dist/frontend/

# Verify critical files exist
RUN test -f dist/src/server.js || (echo "ERROR: Backend server.js missing!" && exit 1)
RUN test -f dist/frontend/index.html || (echo "ERROR: Frontend index.html missing!" && exit 1)

# Clean up source files but keep built output and production dependencies
RUN rm -rf backend/src frontend/src

# Create non-root user
RUN groupadd -r thyknow && useradd -r -g thyknow thyknow
RUN chown -R thyknow:thyknow /app
USER thyknow

# Expose port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Start the application
CMD ["node", "dist/src/server.js"]