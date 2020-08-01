#!/bin/bash
ENV_FILE=$(cd ./$(dirname ${BASH_SOURCE[0]}); pwd )
source $ENV_FILE/.env
_APP_NAME=$APP_NAME
APP_NAME=${_APP_NAME:-"deno_server"}

# 停止已有容器
docker rm -f ${APP_NAME}

# 构建新镜像
docker build -t ${APP_NAME} .

# 启动新容器
docker run -it -p 1998:1994 --name ${APP_NAME} --restart always ${APP_NAME}
