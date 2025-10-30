import * as z from 'zod';
import {
  idValuesClause,
  uriValuesClause,
  type GetQueryOpts,
} from './schema-query.ts';
import { objectify } from '../utils/sparql.ts';
import { trafficSignalSchema } from '../schemas/traffic-signal.ts';
import { query } from 'mu';

export async function getTrafficSignals(opts: GetQueryOpts = {}) {
  const { ids, uris } = opts;

  const result = await query(/* sparql */ `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX schema: <http://schema.org/>
    PREFIX relatie: <https://wegenenverkeer.data.vlaanderen.be/ns/implementatieelement#RelatieObject.>
    PREFIX onderdeel: <https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#>

    SELECT DISTINCT
      ?id 
      ?uri
    WHERE {
      ?uri 
        a mobiliteit:Verkeersteken;
        mu:uuid ?id.

      ${ids ? idValuesClause(ids) : ''}
      ${uris ? uriValuesClause(uris) : ''}
    } 
    GROUP BY ?id ?uri
  `);
  const bindings = result.results.bindings;
  return z.array(trafficSignalSchema).parse(bindings.map(objectify));
}
