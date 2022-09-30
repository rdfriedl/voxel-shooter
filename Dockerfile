# syntax=docker/dockerfile:1
FROM node:18-alpine

WORKDIR /app
COPY ["package.json", "yarn.lock", "./"]

ENV NODE_ENV=development
RUN yarn install
COPY . .
RUN yarn build

RUN yarn install
ENV NODE_ENV=production
CMD ["node", "dist/server/index.js"]
