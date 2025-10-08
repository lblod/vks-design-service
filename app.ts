import * as z from 'zod';
import { app } from 'mu';
import type { Application } from 'express';
import {
  designSchema,
  getAllDesigns,
  type DesignResource,
} from './lib/queries/get-all-designs';
import { stringToDate } from './lib/database-validation/sparql-value-schemas';

function jsonApiResourceObject<
  T extends string,
  A extends z.ZodType,
  R extends z.ZodType,
>(resourceType: T, attributeSchema: A, relationshipSchema: R) {
  return z
    .object({
      id: z.string(),
      type: z.literal(resourceType),
      attributes: attributeSchema,
      relationships: relationshipSchema,
      links: z.object().optional(),
      meta: z.object().optional(),
    })
    .strict();
}
function jsonApiSchema<R extends z.ZodType>(resourceSchema: R) {
  return z
    .object({
      data: z.union([z.array(resourceSchema), resourceSchema]),
      meta: z.object().optional(),
    })
    .strict();
}
const designAttrSchema = z
  .object({
    name: z.string(),
    date: z.iso.datetime({ offset: true }),
    // date: z.date(),
    uri: z.string(),
  })
  .strict();
const designResourceSchema = jsonApiResourceObject(
  'design',
  designAttrSchema,
  z.object().optional(),
);
const designJsonSchema = jsonApiSchema(designResourceSchema);
type DesignDoc = z.infer<typeof designJsonSchema>;
const designToJsonApi = z
  .array(designSchema)
  .pipe(
    z.transform<DesignResource[], DesignDoc>(
      (designs) =>
        ({
          data: designs.map((design) => ({
            id: design.id,
            type: 'design',
            attributes: {
              date: stringToDate.encode(design.date),
              uri: design.uri,
              name: design.name,
            },
          })),
        }) as const,
    ),
  )
  .pipe(designJsonSchema);
export const myapp: Application = app;
myapp.get('/hello', function (_req, res) {
  // throw new Error('asdfasfd');
  res.status(200);
  res.send({ response: 'Hello mu-javascript-template' });
});
myapp.get('/designs', async function (_req, res) {
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
