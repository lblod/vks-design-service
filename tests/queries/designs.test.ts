import { describe, expect, beforeEach } from 'vitest';
import { seedDB } from '../db-utils';
import { getAllDesigns } from '../../lib/queries/get-all-designs';
import { oneDesignWithSigns } from '../fixtures/one-design-with-signs';
import { dbtest } from '../test-setup';

describe('get all designs', () => {
  beforeEach(async () => {
    await seedDB(oneDesignWithSigns);
  });
  dbtest(`gets a result`, async () => {
    const result = await getAllDesigns();
    expect(result).toBeTruthy();
  });
  dbtest('gets a valid sparql result', async () => {
    const result = await getAllDesigns();

    expect(result).toHaveLength(1);
  });
  dbtest('has contained signs', async () => {
    const result = await getAllDesigns();
    expect(result[0]?.signs).toHaveLength(16);
  });
});
