import z from 'zod';
import type { Request } from 'express';
import type { GetQueryMeta } from '../db/schema-query';
import { PaginationOptionsSchema } from './pagination';
import { deepAssign, type DeepPartial } from './deep-utils';

const preprocessIntString = (input: unknown) => {
  if (typeof input === 'string') {
    return parseInt(input, 10);
  }
  return input;
};

export const QueryParamSchema = z.object({
  page: z
    .object({
      number: z.preprocess(preprocessIntString, z.int()).optional(),
      size: z.preprocess(preprocessIntString, z.int()).optional(),
    })
    .optional(),
});

export function parseQueryParams(query: Request['query']): GetQueryMeta {
  const params = QueryParamSchema.parse(query);
  return {
    pagination: PaginationOptionsSchema.parse(params.page),
  };
}

export function urlifyQueryParams(
  params: GetQueryMeta,
  overrides: DeepPartial<GetQueryMeta>,
): string {
  const combined: GetQueryMeta = deepAssign(params, overrides);
  // TODO handle this in a less manual way...
  return `?page[size]=${combined.pagination?.size}&page[number]=${combined.pagination?.number}`;
}
