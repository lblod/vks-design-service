import request from 'supertest';
import { beforeEach, describe, expect } from 'vitest';
import { myapp } from '../../../app';
import { validate } from '../../validate-jsonapi';
import { seedDB } from '../../db-utils';
import { dbtest } from '../../test-setup';
import { signalisationDesignWithMeasure } from '../../fixtures/signalisation-design-with-measure';
describe('/design/:id/preview route', () => {
  beforeEach(async () => seedDB(signalisationDesignWithMeasure));

  dbtest('route returns 404 with invalid id', async () => {
    const response = await request(myapp).get('/design/00invalid00/preview');
    expect(response.statusCode).toEqual(404);
  });
  dbtest('route exists if given valid id', async () => {
    const response = await request(myapp).get(
      '/design/f9d96c3cba89ed71e9441d929095b7cf/preview',
    );
    expect(response.statusCode).toEqual(200);
  });

  dbtest('route returns valid jsonApi response', async () => {
    const response = await request(myapp).get(
      '/design/f9d96c3cba89ed71e9441d929095b7cf/preview',
    );
    const body = response.body;
    expect(response.statusCode).toEqual(200);
    const valid = validate(body);
    expect(valid, JSON.stringify(validate.errors, undefined, 2)).toBeTruthy();
  });
});
