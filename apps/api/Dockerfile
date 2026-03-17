FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app/apps/api

COPY apps/api/package.json ./

RUN npm install

COPY apps/api ./

RUN npx prisma generate
RUN npx nest build

EXPOSE 3000

CMD ["node", "dist/main"]
