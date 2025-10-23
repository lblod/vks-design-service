import * as z from 'zod';
import {
  literalResult,
  plainString,
  uriValue,
} from '../database-validation/sparql-value-schemas.ts';
import {
  maybeCheckedArray,
  schemaQuery,
  uriValuesClause,
  type GetQueryOpts,
} from './schema-query.ts';
import { getMowEndpoint } from '../environment.ts';

const variableSparqlSchema = z.object({
  id: plainString,
  title: plainString,
  uri: uriValue,
  type: literalResult(
    z.literal([
      'text',
      'number',
      'date',
      'codelist',
      'location',
      'instruction',
    ]),
  ),
  codelist: uriValue.optional(),
});

export async function getVariableDetailsByUris(
  uris: string[],
  opts?: GetQueryOpts,
) {
  if (uris.length === 0) {
    return [];
  }
  const queryStr = `
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX variable: <http://lblod.data.gift/vocabularies/variables/>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>

  SELECT ?uri ?title ?type ?codelist WHERE {
    ${uriValuesClause(uris)}
     { ?uri a variable:Variable;
	  dct:type ?type;
	  dct:title ?title. 
      } UNION {
	?uri a variable:Variable;
	   mobiliteit:codelijst ?codelist.
      }


    
  } 
  `;
  return schemaQuery(
    maybeCheckedArray(z.array(variableSparqlSchema), uris.length, opts),
    queryStr,
    { endpoint: getMowEndpoint() },
  );
}
