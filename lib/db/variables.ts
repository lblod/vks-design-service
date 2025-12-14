import * as z from 'zod';
import {
  idValuesClause,
  uriValuesClause,
  type GetQueryOpts,
} from './schema-query.ts';
import { getMowEndpoint } from '../environment.ts';
import { variableSchema } from '../schemas/variable.ts';
import { query } from 'mu';
import { objectify } from '../utils/sparql.ts';

export async function getVariables(opts: GetQueryOpts = {}) {
  const { uris, ids } = opts;
  const result = await query(
    /* sparql */ `
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX variable: <http://lblod.data.gift/vocabularies/variables/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>

    SELECT DISTINCT
      ?uri 
      ?id 
      ?label 
      ?type 
      ?codelist 
    WHERE {
      ?uri 
        a variable:Variable;
        mu:uuid ?id;
        dct:type ?type;
        dct:title ?label.
      OPTIONAL {
        ?uri mobiliteit:codelijst ?codelist.
      }
      ${ids ? idValuesClause(ids) : ''}
      ${uris ? uriValuesClause(uris) : ''}
    }
  `,
    { endpoint: getMowEndpoint() },
  );
  return z.array(variableSchema).parse(result.results.bindings.map(objectify));
}
