import * as z from 'zod';
import type { Request, Response } from 'express';
import { stringToDate } from '../database-validation/sparql-value-schemas.ts';
import {
  jsonApiRelationship,
  jsonApiResourceObject,
  jsonApiSchema,
} from '../jsonapi-schema';
import { getARDesigns } from '../db/ar-designs.ts';

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
        'measure-designs': jsonApiRelationship(),
      })
      .strict(),
  }),
  z.undefined().optional(),
);

export const getArDesigns = async (_req: Request, res: Response) => {
  try {
    const designs = await getARDesigns();

    const result = designJsonSchema.decode({
      data: designs.map((design) => {
        const { uri, id, name, date } = design;
        return {
          type: 'ar-designs' as const,
          id: id,
          attributes: {
            uri: uri,
            name: name,
            date: stringToDate.encode(date),
          },
          relationships: {
            'measure-designs': {
              links: { related: `/ar-designs/${id}/measure-designs` },
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
};
