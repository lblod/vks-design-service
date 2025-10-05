import request from 'supertest';
import { describe, expect, test } from 'vitest';
import { myapp } from '../../app';
import * as z from 'zod';
import { validate } from '../validate-jsonapi';
const jsonApiResponse = z.object({
  data: z.array(z.object()),
});
describe('/designs route', () => {
  test('route exists', async () => {
    const response = await request(myapp).get('/designs');
    expect(response.statusCode).toEqual(200);
  });
  test('route returns valid jsonApi response', async () => {
    const response = await request(myapp).get('/designs');
    const body = response.body;
    expect(response.statusCode).toEqual(200);
    expect(validate(body)).toBeTruthy();
  });
});
