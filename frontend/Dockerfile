# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY frontend/ ./

# Expose the development server port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
