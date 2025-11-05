import z from 'zod';
import type { Request } from 'express';
import { deepAssign, type DeepPartial } from './deep-utils.ts';
import { sortingOptionSchema, type SortOpts } from './sorting.ts';
import { stringToInteger } from './conversions.ts';

const sortRegex = /(?<direction>-?)(?::[^:]+:)*(?<field>[^:]+)/;
const optionsRegex = /:(?<option>[^:]+):/g;
export const sortOptionsConvert = z.codec(
  z.string().regex(sortRegex),
  sortingOptionSchema,
  {
    decode: (str) => {
      const match = str.match(sortRegex);
      const options = [...str.matchAll(optionsRegex)].map(
        (mat) => mat.groups?.option,
      );
      if (match) {
        return {
          field: match.groups?.field ?? '',
          direction: match.groups?.direction as SortOpts['direction'],
          options: options as SortOpts['options'],
        };
      } else {
        throw new Error('Matching the same regex twice should work');
      }
    },
    // FIXME
    encode: (num) => num.toString(),
  },
);

export const queryParamSchema = z.object({
  page: z
    .object({
      number: stringToInteger.optional(),
      size: stringToInteger.optional(),
    })
    .optional(),
  sort: sortOptionsConvert.optional(),
});
export type QueryParams = z.infer<typeof queryParamSchema>;

export function parseQueryParams(query: Request['query']): QueryParams {
  return queryParamSchema.parse(query);
}

export function urlifyQueryParams(
  params: QueryParams,
  overrides: DeepPartial<QueryParams>,
): string {
  const combined: QueryParams = deepAssign(params, overrides);
  // TODO handle this in a less manual way...
  return `?page[size]=${combined.page?.size}&page[number]=${combined.page?.number}`;
}
