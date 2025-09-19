# Clean approach - all dependencies in package.json
FROM node:22-slim

# Install system dependencies
RUN apt-get update && apt-get install -y curl build-essential python3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy everything
COPY . .

# Install backend dependencies (all dependencies now in package.json)
WORKDIR /app/backend
RUN npm ci

# Build backend
RUN npm run build

# Install frontend dependencies and build
WORKDIR /app/frontend  
RUN npm ci
RUN npm run build

# Return to app root and set up production structure
WORKDIR /app

# Create production structure
RUN mkdir -p production/dist production/public/frontend

# Copy built files
RUN cp -r backend/dist/* production/dist/
RUN cp -r frontend/dist/* production/public/frontend/
RUN cp backend/package*.json production/

# Install only production dependencies in the production directory
WORKDIR /app/production
RUN npm install --omit=dev

# Clean up source files and dev dependencies
WORKDIR /app
RUN rm -rf backend frontend node_modules

# Move production files to app root
RUN cp -r production/* .
RUN rm -rf production

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