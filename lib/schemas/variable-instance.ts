import z from 'zod';
import { stringToVariableValue, variableSchema } from './variable.ts';

export const variableInstanceSchema = z.strictObject({
  uri: z.string(), // generated on-the-fly
  id: z.string(), // generated on-the-fly
  value: stringToVariableValue.optional(),
  variable: variableSchema,
});

export type VariableInstance = z.infer<typeof variableInstanceSchema>;
