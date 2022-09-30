# syntax=docker/dockerfile:1
FROM node:18-alpine

ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "yarn.lock", "./"]

RUN yarn install
COPY . .
RUN yarn build

CMD ["node", "dist/server/index.js"]
