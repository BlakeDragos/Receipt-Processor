# Use official Node.js LTS image
FROM node:22

# Set working directory in container
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the server
CMD [ "node", "app.js" ]