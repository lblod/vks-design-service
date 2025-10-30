import z from 'zod';
import {
  stringToDate,
  stringToNumber,
} from '../database-validation/sparql-value-schemas.ts';

export const stringToVariableValue = z.union([
  stringToDate,
  stringToNumber,
  z.string(),
]);
// Represents template variables, not signal variables
export const variableSchema = z.strictObject({
  uri: z.string(),
  id: z.string(),
  label: z.string(),
  type: z.string(),
  defaultValue: stringToVariableValue.optional(),
});

export type Variable = z.infer<typeof variableSchema>;
