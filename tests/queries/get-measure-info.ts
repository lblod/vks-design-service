import { beforeEach, describe, expect } from 'vitest';
import { seedDB } from '../db-utils';
import { dbtest } from '../test-setup';
import { mockMowMeasure } from '../fixtures/mock-mow-measure';
import { getMeasureInfo } from '../../lib/queries/get-measure-info';
describe('/designs route', () => {
  beforeEach(async () => seedDB(mockMowMeasure));
  dbtest('featching a measure concept returns the right info', async () => {
    const response = await getMeasureInfo(
      'http://data.lblod.info/traffic-measure-concepts/61C04A18E324910008000067',
    );
    expect(response?.html).toEqual(
      '${locatie} \n${C43}.\n${locatie2} \nhet einde van de opgelegde snelheidsbeperking wordt aangeduid. ',
    );
  });
});
