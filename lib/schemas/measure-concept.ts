import z from 'zod';
import {
  jsonApiManyRelationshipData,
  jsonApiResourceObject,
} from '../jsonapi-schema';
import { VARIABLE_TYPE } from './variable';
import { TRAFFIC_SIGNAL_CONCEPT_TYPE } from './traffic-signal-concept';

export const MEASURE_CONCEPT_TYPE = 'measure-concepts' as const;
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
export const measureConceptJsonSchema = jsonApiResourceObject({
  type: MEASURE_CONCEPT_TYPE,
  attributes: measureConceptSchema.omit({
    variables: true,
    signalConcepts: true,
  }),
  relationships: z.object({
    variables: jsonApiManyRelationshipData(VARIABLE_TYPE),
    signalConcepts: jsonApiManyRelationshipData(TRAFFIC_SIGNAL_CONCEPT_TYPE),
  }),
});

export function measureConceptToJson(measureConcept: MeasureConcept) {
  return measureConceptJsonSchema.decode({
    type: MEASURE_CONCEPT_TYPE,
    id: measureConcept.id,
    attributes: {
      uri: measureConcept.uri,
      label: measureConcept.label,
      'raw-template-string': measureConcept.rawTemplateString,
      'template-string': measureConcept.templateString,
    },
    relationships: {
      variables: {
        data: measureConcept.variables.map((variable) => ({
          id: variable,
          type: VARIABLE_TYPE,
        })),
      },
      'signal-concepts': {
        data: measureConcept.signalConcepts.map((sc) => ({
          id: sc,
          type: TRAFFIC_SIGNAL_CONCEPT_TYPE,
        })),
      },
    },
  });
}
