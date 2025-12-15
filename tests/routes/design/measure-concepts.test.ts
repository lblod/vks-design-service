import request from 'supertest';
import { beforeEach, describe, expect } from 'vitest';
import { myapp } from '../../../app.ts';
import { validate } from '../../validate-jsonapi.ts';
import { seedDB } from '../../db-utils.ts';
import { dbtest } from '../../test-setup.ts';
import { signalisationDesignWithMeasure } from '../../fixtures/signalisation-design-with-measure.ts';
import { mockMowMeasure } from '../../fixtures/mock-mow-measure.ts';
describe('/ar-designs/:id/measures-concepts route', () => {
  beforeEach(async () =>
    seedDB([signalisationDesignWithMeasure, ...mockMowMeasure]),
  );

  dbtest('route returns 404 with invalid id', async () => {
    const response = await request(myapp).get(
      '/ar-designs/00invalid00/measure-concepts',
    );
    expect(response.statusCode).toEqual(404);
  });
  dbtest('route exists if given valid id', async () => {
    const response = await request(myapp).get(
      '/ar-designs/f9d96c3cba89ed71e9441d929095b7cf/measure-designs',
    );
    expect(response.statusCode).toEqual(200);
  });

  dbtest('route returns valid jsonApi response', async () => {
    const response = await request(myapp).get(
      '/ar-designs/f9d96c3cba89ed71e9441d929095b7cf/measure-designs',
    );
    const body = response.body;
    expect(response.statusCode).toEqual(200);
    const valid = validate(body);
    expect(valid, JSON.stringify(validate.errors, undefined, 2)).toBeTruthy();
  });
});
