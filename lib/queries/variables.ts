import * as z from 'zod';
import {
  literalResult,
  plainString,
  uriValue,
} from '../database-validation/sparql-value-schemas.ts';
import {
  idValuesClause,
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

export async function getVariables(opts: GetQueryOpts = {}) {
  const { uris, ids } = opts;
  const queryStr = /* sparql */ `
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX variable: <http://lblod.data.gift/vocabularies/variables/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>

    SELECT 
      ?uri 
      ?id 
      ?title 
      ?type 
      ?codelist 
    WHERE {
      ?uri 
        a variable:Variable;
        mu:uuid ?id;
        dct:type ?type;
        dct:title ?title.
      OPTIONAL {
        ?uri mobiliteit:codelijst ?codelist.
      }
      ${ids ? idValuesClause(ids) : ''}
      ${uris ? uriValuesClause(uris) : ''}
    }
  `;
  return schemaQuery(z.array(variableSparqlSchema), queryStr, {
    endpoint: getMowEndpoint(),
  });
}
