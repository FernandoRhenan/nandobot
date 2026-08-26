#!/bin/bash

set -e

docker compose --env-file /app/.env.production -f /app/compose.prod.yaml down

docker image rm SUA_TAG_DO_NEXTJS_NO_DOCKERHUB SUA_TAG_DO_NGINX_NO_DOCKERHUB

docker compose --env-file /app/.env.production -f /app/compose.prod.yaml up -d
docker ps
