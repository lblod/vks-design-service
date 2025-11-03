import z from 'zod';
import type { Request } from 'express';
import type { GetQueryMeta } from '../queries/schema-query';
import { PaginationOptionsSchema } from './pagination';

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
