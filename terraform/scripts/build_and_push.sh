#!/bin/bash
# Build and push Docker image for ThyKnow to Artifact Registry

set -e

# Check if required environment variables are set
if [ -z "$PROJECT_ID" ]; then
    echo "ERROR: PROJECT_ID environment variable is not set."
    echo "Please set it using: export PROJECT_ID=your-gcp-project-id"
    exit 1
fi

if [ -z "$REGION" ]; then
    echo "ERROR: REGION environment variable is not set."
    echo "Please set it using: export REGION=us-central1"
    exit 1
fi

# Navigate to project root (one level up from terraform directory)
cd ..

# Build the Docker image
echo "Building Docker image..."
docker build -t "thyknow-express:latest" -f firebase/Dockerfile firebase/

# Tag the image for Artifact Registry
REPO_PATH="${REGION}-docker.pkg.dev/${PROJECT_ID}/thyknow"
docker tag "thyknow-express:latest" "${REPO_PATH}/thyknow-express:latest"

# Configure Docker for Artifact Registry authentication
echo "Configuring Docker for Artifact Registry..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

# Push the image to Artifact Registry
echo "Pushing image to Artifact Registry..."
docker push "${REPO_PATH}/thyknow-express:latest"

echo "Image successfully built and pushed to: ${REPO_PATH}/thyknow-express:latest"
echo "You can now run 'terraform apply' to deploy the infrastructure."