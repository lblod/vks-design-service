import { beforeAll, describe, expect, it } from 'vitest';
import { waitForDB, wipeDB } from '../db-utils';
import { update } from 'mu';
import { getAllDesigns } from '../../lib/queries/get-all-designs';
import { oneDesignWithSigns } from '../fixtures/one-design-with-signs';

describe('get all designs', () => {
  beforeAll(async () => {
    await waitForDB();
    await wipeDB();
    await update(`INSERT DATA { ${oneDesignWithSigns} }`);
  }, 50000);
  it(`gets a result`, async () => {
    const result = await getAllDesigns();
    expect(result).toBeTruthy();
  });
  it('gets a valid sparql result', async () => {
    const result = await getAllDesigns();
    expect(result).toHaveLength(1);
  });
  it('has contained signs', async () => {
    const result = await getAllDesigns();
    expect(result[0]?.signs).toHaveLength(16);
  });
});
