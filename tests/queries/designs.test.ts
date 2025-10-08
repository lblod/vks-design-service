import { describe, expect, beforeEach } from 'vitest';
import { seedDB } from '../db-utils';
import { getAllDesigns } from '../../lib/queries/get-all-designs';
import { dbtest } from '../test-setup';
import { signalisationDesignWithMeasure } from '../fixtures/signalisation-design-with-measure';

describe('get all designs', () => {
  beforeEach(async () => {
    await seedDB(signalisationDesignWithMeasure);
  });
  dbtest(`gets a result`, async () => {
    const result = await getAllDesigns();
    expect(result).toBeTruthy();
  });
  dbtest('gets a valid sparql result', async () => {
    const result = await getAllDesigns();

    expect(result).toHaveLength(1);
  });
});
