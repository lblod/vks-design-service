import request from 'supertest';
import { beforeEach, describe, expect } from 'vitest';
import { myapp } from '../../app';
import { validate } from '../validate-jsonapi';
import { seedDB } from '../db-utils';
import { oneDesignWithSigns } from '../fixtures/one-design-with-signs';
import { dbtest } from '../test-setup';
describe('/designs route', () => {
  beforeEach(async () => seedDB(oneDesignWithSigns));
  dbtest('route exists', async () => {
    const response = await request(myapp).get('/designs');
    expect(response.statusCode).toEqual(200);
  });
  dbtest('route returns valid jsonApi response', async () => {
    const response = await request(myapp).get('/designs');
    const body = response.body;
    expect(response.statusCode).toEqual(200);
    const valid = validate(body);
    expect(valid, JSON.stringify(validate.errors, undefined, 2)).toBeTruthy();
  });
});
