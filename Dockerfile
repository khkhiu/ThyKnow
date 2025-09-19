# Multi-stage build for optimal production image
FROM node:22-slim AS builder

# Install system dependencies needed for building
RUN apt-get update && apt-get install -y curl build-essential python3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install all dependencies (including dev dependencies for building)
WORKDIR /app/backend
RUN npm ci

WORKDIR /app/frontend  
RUN npm ci

# Copy source code
WORKDIR /app
COPY . .

# Build backend
WORKDIR /app/backend
RUN npm run build

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Verify builds completed successfully
RUN ls -la /app/backend/dist/
RUN ls -la /app/frontend/dist/

# Production stage
FROM node:22-slim AS production

# Install only runtime system dependencies
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend package.json for production dependencies
COPY backend/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Create the expected directory structure
# The server expects files in /app/dist/frontend/
RUN mkdir -p dist/frontend

# Copy built files from builder stage
COPY --from=builder /app/backend/dist/ ./dist/
COPY --from=builder /app/frontend/dist/ ./dist/frontend/

# Verify the files are in the expected locations
RUN ls -la /app/dist/
RUN ls -la /app/dist/frontend/
RUN test -f /app/dist/frontend/index.html || (echo "ERROR: index.html not found" && exit 1)

# Create non-root user for security
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