import type { QueryResponseMeta } from '../db/schema-query';
import { urlifyQueryParams, type QueryParams } from './query-params';

export function generateJsonapiLinks(
  path: string,
  queryParams: QueryParams,
  queryResponseMeta: QueryResponseMeta,
) {
  if (!queryResponseMeta.count || !queryParams.page) {
    return {};
  }
  const lastPageNum =
    Math.ceil(queryResponseMeta.count / (queryParams.page.size ?? 0)) - 1;

  return {
    links: {
      first: `${path}${urlifyQueryParams(queryParams, { page: { number: 0 } })}`,
      prev: `${path}${urlifyQueryParams(queryParams, {
        page: {
          number: Math.max(0, (queryParams.page.number ?? 0) - 1),
        },
      })}`,
      next: `${path}${urlifyQueryParams(queryParams, {
        page: {
          number: Math.min(lastPageNum, (queryParams.page.number ?? 0) + 1),
        },
      })}`,
      last: `${path}${urlifyQueryParams(queryParams, {
        page: {
          number: lastPageNum,
        },
      })}`,
    },
  };
}
