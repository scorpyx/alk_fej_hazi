FROM node:25-alpine3.22

WORKDIR /app
COPY .postcssrc.json .postcssrc.json
COPY angular.json angular.json
COPY package.json package.json
COPY tailwind.config.js tailwind.config.js
COPY tsconfig.app.json tsconfig.app.json
COPY tsconfig.json tsconfig.json
COPY tsconfig.spec.json tsconfig.spec.json

COPY src/ src/

RUN npm install
RUN npm install -g @angular/cli

EXPOSE 8000

CMD ng serve --host 0.0.0.0 --port 8000