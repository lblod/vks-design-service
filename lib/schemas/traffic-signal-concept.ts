import z from 'zod';

export const trafficSignalConceptSchema = z.strictObject({
  uri: z.string(),
  id: z.string(),
  meaning: z.string(),
  code: z.string(),
});
