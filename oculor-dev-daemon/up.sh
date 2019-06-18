#!/bin/sh
docker build -t oculor docker/
docker run -ti -v $(realpath ./oculor_data):/oculor/oculor_data -p 48844:48844 oculor $@
