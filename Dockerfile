### Multi-stage Dockerfile at repo root

#### Client build stage
FROM node:22-alpine AS client-builder
WORKDIR /src

# Copy client package files and install deps
COPY client/package*.json ./
RUN npm ci --legacy-peer-deps || npm install

# Copy client source and build
COPY client/ .
RUN npm run build

#### Server stage
FROM node:22-alpine
WORKDIR /app

# Copy server package files and install production deps
COPY server/package*.json ./
RUN npm ci --only=production --legacy-peer-deps || npm install --production

# Copy server source
COPY server/ .

# Copy built client into a location the server expects: /client/dist
RUN mkdir -p /client/dist
COPY --from=client-builder /src/dist /client/dist

# Ensure uploads directory exists
RUN mkdir -p /app/uploads

ENV PORT=3001
EXPOSE 3001

# Use tini as an init process to properly forward signals and reap zombies
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index.js"]
