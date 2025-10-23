import * as z from 'zod';
import { Router } from 'express';
import {
  jsonApiRelationship,
  jsonApiResourceObject,
  jsonApiSchema,
} from '../../jsonapi-schema.ts';
import { getMeasures } from '../../queries/measures.ts';
import { getDesignById } from '../../queries/ar-designs.ts';

export const TRAFFIC_SIGNAL_CONCEPT_TYPES = {
  TRAFFIC_SIGNAL:
    'https://data.vlaanderen.be/ns/mobiliteit#Verkeerstekenconcept',
  ROAD_SIGN: 'https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept',
  TRAFFIC_LIGHT:
    'https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept',
  ROAD_MARKING: 'https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept',
} as const;
export const ZONALITY_OPTIONS = {
  POTENTIALLY_ZONAL:
    'http://lblod.data.gift/concepts/8f9367b2-c717-4be7-8833-4c75bbb4ae1f',
  ZONAL: 'http://lblod.data.gift/concepts/c81c6b96-736a-48cf-b003-6f5cc3dbc55d',
  NON_ZONAL:
    'http://lblod.data.gift/concepts/b651931b-923c-477c-8da9-fc7dd841fdcc',
};

export const designMeasuresRouter = Router();

export const RoadSignCategorySchema = z.object({
  uri: z.string(),
  label: z.string(),
});
export const TrafficSignalConceptSchema = z
  .object({
    uri: z.string(),
    code: z.string(),
    image: z.string(),
    zonality: z.enum(ZONALITY_OPTIONS).optional(),
    position: z.coerce.number().default(-1),
  })
  .and(
    z.discriminatedUnion('type', [
      z.object({
        type: z.literal(TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN),
        categories: z.array(RoadSignCategorySchema).default([]),
      }),
      z.object({
        type: z.enum([
          TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_MARKING,
          TRAFFIC_SIGNAL_CONCEPT_TYPES.TRAFFIC_LIGHT,
        ]),
      }),
    ]),
  );

const measuresJsonSchema = jsonApiSchema(
  jsonApiResourceObject({
    type: 'measures',
    attributes: z
      .object({
        // measureConcept: measureConceptSchema,
        'raw-template-string': z.string(),
        'template-string': z.string(),
        // temporal: z.boolean(),
      })
      .strict(),
    relationships: z.object({
      design: jsonApiRelationship(),
      variables: jsonApiRelationship(),
    }),
  }),
);

designMeasuresRouter.get('/ar-designs/:id/measures', async function (req, res) {
  try {
    const design = await getDesignById(req.params.id);
    if (!design) {
      res.status(404);
      res.send();
    } else {
      console.log(design.measures.value);
      const measureConcepts = await getMeasures({
        uris: design.measures.value,
      });
      const jsonResponse = measuresJsonSchema.safeDecode({
        data: measureConcepts.map((measureConcept) => {
          const { id, templateString, rawTemplateString } = measureConcept;
          return {
            type: 'measures',
            id: id.value,
            attributes: {
              'template-string': templateString.value,
              'raw-template-string': rawTemplateString.value,
            },
            relationships: {
              design: {
                links: {
                  related: `/ar-designs/${req.params.id}`,
                },
              },
              variables: {
                links: {
                  related: `/measures/${id.value}/variables`,
                },
              },
            },
          };
        }),
      });
      if (jsonResponse.success) {
        res.status(200);
        res.send(jsonResponse.data);
      } else {
        res.status(500);
        res.send({ error: 'failed to encode into jsonapi' });
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500);
    res.send({ error: e });
  }
});
