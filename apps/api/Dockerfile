FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Copy root package.json (needed for workspaces)
COPY package.json package-lock.json* ./

# Copy only the api package.json
COPY apps/api/package.json ./apps/api/package.json

# Install only api dependencies (ignore other workspaces)
RUN npm install --workspace=apps/api --ignore-scripts

# Copy api source
COPY apps/api ./apps/api

# Generate prisma client and build
RUN cd apps/api && npx prisma generate && npx nest build

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["node", "dist/main"]
