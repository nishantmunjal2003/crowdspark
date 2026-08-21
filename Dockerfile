# Stage 1: Build the React client
FROM node:20-alpine AS client-builder
WORKDIR /app/client

# Declare build argument for Google Client ID (Vite bakes this at build time)
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Copy package files and install dependencies
COPY client/package*.json ./
RUN npm ci

# Copy the rest of the client source and build
COPY client/ ./
RUN npm run build

# Stage 2: Create the final production server image
FROM node:20-alpine AS production
WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy server package files and install production dependencies
COPY server/package*.json ./server/
RUN npm ci --omit=dev --prefix server

# Copy server source code
COPY server/ ./server/

# Copy built client assets from client-builder stage
COPY --from=client-builder /app/client/dist ./client/dist

# Expose port (default Express port is 3001)
EXPOSE 3001

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Run the server
CMD ["node", "server/index.js"]
