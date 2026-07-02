import z from 'zod';
import { MEASURE_CONCEPT_TYPE, measureConceptSchema } from './measure-concept';
import {
  VARIABLE_INSTANCE_TYPE,
  variableInstanceSchema,
} from './variable-instance';
import { TRAFFIC_SIGNAL_TYPE, trafficSignalSchema } from './traffic-signal';
import {
  TRAFFIC_SIGNAL_CONCEPT_TYPE,
  trafficSignalConceptSchema,
} from './traffic-signal-concept';
import {
  jsonApiManyRelationshipData,
  jsonApiRelationshipData,
  jsonApiResourceObject,
} from '../jsonapi-schema';

export const MEASURE_DESIGN_TYPE = 'measure-designs';
export const measureDesignSchema = z.strictObject({
  uri: z.string(),
  id: z.string(),
  measureConcept: measureConceptSchema,
  variableInstances: z.array(variableInstanceSchema).default([]),
  trafficSignals: z.array(trafficSignalSchema).default([]),
  unusedSignalConcepts: z.array(trafficSignalConceptSchema).default([]),
  unIncludedSignalConcepts: z.array(trafficSignalConceptSchema).default([]),
});

export type MeasureDesign = z.infer<typeof measureDesignSchema>;
export const measureDesignJsonSchema = jsonApiResourceObject({
  type: MEASURE_DESIGN_TYPE,
  attributes: measureDesignSchema.omit({
    measureConcept: true,
    variableInstances: true,
    trafficSignals: true,
    unusedSignalConcepts: true,
    unIncludedSignalConcepts: true,
  }),
  relationships: z.object({
    measureConcept: jsonApiRelationshipData(MEASURE_CONCEPT_TYPE),
    variableInstances: jsonApiManyRelationshipData(VARIABLE_INSTANCE_TYPE),
    trafficSignals: jsonApiManyRelationshipData(TRAFFIC_SIGNAL_TYPE),
    unusedSignalConcepts: jsonApiManyRelationshipData(
      TRAFFIC_SIGNAL_CONCEPT_TYPE,
    ),
    unIncludedSignalConcepts: jsonApiManyRelationshipData(
      TRAFFIC_SIGNAL_CONCEPT_TYPE,
    ),
  }),
});
