import z from 'zod';
import {
  MEASURE_CONCEPT_TYPE,
  measureConceptSchema,
  measureConceptToJson,
} from './measure-concept';
import {
  VARIABLE_INSTANCE_TYPE,
  variableInstanceSchema,
  variableInstanceWithIncludes,
} from './variable-instance';
import {
  TRAFFIC_SIGNAL_TYPE,
  trafficSignalSchema,
  trafficSignalWithIncludes,
} from './traffic-signal';
import {
  TRAFFIC_SIGNAL_CONCEPT_TYPE,
  trafficSignalConceptSchema,
  trafficSignalConceptWithIncludes,
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

export function measureDesignToJson(measureDesign: MeasureDesign) {
  return measureDesignJsonSchema.decode({
    type: MEASURE_DESIGN_TYPE,
    id: measureDesign.id,
    attributes: {
      uri: measureDesign.uri,
    },
    relationships: {
      'measure-concept': {
        data: {
          id: measureDesign.measureConcept.id,
          type: MEASURE_CONCEPT_TYPE,
        },
      },
      'traffic-signals': {
        data: measureDesign.trafficSignals.map((ts) => ({
          id: ts.id,
          type: TRAFFIC_SIGNAL_TYPE,
        })),
      },
      'un-included-signal-concepts': {
        data: measureDesign.unIncludedSignalConcepts.map((sc) => ({
          id: sc.id,
          type: TRAFFIC_SIGNAL_CONCEPT_TYPE,
        })),
      },
      'unused-signal-concepts': {
        data: measureDesign.unusedSignalConcepts.map((sc) => ({
          id: sc.id,
          type: TRAFFIC_SIGNAL_CONCEPT_TYPE,
        })),
      },
      'variable-instances': {
        data: measureDesign.variableInstances.map((vi) => ({
          id: vi.id,
          type: VARIABLE_INSTANCE_TYPE,
        })),
      },
    },
  });
}

export function includesForMeasureDesign(measureDesign: MeasureDesign) {
  const {
    measureConcept,
    trafficSignals,
    variableInstances,
    unusedSignalConcepts,
  } = measureDesign;
  return [
    measureConceptToJson(measureConcept),
    ...trafficSignals.flatMap(trafficSignalWithIncludes),
    ...variableInstances.flatMap(variableInstanceWithIncludes),
    ...unusedSignalConcepts.flatMap(trafficSignalConceptWithIncludes),
  ];
}
