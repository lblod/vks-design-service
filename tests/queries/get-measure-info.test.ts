import { beforeEach, describe, expect } from 'vitest';
import { seedDB } from '../db-utils';
import { dbtest } from '../test-setup';
import { mockMowMeasure } from '../fixtures/mock-mow-measure';
import { getMeasureDetailsByUris } from '../../lib/queries/measures';
describe('get-measure-info', () => {
  beforeEach(async () => {
    return seedDB(mockMowMeasure);
  });

  dbtest(
    'fetching a measure concept returns the right info',
    async () => {
      const response = await getMeasureDetailsByUris([
        'http://data.lblod.info/traffic-measure-concepts/61C04A18E324910008000067',
      ]);
      expect(response[0]?.templateString.value).toEqual(
        '${locatie} \n${C43}.\n${locatie2} \nhet einde van de opgelegde snelheidsbeperking wordt aangeduid. ',
      );
    },
    30000,
  );
  dbtest(
    'fetching multiple measures return the right info',
    async () => {
      const response = await getMeasureDetailsByUris([
        'http://data.lblod.info/traffic-measure-concepts/61C04A18E324910008000067',
      ]);
      expect(response?.[0]?.templateString.value).toEqual(
        '${locatie} \n${C43}.\n${locatie2} \nhet einde van de opgelegde snelheidsbeperking wordt aangeduid. ',
      );
    },
    30000,
  );
});
