FROM keymetrics/pm2:8-stretch

ARG BUILD_ENV

WORKDIR /admin-panel/

RUN npm i -g serve

COPY admin-panel/start.sh /start.sh
RUN chmod +x /start.sh

COPY admin-panel/package.json ./

ENV NPM_CONFIG_LOGLEVEL warn
ENV NODE_ENV ${BUILD_ENV}
RUN npm i

COPY admin-panel/ecosystem.config.js ./
COPY admin-panel/public ./public/
COPY admin-panel/src ./src/

ENV IS_DOCKER 1

# Copy config & build
COPY config/admin.config.js ./src/systemConfig.js
RUN npm run build

EXPOSE 3000/tcp
EXPOSE 3443/tcp

CMD [ "/start.sh" ]