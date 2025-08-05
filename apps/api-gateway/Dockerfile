# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set the working directory to the project root
WORKDIR /app

# Copy the entire monorepo to build the app
COPY . .
RUN npm install

# Build the specific app (api-gateway)
# This assumes you have a "build" script in your root package.json
# that can build individual apps, e.g., "build": "nest build"
RUN npm run build api-gateway

# Stage 2: Create the final production image
FROM node:18-alpine

WORKDIR /app

# Copy the root package.json and lock file for production dependencies
COPY package.json ./
COPY package-lock.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the build output for the api-gateway app from the builder stage
COPY --from=builder /app/dist/apps/api-gateway ./dist

# The command to run the application
CMD [ "node", "dist/main" ]