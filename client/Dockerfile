# Build stage
FROM node:24-alpine AS build
WORKDIR /src

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:24-alpine
WORKDIR /src
RUN npm install -g serve
COPY --from=build /src/dist ./dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
