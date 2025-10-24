import * as z from 'zod';
import { Router } from 'express';
import {
  jsonApiRelationship,
  jsonApiResourceObject,
  jsonApiSchema,
} from '../../jsonapi-schema.ts';
import { getMeasureConcepts } from '../../queries/measure-concepts.ts';
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

export const designMeasureConceptsRouter = Router();

const measureConceptsJsonSchema = jsonApiSchema(
  jsonApiResourceObject({
    type: 'measure-concepts',
    attributes: z
      .object({
        uri: z.string(),
        label: z.string(),
        'raw-template-string': z.string(),
        'template-string': z.string(),
        // temporal: z.boolean(),
      })
      .strict(),
    relationships: z.object({
      variables: jsonApiRelationship(),
      'signal-concepts': jsonApiRelationship(),
    }),
  }),
);

designMeasureConceptsRouter.get(
  '/ar-designs/:id/measure-concepts',
  async function (req, res) {
    try {
      const design = await getDesignById(req.params.id);
      if (!design) {
        res.status(404);
        res.send();
      } else {
        console.log(design.measureConcepts.value);
        const measureConcepts = await getMeasureConcepts({
          uris: design.measureConcepts.value,
        });
        const jsonResponse = measureConceptsJsonSchema.safeDecode({
          data: measureConcepts.map((measureConcept) => {
            const { id, uri, label, templateString, rawTemplateString } =
              measureConcept;
            return {
              type: 'measure-concepts',
              id: id.value,
              attributes: {
                uri: uri.value,
                label: label.value,
                'template-string': templateString.value,
                'raw-template-string': rawTemplateString.value,
              },
              relationships: {
                variables: {
                  links: {
                    related: `/measure-concepts/${id.value}/variables`,
                  },
                },
                'signal-concepts': {
                  links: {
                    related: `/measure-concepts/${id.value}/signal-concepts`,
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
  },
);
