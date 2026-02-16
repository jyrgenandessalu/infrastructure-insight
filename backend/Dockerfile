# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the backend source code
COPY . .

# Expose port 5000 for the metrics API
EXPOSE 5000

# Start the backend server
CMD ["node", "server.js"]