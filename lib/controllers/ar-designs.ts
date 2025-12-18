import * as z from 'zod';
import type { Request } from 'express';
import { isoStringToDate } from '../utils/conversions.ts';
import {
  jsonApiRelationship,
  jsonApiResourceObject,
  jsonApiSchema,
} from '../jsonapi-schema.ts';
import ARDesignsService from '../services/ar-designs.ts';
import { parseQueryParams } from '../utils/query-params.ts';
import { generateJsonapiLinks } from '../utils/jsonapi-utils.ts';
import type { AuthenticatedResponse } from '../types.ts';

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

export const getARDesigns = async (
  req: Request,
  res: AuthenticatedResponse,
) => {
  try {
    const administrativeUnit = res.locals.administrativeUnit;
    const queryParams = parseQueryParams(req.query);
    const designs = await ARDesignsService.getARDesigns({
      ...queryParams,
      administrativeUnit,
    });

    const result = designJsonSchema.encode({
      meta: designs.meta,
      ...generateJsonapiLinks(req.route.path, queryParams, designs.meta),
      data: designs.data.map((design) => {
        const { uri, id, name, date } = design;
        return {
          type: 'ar-designs' as const,
          id: id,
          attributes: {
            uri: uri,
            name: name,
            date: isoStringToDate.encode(date),
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
