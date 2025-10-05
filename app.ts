import { app } from 'mu';
import type { Application } from 'express';

export const myapp: Application = app;
myapp.get('/hello', function (_req, res) {
  // throw new Error('asdfasfd');
  res.status(200);
  res.send({ response: 'Hello mu-javascript-template' });
});
myapp.get('/designs', function (_req, res) {
  res.status(200);
  res.send({ response: 'Hello mu-javascript-template' });
});
