# Multi-stage build for ThyKnow monorepo
FROM node:25-slim AS base

# Set working directory
WORKDIR /app

# Copy root package files
COPY package*.json ./

#################################################################
# Frontend Build Stage
#################################################################
FROM base AS frontend-builder

# Copy frontend source
COPY frontend/ ./frontend/

# Install dependencies and build frontend
WORKDIR /app/frontend
RUN npm ci
RUN npm run build

#################################################################
# Backend Build Stage  
#################################################################
FROM base AS backend-builder

# Copy backend source
COPY backend/ ./backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci

# Build TypeScript backend
RUN npm run build

#################################################################
# Production Stage
#################################################################
FROM node:25-slim AS production

WORKDIR /app

# Copy backend package files and install production dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy built backend from builder stage
COPY --from=backend-builder /app/backend/dist ./dist

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/frontend/dist ./public/frontend

# Copy any additional backend static files if needed
COPY --from=backend-builder /app/backend/public ./public

# Create a non-root user for security
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