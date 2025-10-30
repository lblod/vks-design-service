import z from 'zod';

// Represents template variables, not signal variables
export const variableSchema = z.strictObject({
  uri: z.string(),
  id: z.string(),
  label: z.string(),
  type: z.string(),
  defaultValue: z.unknown(),
});

export type Variable = z.infer<typeof variableSchema>;
