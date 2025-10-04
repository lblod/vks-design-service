import { app } from 'mu';
import type { Application } from 'express';
import { Application as KApp, jsonApiExpress } from 'kurier';
import { Design, DesignProcessor } from './lib/resources/design';

const kurierApp = new KApp({
  namespace: 'api',
  types: [Design],
  processors: [DesignProcessor],
  defaultProcessor: DesignProcessor,
});
export const myapp: Application = app;
myapp.get('/hello', function (_req, res) {
  // throw new Error('asdfasfd');
  res.status(200);
  res.send({ response: 'Hello mu-javascript-template' });
});
myapp.use(jsonApiExpress(kurierApp));
