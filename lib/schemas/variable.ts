import z from 'zod';
import { isoStringToDate, stringToNumber } from '../utils/conversions.ts';
import { getMowEndpoint } from '../environment.ts';

export const stringToVariableValue = z.union([
  isoStringToDate,
  stringToNumber,
  z.string(),
]);
// Represents template variables, not signal variables
export const variableSchema = z.strictObject({
  uri: z.string(),
  id: z.string(),
  label: z.string(),
  type: z.string(),
  source: z.string().default(getMowEndpoint()),
  codelist: z.string().optional(),
  defaultValue: stringToVariableValue.optional(),
});

export type Variable = z.infer<typeof variableSchema>;
