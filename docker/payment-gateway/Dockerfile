FROM keymetrics/pm2:8-stretch

ARG BUILD_ENV

RUN apt-get update && \
	apt-get install -y \
	cron

WORKDIR /payment-gateway/

COPY package.json ./

ENV NPM_CONFIG_LOGLEVEL warn
ENV NODE_ENV ${BUILD_ENV}
RUN npm i

COPY ecosystem.config.js ./
COPY mail ./mail/
COPY bin ./bin/
COPY app.js ./
COPY src ./src/
COPY routes ./routes/
COPY models ./models/

ENV IS_DOCKER 1

# Configure crontab
RUN chmod +x /payment-gateway/src/jobs/index.js
COPY runCron.sh /runCron.sh
RUN chmod +x /runCron.sh
COPY gateway-cron /etc/cron.d/gateway-cron
RUN chmod 0644 /etc/cron.d/gateway-cron && \
	crontab /etc/cron.d/gateway-cron

COPY start.sh ./start.sh 
RUN chmod +x start.sh

EXPOSE 3000/tcp

CMD [ "./start.sh", "${BUILD_ENV}" ]