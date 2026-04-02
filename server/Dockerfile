# Stage 1: build
FROM node:24-alpine AS build
WORKDIR /src

COPY package*.json tsconfig.json ./
RUN npm install
COPY ./src ./src
RUN npm run build

# Stage 2: production
FROM node:24-alpine
WORKDIR /src

COPY package*.json ./
RUN npm install --production

COPY --from=build /src/dist ./dist

EXPOSE 3001
CMD ["node", "dist/index.js"]