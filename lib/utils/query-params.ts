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
    encode: (sortObj) =>
      `${sortObj.direction}${!sortObj.options ? '' : `:${sortObj.options.join(':')}:`}${sortObj.field}`,
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
  return `?${new URLSearchParams(Object.fromEntries(toSearchParamEntries(combined))).toString()}`;
}

function toSearchParamEntries(
  obj: object,
  prefix?: string,
): [string, string][] {
  return Object.entries(obj).flatMap(([key, val]) => {
    if (val === null || val === undefined) return [];
    if (key === 'sort') {
      return [[key, sortOptionsConvert.encode(val)]];
    }
    const prefixedKey = prefix ? `${prefix}[${key}]` : key;
    if (typeof val !== 'object') {
      return [[prefixedKey, val.toString()]];
    } else {
      return toSearchParamEntries(val, prefixedKey);
    }
  });
}
