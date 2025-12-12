import * as z from 'zod';
import {
  idValuesClause,
  uriValuesClause,
  type GetQueryOpts,
} from './schema-query.ts';
import { objectify } from '../utils/sparql.ts';
import { measureDesignSchema } from '../schemas/measure-design.ts';
import { hasVKSRelationship } from '../utils/vks-relationship-helpers.ts';
import { query, sparqlEscapeUri } from 'mu';
import { Z_SIGN_CONCEPT } from '../constants.ts';

const responseSchema = z.array(
  measureDesignSchema.extend({
    measureConcept: z.string(),
    trafficSignals: z.array(z.string()),
  }),
);
export async function getMeasureDesigns(opts: GetQueryOpts = {}) {
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
      ?measureConcept
      (GROUP_CONCAT(str(?trafficSignal); SEPARATOR=",") as ?trafficSignals) 
    WHERE {
      ?uri 
        a mobiliteit:MobiliteitsmaatregelOntwerp;
        mu:uuid ?id.
      ${hasVKSRelationship('?uri', '?measureConcept', 'onderdeel:IsGebaseerdOp')}

      {
        ${hasVKSRelationship('?uri', '?trafficSignal', 'onderdeel:WordtAangeduidDoor')}
      }
      UNION 
      {
        ${hasVKSRelationship('?uri', '?zSignal', 'onderdeel:WordtAangeduidDoor')}
        ?zSignal a mobiliteit:VerkeersbordVerkeersteken.
        ${hasVKSRelationship('?zSignal', '?zSignalConcept', 'onderdeel:IsGebaseerdOp')}
        FILTER(?zSignalConcept = ${sparqlEscapeUri(Z_SIGN_CONCEPT)})
        ${hasVKSRelationship('?zSignal', '?trafficSignal', 'onderdeel:BevatVerkeersteken')}
      }
      ?trafficSignal a ?signalType.
      VALUES ?signalType { 
        mobiliteit:VerkeersbordVerkeersteken
        mobiliteit:WegmarkeringVerkeersteken
        mobiliteit:VerkeerslichtVerkeersteken
      }
      
      ${ids ? idValuesClause(ids) : ''}
      ${uris ? uriValuesClause(uris) : ''}
    } 
    GROUP BY ?id ?uri ?measureConcept
  `);
  const bindings = result.results.bindings;
  return responseSchema.parse(
    bindings.map(objectify).map((obj) => ({
      ...obj,
      trafficSignals: obj['trafficSignals']?.split(','),
    })),
  );
}
