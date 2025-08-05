# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set the working directory to the project root
WORKDIR /app

COPY . .
RUN npm install

# Build the specific app
# You need to have a build script in your root package.json
RUN npm run build auth

# Stage 2: Create the final production image
FROM node:18-alpine

WORKDIR /app

# Copy the root package.json and lock file for production dependencies
COPY package.json ./
COPY package-lock.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the build output for the specific app from the builder stage
# The 'dist' folder will be at the root of the project build context
COPY --from=builder /app/dist/apps/auth ./dist

CMD [ "node", "dist/main" ]