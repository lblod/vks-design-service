import { expect, test } from 'vitest';
import { myapp } from '../app.ts';
import request from 'supertest';
test('can import the app', async () => {
  const response = await request(myapp).get('/hello');
  expect(response.status).toEqual(200);
});
