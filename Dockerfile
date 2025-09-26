ARG NODE_VERSION=22.15.0

FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --verbose

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist/rd-admin-tool/browser /usr/share/nginx/html

COPY /scripts/robots.txt /usr/share/nginx/html/robots.txt

COPY /scripts/default.conf /etc/nginx/conf.d/default.conf

COPY /scripts/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
