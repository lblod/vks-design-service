import {
  query,
  sparqlEscapeString,
  sparqlEscapeUri,
  type UserOptions,
} from 'mu';
import * as z from 'zod';
import { queryResultSchema } from '../database-validation/sparql-result-schema.ts';
import {
  integerValue,
  plainString,
} from '../database-validation/sparql-value-schemas.ts';
import { InvariantError } from '../errors.ts';
import type { QueryParams } from '../utils/query-params.ts';
import { objectify } from '../utils/sparql.ts';
import { sortClause } from '../utils/sorting.ts';
import { paginationClause } from '../utils/pagination.ts';

export const countSchema = z.object({
  count: integerValue,
});
export type QueryResponseMeta = {
  count?: number;
};

/**
 * Execute a query with validation of the resulting response
 * @param schema The zod schema which describes the binding array. Must be an array-schema.
 * @param queryStr The query which will be sent
 * @param opts
 */
export async function schemaQuery<S extends z.ZodObject>(
  schema: S,
  queryStr: string,
  opts?: UserOptions,
) {
  const rawResult = await query(queryStr, opts);
  const result = queryResultSchema(z.array(schema).nonoptional()).parse(
    rawResult,
  );
  return result.results.bindings;
}

interface PaginatedQueryArgs<S extends z.ZodObject> {
  /** The zod schema which describes the results bindings. */
  schema: S;
  /** The list of prefixes used in the SPARQL query */
  prefixes: string;
  /** The whole SPARQL SELECT clause, including the keyword 'SELECT' */
  selectClause: string;
  /** The contents of the `WHERE {}` part of the SPARQL query */
  whereClause: string;
  /** The params needed to construct the query */
  params: Pick<GetQueryOpts, 'page' | 'sort' | 'ids' | 'uris'>;
  /** Optional FILTER clause to add to the query, including the keyword */
  filterClause?: string;
  /** Optional GROUP BY clause to add to the query, including the keyword */
  groupByClause?: string;
  /** Options for the query call */
  opts?: UserOptions;
}
/**
 * Execute a query and automatically return pagination metadata if relevant. Also performs
 * validation of the resulting response
 */
export async function paginatedQuery<S extends z.ZodObject>({
  schema,
  params,
  opts,
  ...queryParts
}: PaginatedQueryArgs<S>) {
  const metaPromise: Promise<{ count?: number }> = params.page
    ? schemaQuery(
        countSchema,
        `
          ${queryParts.prefixes}
          SELECT (COUNT(DISTINCT ?uri) as ?count)
          WHERE {
            ${queryParts.whereClause}

            ${params.ids ? idValuesClause(params.ids) : ''}
            ${params.uris ? uriValuesClause(params.uris) : ''}
            ${queryParts.filterClause ?? ''}
          }
        `,
        opts,
      ).then((res) => ({ count: res[0]?.count.value }))
    : Promise.resolve({});
  const dataPromise = schemaQuery(
    schema,
    `
      ${queryParts.prefixes}
      ${queryParts.selectClause}
      WHERE {
        ${queryParts.whereClause}

        ${params.ids ? idValuesClause(params.ids) : ''}
        ${params.uris ? uriValuesClause(params.uris) : ''}
        ${queryParts.filterClause ?? ''}
      }
      ${queryParts.groupByClause ?? ''}
      ${sortClause(params.sort)}
      ${paginationClause(params.page)}`,
    opts,
  );

  const [meta, data] = await Promise.all([metaPromise, dataPromise]);
  return {
    meta,
    // @ts-expect-error Not technically a BindingObject
    data: data.map(objectify),
  };
}

/**
 * Execute a query which asks for a list of ids
 * @param queryStr The query to send. No validation of the query string takes place
 */
export async function listQuery(queryStr: string, opts?: UserOptions) {
  const results = await schemaQuery(
    z.object({ id: plainString }).strict(),
    queryStr,
    opts,
  );
  return results.map((b) => b.id.value);
}

/**
 * Generate a VALUES ?id {...} string for convenient usage in queries
 * @param ids A list of id values which will be escaped as strings
 * @param [variableName='?id'] the variable name of the VALUES clause
 */
export function idValuesClause(ids: string[], variableName = '?id') {
  if (ids[0]?.startsWith('"')) {
    throw new InvariantError('ids should not be sparqlescaped');
  }
  return `VALUES ${variableName} { ${ids.map((id) => sparqlEscapeString(id)).join(' ')} }`;
}

/**
 * Generate a VALUES ?uri {...} string for convenient usage in queries
 * @param uris A list of uri values which will be escaped as uris
 * @param [variableName='?uri'] the variable name of the VALUES clause
 */
export function uriValuesClause(uris: string[], variableName = '?uri') {
  if (uris[0]?.startsWith('<')) {
    throw new InvariantError('uris should not be sparqlescaped');
  }
  return `VALUES ${variableName} { ${uris.map((uri) => sparqlEscapeUri(uri)).join(' ')} }`;
}

/**
 * Convenience function which can flip between explicitly checking the result array length or not
 */
export function maybeCheckedArray<S extends z.ZodArray>(
  arraySchema: S,
  expectedLength: number,
  opts?: { allowEmpty?: boolean },
) {
  if (opts?.allowEmpty) {
    return arraySchema;
  } else {
    return arraySchema.length(expectedLength);
  }
}

export type GetQueryOpts = QueryParams &
  (
    | {
        ids?: string[];
        uris?: never;
      }
    | {
        uris?: string[];
        ids?: never;
      }
  );
