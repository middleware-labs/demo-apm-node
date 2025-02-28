# Build stage
FROM node:10-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk --no-cache add build-base python3 && ln -sf python3 /usr/bin/python
RUN npm install

# Production stage
FROM node:10-alpine

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "--require", "./instrument.js", "index.js"]