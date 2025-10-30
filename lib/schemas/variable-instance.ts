import z from 'zod';
import { variableSchema } from './variable';

export const variableInstanceSchema = z.strictObject({
  uri: z.string(), // generated on-the-fly
  id: z.string(), // generated on-the-fly
  value: z.unknown(),
  variable: variableSchema,
});

export type VariableInstance = z.infer<typeof variableInstanceSchema>;
