import * as z from 'zod';
import { Router } from 'express';
import {
  designSchema,
  getAllDesigns,
  type DesignResource,
} from '../queries/get-all-designs';
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
type DesignDoc = z.infer<typeof designJsonSchema>;

const designToJsonApi = z
  .array(designSchema)
  .pipe(
    z.transform<DesignResource[], DesignDoc>(
      (designs) =>
        ({
          data: designs.map((design) => ({
            id: design.id,
            type: 'ar-designs',
            attributes: {
              date: stringToDate.encode(design.date),
              uri: design.uri,
              name: design.name,
            },
            relationships: {
              measures: {
                links: { related: `/ar-designs/${design.id}/measures` },
              },
            },
          })),
        }) as const,
    ),
  )
  .pipe(designJsonSchema);

export const designsRouter = Router();
designsRouter.get('/ar-designs', async function (_req, res) {
  try {
    const designs = await getAllDesigns();

    const result = designToJsonApi.parse(designs);
    res.status(200);
    res.send(result);
  } catch (e) {
    console.log(e);
    res.status(500);
    res.send({ error: 'couldnt parse' });
  }
});
