## ORIGINAL Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:20.15.0 as build-stage
WORKDIR /app
COPY package*.json /app/
RUN npm install
#
COPY ./ /app/

RUN npm run build -- --base-href=/biodiversity/
#
## Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.15
##Copy ci-dashboard-dist
COPY --from=build-stage app/dist/biodiversity-portal-fe/  /usr/share/nginx/html/biodiversity/
##Copy default nginx configuration
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf
