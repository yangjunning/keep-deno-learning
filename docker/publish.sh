#!/bin/bash
ENV_FILE=$(cd ./$(dirname ${BASH_SOURCE[0]}); pwd )
source $ENV_FILE/.env
_APP_NAME=$APP_NAME
APP_NAME=${_APP_NAME:-"deno_server"}

# 停止已有容器
docker rm -f ${APP_NAME}
docker rm -f mongo

# 启动 mongo 容器
docker run -d \
  --restart always \
  --name mongo \
  -v mongo_configdb:/data/configdb \
  -v mongo_data:/data/db \
  -p 27017:27017 \
  mongo \
  --auth

# 构建新镜像
docker build -t ${APP_NAME} .

# 启动新容器
docker run -d \
  --restart always \
  --link mongo:mongo \
  -p 1998:1994 \
  --name ${APP_NAME} \
  ${APP_NAME}
