# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy all frontend source code
COPY . .

# Expose port 8080 for the frontend web server
EXPOSE 8080

# Start the frontend Express server
CMD ["node", "server.js"]
