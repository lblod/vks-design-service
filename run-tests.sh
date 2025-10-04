#! /usr/bin/env sh

PROJ_NAME=vlag-crud-tests
COMP="docker compose --project-name="$PROJ_NAME" -f ./test-app/docker-compose.yml"
$COMP down -t0

rm -rf ./test-app/data/db

$COMP up -d



$COMP exec -ti vlag-crud bash -c "cd /usr/src/app/app && chmod +x ./dotests.sh && ./dotests.sh"
# $COMP exec -ti vlag-crud bash 
