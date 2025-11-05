import z from 'zod';
import { isoStringToDate } from '../utils/conversions.ts';

export const arDesignSchema = z.strictObject({
  uri: z.string(),
  id: z.string(),
  date: isoStringToDate,
  name: z.string(),
  measureDesigns: z.array(z.string()).default([]), // list of uris (async relationship)
});

export type ArDesign = z.infer<typeof arDesignSchema>;
