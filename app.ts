import { app } from 'mu';

export const myapp = app;
myapp.get('/hello', function (_req, res) {
  // throw new Error('asdfasfd');
  res.status(200);
  res.send({ response: 'Hello mu-javascript-template' });
});
