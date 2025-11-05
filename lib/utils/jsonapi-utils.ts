import type { QueryResponseMeta } from '../db/ar-designs';
import type { GetQueryMeta } from '../db/schema-query';
import { urlifyQueryParams } from './query-params';

export function generateJsonapiLinks(
  path: string,
  queryParams: GetQueryMeta,
  queryResponseMeta: QueryResponseMeta,
) {
  if (!queryResponseMeta.count || !queryParams.pagination) {
    return {};
  }
  const lastPageNum =
    Math.ceil(queryResponseMeta.count / queryParams.pagination.size) - 1;

  return {
    links: {
      first: `${path}${urlifyQueryParams(queryParams, { pagination: { number: 0 } })}`,
      prev: `${path}${urlifyQueryParams(queryParams, {
        pagination: {
          number: Math.max(0, queryParams.pagination?.number - 1),
        },
      })}`,
      next: `${path}${urlifyQueryParams(queryParams, {
        pagination: {
          number: Math.min(lastPageNum, queryParams.pagination?.number + 1),
        },
      })}`,
      last: `${path}${urlifyQueryParams(queryParams, {
        pagination: {
          number: lastPageNum,
        },
      })}`,
    },
  };
}
