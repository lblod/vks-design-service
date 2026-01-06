import z from 'zod';

export const measureConceptSchema = z.strictObject({
  uri: z.string(),
  id: z.string(),
  label: z.string(),
  templateString: z.string(),
  rawTemplateString: z.string(),
  variables: z.array(z.string()),
  signalConcepts: z.array(z.string()).default([]),
});

export type MeasureConcept = z.infer<typeof measureConceptSchema>;
