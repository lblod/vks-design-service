import z from 'zod';
import { isoStringToDate } from '../utils/conversions.ts';
import {
  dateTimeValue,
  plainString,
  uriList,
  uriValue,
} from '../database-validation/sparql-value-schemas.ts';

export const arDesignSchema = z.strictObject({
  uri: z.string(),
  id: z.string(),
  date: isoStringToDate,
  name: z.string(),
  measureDesigns: z.array(z.string()).default([]), // list of uris (async relationship)
});
export const arDesignResult = z.strictObject({
  uri: uriValue,
  id: plainString,
  date: dateTimeValue,
  name: plainString,
  measureDesigns: uriList,
});

export type ArDesign = z.infer<typeof arDesignSchema>;
