FROM ubuntu:16.04

RUN apt-get update && \
	apt-get install -y \
	libboost-dev libboost-all-dev \
	libdb5.3++-dev \
	libminiupnpc-dev

WORKDIR /oculor

COPY oculord .
COPY start.sh .

RUN chmod +x start.sh

CMD [ "./start.sh" ]