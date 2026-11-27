import z from 'zod';
import { TRAFFIC_SIGNAL_CONCEPT_TYPES } from '../constants';
import {
  ROAD_SIGN_CATEGORY_TYPE,
  roadSignCategorySchema,
  roadSignCategoryToJson,
} from './road-sign-category';
import {
  instructionSchema,
  instructionToJson,
  INSTRUCTION_TYPE,
} from './instruction';
import {
  jsonApiManyRelationshipData,
  jsonApiResourceObject,
} from '../jsonapi-schema';

export const TRAFFIC_SIGNAL_CONCEPT_TYPE = 'traffic-signal-concepts' as const;

export const trafficSignalConceptSchema = z.strictObject({
  uri: z.string(),
  id: z.string(),
  meaning: z.string(),
  code: z.string(),
  regulatoryNotation: z.string().optional(),
  image: z.string(),
  type: z.literal([
    TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN,
    TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_MARKING,
    TRAFFIC_SIGNAL_CONCEPT_TYPES.TRAFFIC_LIGHT,
  ]),
  categories: z.array(roadSignCategorySchema).default([]),
  instructions: z.array(instructionSchema).default([]),
  mainSigns: z.array(z.string()).default([]),
});

export type TrafficSignalConcept = z.infer<typeof trafficSignalConceptSchema>;

export const trafficSignalConceptJsonSchema = jsonApiResourceObject({
  type: TRAFFIC_SIGNAL_CONCEPT_TYPE,
  attributes: trafficSignalConceptSchema.omit({
    categories: true,
    instructions: true,
  }),
  relationships: z.object({
    categories: jsonApiManyRelationshipData(ROAD_SIGN_CATEGORY_TYPE),
    instructions: jsonApiManyRelationshipData(INSTRUCTION_TYPE),
  }),
});

export function trafficSignalConceptToJson(
  trafficSignalConcept: TrafficSignalConcept,
) {
  return trafficSignalConceptJsonSchema.decode({
    type: TRAFFIC_SIGNAL_CONCEPT_TYPE,
    id: trafficSignalConcept.id,
    attributes: {
      code: trafficSignalConcept.code,
      meaning: trafficSignalConcept.meaning,
      type: trafficSignalConcept.type,
      uri: trafficSignalConcept.uri,
      'regulatory-notation': trafficSignalConcept.regulatoryNotation,
      image: trafficSignalConcept.image,
      'main-signs': trafficSignalConcept.mainSigns,
    },
    relationships: {
      categories: {
        data: trafficSignalConcept.categories.map((cat) => ({
          type: ROAD_SIGN_CATEGORY_TYPE,
          id: cat.id,
        })),
      },
      instructions: {
        data: trafficSignalConcept.instructions.map((instruction) => ({
          type: INSTRUCTION_TYPE,
          id: instruction.id,
        })),
      },
    },
  });
}
export function trafficSignalConceptWithIncludes(
  trafficSignalConcept: TrafficSignalConcept,
) {
  return [
    trafficSignalConceptToJson(trafficSignalConcept),
    ...trafficSignalConcept.categories.map(roadSignCategoryToJson),
    ...trafficSignalConcept.instructions.map(instructionToJson),
  ];
}
