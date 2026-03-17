FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json

RUN npm ci --workspace=apps/api --ignore-scripts

COPY apps/api ./apps/api

RUN cd apps/api && npx prisma generate && npx nest build

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["node", "dist/main"]
