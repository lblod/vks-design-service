import { describe, expect, beforeEach } from 'vitest';
import { seedDB } from '../db-utils';
import { dbtest } from '../test-setup';
import { signalisationDesignWithMeasure } from '../fixtures/signalisation-design-with-measure';
import { getARDesigns } from '../../lib/queries/ar-designs';

describe('get all designs', () => {
  beforeEach(async () => {
    await seedDB(signalisationDesignWithMeasure);
  });
  dbtest(`gets a result`, async () => {
    const result = await getARDesigns();
    expect(result).toBeTruthy();
  });
  dbtest('gets a valid sparql result', async () => {
    const result = await getARDesigns();

    expect(result).toHaveLength(1);
  });
});
