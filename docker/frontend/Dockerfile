FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY frontend/package.json frontend/package-lock.json* ./

# Install all dependencies (including dev dependencies for development)
RUN npm ci --silent

# Copy source code
COPY frontend/ ./

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]