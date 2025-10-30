import z from 'zod';
import { measureConceptSchema } from './measure-concept';
import { variableInstanceSchema } from './variable-instance';
import { trafficSignalSchema } from './traffic-signal';

export const measureDesignSchema = z.strictObject({
  uri: z.string(),
  id: z.string(),
  measureConcept: measureConceptSchema,
  variableInstances: z.array(variableInstanceSchema).default([]),
  trafficSignals: z.array(trafficSignalSchema).default([]),
});

export type MeasureDesign = z.infer<typeof measureDesignSchema>;
