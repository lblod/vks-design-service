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
  const currentPageNum = queryParams.page.number ?? 0;
  const lastPageNum =
    Math.ceil(queryResponseMeta.count / (queryParams.page.size ?? 0)) - 1;
  const prevPageNum = Math.max(0, currentPageNum - 1);
  const nextPageNum = Math.min(lastPageNum, currentPageNum + 1);

  return {
    links: {
      first: `${path}${urlifyQueryParams(queryParams, { page: { number: 0 } })}`,
      prev:
        currentPageNum === 0
          ? null
          : `${path}${urlifyQueryParams(queryParams, {
              page: {
                number: prevPageNum,
              },
            })}`,
      next:
        currentPageNum === lastPageNum
          ? null
          : `${path}${urlifyQueryParams(queryParams, {
              page: {
                number: nextPageNum,
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
