import request from 'supertest';
import { beforeEach, describe, expect } from 'vitest';
import { myapp } from '../../app';
import { validate } from '../validate-jsonapi';
import { seedDB } from '../db-utils';
import { dbtest } from '../test-setup';
import { signalisationDesignWithMeasure } from '../fixtures/signalisation-design-with-measure';
describe('/ar-designs route', () => {
  beforeEach(async () => seedDB(signalisationDesignWithMeasure));
  dbtest('route exists', async () => {
    const response = await request(myapp).get('/ar-designs');
    expect(response.statusCode).toEqual(200);
  });
  dbtest('route returns valid jsonApi response', async () => {
    const response = await request(myapp).get('/ar-designs');
    const body = response.body;
    expect(response.statusCode).toEqual(200);
    const valid = validate(body);
    expect(valid, JSON.stringify(validate.errors, undefined, 2)).toBeTruthy();
  });
});
