import * as z from 'zod';
import { Router } from 'express';
import { getAllDesigns } from '../queries/ar-designs';
import { stringToDate } from '../database-validation/sparql-value-schemas';
import {
  jsonApiRelationship,
  jsonApiResourceObject,
  jsonApiSchema,
} from '../jsonapi-schema';

const designJsonSchema = jsonApiSchema(
  jsonApiResourceObject({
    type: 'ar-designs',
    attributes: z
      .object({
        name: z.string(),
        date: z.iso.datetime({ offset: true }),
        uri: z.string(),
      })
      .strict(),
    relationships: z
      .object({
        measures: jsonApiRelationship(),
      })
      .strict(),
  }),
);

export const designsRouter = Router();
designsRouter.get('/ar-designs', async function (_req, res) {
  try {
    const designs = await getAllDesigns();

    const result = designJsonSchema.decode({
      data: designs.map((design) => {
        const { uri, id, name, date } = design;
        return {
          type: 'ar-designs' as const,
          id: id.value,
          attributes: {
            uri: uri.value,
            name: name.value,
            date: stringToDate.encode(date.value),
          },
          relationships: {
            measures: {
              links: { related: `/ar-designs/${id.value}/measures` },
              data: design.measures.value.map((measure) => ({
                type: 'measures',
                id: measure,
              })),
            },
          },
        };
      }),
    });
    res.status(200);
    res.send(result);
  } catch (e) {
    console.log(e);
    res.status(500);
    res.send({ error: 'couldnt parse' });
  }
});
