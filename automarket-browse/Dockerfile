# Stage 1: Build the Vite app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Set build-time env variables
ARG VITE_API_BASE_URL
ARG VITE_LANDING_URL
ARG VITE_DASHBOARD_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_LANDING_URL=$VITE_LANDING_URL
ENV VITE_DASHBOARD_URL=$VITE_DASHBOARD_URL

# Build the Vite app
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:stable-alpine

# Copy built files to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 