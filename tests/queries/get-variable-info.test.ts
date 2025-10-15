import { beforeEach, describe, expect } from 'vitest';
import { seedDB } from '../db-utils';
import { dbtest } from '../test-setup';
import { mockMowMeasure } from '../fixtures/mock-mow-measure';
import { getVariableDetailsByUris } from '../../lib/queries/variables';
describe('get-variable-info', () => {
  beforeEach(async () => {
    return seedDB(mockMowMeasure);
  });

  dbtest(
    'fetching a variable returns the right info',
    async () => {
      const response = await getVariableDetailsByUris([
        'http://data.lblod.info/mappings/61C04A1AE32491000800006D',
      ]);
      expect(response?.[0]?.title.value).toEqual('C43');
    },
    30000,
  );
  dbtest(
    'fetching a variable returns the right info',
    async () => {
      const response = await getVariableDetailsByUris([
        'http://data.lblod.info/mappings/61C04A1AE32491000800006E',
        'http://data.lblod.info/mappings/61C04A19E32491000800006C',
        'http://data.lblod.info/mappings/61C04A1AE32491000800006D',
        'http://data.lblod.info/mappings/61C04D87E32491000800009A',
      ]);
      expect(response).toHaveLength(4);
    },
    30000,
  );
});
