import { query, type ObjectToBind, type UserOptions } from 'mu';

export type WrappedQueryOpts = UserOptions & { endpoint?: string };

/**
 * Hacky wrapper around `query` from `mu` to allow endpoint selection
 */
export async function wrappedQuery<
  ObjOrIsAsk extends ObjectToBind | true = ObjectToBind,
>(queryStr: string, opts?: WrappedQueryOpts) {
  if (!opts?.endpoint) {
    return query<ObjOrIsAsk>(queryStr, opts);
  }
  const prevEndpoint = process.env.MU_SPARQL_ENDPOINT;
  process.env.MU_SPARQL_ENDPOINT = opts.endpoint;

  const result = await query(queryStr, opts);
  process.env.MU_SPARQL_ENDPOINT = prevEndpoint;
  return result;
}
