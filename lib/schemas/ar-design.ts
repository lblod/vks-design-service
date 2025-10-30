import z from 'zod';
import { stringToDate } from '../database-validation/sparql-value-schemas';

export const arDesignSchema = z.strictObject({
  uri: z.string(),
  id: z.string(),
  date: stringToDate,
  name: z.string(),
  measureDesigns: z.array(z.string()).default([]), // list of uris (async relationship)
});

export type ArDesign = z.infer<typeof arDesignSchema>;
