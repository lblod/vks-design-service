cd /usr/src/app


./npm-install-dependencies.sh development install

cp -R /usr/src/app/helpers/mu /usr/src/app/app/node_modules/mu

cd /usr/src/app/app

npm run test
