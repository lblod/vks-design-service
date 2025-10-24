import * as z from 'zod';
import {
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
import { TRAFFIC_SIGNAL_CONCEPT_TYPES } from '../routes/ar-designs/measure-concepts.ts';
import { sparqlEscapeUri } from 'mu';

const signalConceptSparqlSchema = z.object({
  id: plainString,
  uri: uriValue,
  code: plainString,
  type: z.strictObject({
    type: z.literal('uri'),
    value: z.literal([
      TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN,
      TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_MARKING,
      TRAFFIC_SIGNAL_CONCEPT_TYPES.TRAFFIC_LIGHT,
    ]),
  }),
  // categories: literalResult(z.array(z.string()).)
});

export async function getSignalConcepts(opts: GetQueryOpts = {}) {
  const { ids, uris } = opts;
  const queryStr = /* sparql */ `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

    SELECT DISTINCT
      ?id
      ?uri
      ?type
      ?code
    WHERE {
      ?uri
        a mobiliteit:Verkeerstekenconcept;
        mu:uuid ?id;
        a ?type;
        skos:prefLabel ?code.

      VALUES ?type {
        ${sparqlEscapeUri(TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN)}
        ${sparqlEscapeUri(TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_MARKING)}
        ${sparqlEscapeUri(TRAFFIC_SIGNAL_CONCEPT_TYPES.TRAFFIC_LIGHT)}
      }
      ${ids ? idValuesClause(ids) : ''}
      ${uris ? uriValuesClause(uris) : ''}
    }
    GROUP BY ?id ?uri ?type ?code
  `;

  return schemaQuery(z.array(signalConceptSparqlSchema), queryStr, {
    endpoint: getMowEndpoint(),
  });
}
