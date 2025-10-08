import * as z from 'zod';
import { Router } from 'express';
import {
  jsonApiRelationship,
  jsonApiResourceObject,
  jsonApiSchema,
} from '../../jsonapi-schema';
import { getDesignById } from '../../queries/get-design-by-id';
import { uuid } from 'mu';

export const designPreviewRouter = Router();
const previewJsonSchema = jsonApiSchema(
  jsonApiResourceObject({
    type: 'preview',
    attributes: z
      .object({
        html: z.string(),
      })
      .strict(),
    relationships: z.object({
      design: jsonApiRelationship(),
    }),
  }),
);

designPreviewRouter.get('/design/:id/preview', async function (req, res) {
  const design = await getDesignById(req.params.id);
  if (!design) {
    res.status(404);
    res.send();
  } else {
    res.status(200);
    res.send(
      previewJsonSchema.decode({
        data: {
          type: 'preview',
          id: uuid(),
          attributes: {
            html: '<span>test</span>',
          },
          relationships: {
            design: {
              links: {
                related: `/designs/${req.params.id}`,
              },
            },
          },
        },
      }),
    );
  }
});
