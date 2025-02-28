# Use an official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy the application source code
COPY . .

# Expose gRPC (50051) and HTTP (3000) ports
EXPOSE 50051 3000

# Start the gRPC server and HTTP client
CMD ["node", "server.js"]
