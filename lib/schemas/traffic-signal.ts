import z from 'zod';
import {
  TRAFFIC_SIGNAL_CONCEPT_TYPE,
  trafficSignalConceptSchema,
} from './traffic-signal-concept';
import {
  jsonApiRelationshipData,
  jsonApiResourceObject,
} from '../jsonapi-schema';

export const TRAFFIC_SIGNAL_TYPE = 'traffic-signals' as const;
export const trafficSignalSchema = z.strictObject({
  uri: z.string(),
  id: z.string(),
  trafficSignalConcept: trafficSignalConceptSchema,
  designStatus: z.string().optional(),
});

export type TrafficSignal = z.infer<typeof trafficSignalSchema>;
export const trafficSignalJsonSchema = jsonApiResourceObject({
  type: TRAFFIC_SIGNAL_TYPE,
  attributes: trafficSignalSchema.omit({ trafficSignalConcept: true }),
  relationships: z.object({
    trafficSignalConcept: jsonApiRelationshipData(TRAFFIC_SIGNAL_CONCEPT_TYPE),
  }),
});

export function trafficSignalToJson(trafficSignal: TrafficSignal) {
  return trafficSignalJsonSchema.decode({
    type: TRAFFIC_SIGNAL_TYPE,
    id: trafficSignal.id,
    attributes: {
      uri: trafficSignal.uri,
      'design-status': trafficSignal.designStatus,
    },
    relationships: {
      'traffic-signal-concept': {
        data: {
          type: TRAFFIC_SIGNAL_CONCEPT_TYPE,
          id: trafficSignal.trafficSignalConcept.id,
        },
      },
    },
  });
}
