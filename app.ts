import { app } from 'mu';
import type { Application } from 'express';
import * as z from 'zod';
import {
  designSchema,
  getAllDesigns,
  type DesignResource,
} from './lib/queries/get-all-designs';
const jsonApiResourceObject = z
  .object({
    id: z.string(),
    type: z.string(),
    attributes: z.object().optional(),
    relationships: z.object().optional(),
    links: z.object().optional(),
    meta: z.object().optional(),
  })
  .strict();
const jsonApiSchema = z
  .object({
    data: z.array(jsonApiResourceObject),
    meta: z.object().optional(),
  })
  .strict();
type JsonApiDataDoc = z.infer<typeof jsonApiSchema>;
const designToJsonApi = z
  .array(designSchema)
  .pipe(
    z.transform<DesignResource[], JsonApiDataDoc>((designs) => ({
      data: designs.map((design) => ({ id: design.id, type: 'design' })),
    })),
  )
  .pipe(jsonApiSchema);
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
