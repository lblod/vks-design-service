import request from 'supertest';
import { beforeAll, describe, expect, test } from 'vitest';
import { myapp } from '../../app';
import { validate } from '../validate-jsonapi';
import { waitForDB, wipeDB } from '../db-utils';
import { update } from 'mu';
import { oneDesignWithSigns } from '../fixtures/one-design-with-signs';
describe('/designs route', () => {
  beforeAll(async () => {
    await waitForDB();
    await wipeDB();
    await update(`INSERT DATA { ${oneDesignWithSigns} }`);
  }, 50000);
  test('route exists', async () => {
    const response = await request(myapp).get('/designs');
    expect(response.statusCode).toEqual(200);
  }, 10000);
  test('route returns valid jsonApi response', async () => {
    const response = await request(myapp).get('/designs');
    const body = response.body;
    expect(response.statusCode).toEqual(200);
    const valid = validate(body);
    expect(valid, JSON.stringify(validate.errors, undefined, 2)).toBeTruthy();
  }, 10000);
});
