import z from 'zod';
import { trafficSignalConceptSchema } from './traffic-signal-concept';

export const trafficSignalSchema = z.strictObject({
  uri: z.string(),
  id: z.string(),
  trafficSignalConcept: trafficSignalConceptSchema,
});

export type TrafficSignal = z.infer<typeof trafficSignalSchema>;
