FROM keymetrics/pm2:8-stretch

ARG BUILD_ENV

WORKDIR client-portal/

RUN npm i -g serve

COPY package.json ./

ENV NPM_CONFIG_LOGLEVEL warn
ENV NODE_ENV ${BUILD_ENV}
RUN npm i

COPY ecosystem.config.js ./
COPY public ./public/
COPY src ./src/

ENV IS_DOCKER 1

RUN npm run build

EXPOSE 3000/tcp
EXPOSE 3443/tcp

CMD [ "pm2-runtime", "start", "ecosystem.config.js", "--env", "${BUILD_ENV}" ]
