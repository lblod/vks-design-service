import * as z from 'zod';
import {
  idValuesClause,
  uriValuesClause,
  type GetQueryOpts,
} from './schema-query.ts';
import { objectify } from '../utils/sparql.ts';
import { trafficSignalSchema } from '../schemas/traffic-signal.ts';
import { query } from 'mu';
import { hasVKSRelationship } from '../utils/vks-relationship-helpers.ts';
import { getTrafficSignalConceptByUri } from './traffic-signal-concepts.ts';

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
      ?trafficSignalConcept
    WHERE {
      ?uri 
        a ?type;
        mu:uuid ?id.

      VALUES ?type { 
        mobiliteit:VerkeersbordVerkeersteken
        mobiliteit:WegmarkeringVerkeersteken
        mobiliteit:VerkeerslichtVerkeersteken
      }

      ${hasVKSRelationship('?uri', '?trafficSignalConcept', 'onderdeel:IsGebaseerdOp')}

      ${ids ? idValuesClause(ids) : ''}
      ${uris ? uriValuesClause(uris) : ''}
    } 
  `);
  const bindings = result.results.bindings;
  const trafficSignals = z
    .array(
      trafficSignalSchema.extend({
        trafficSignalConcept: z.union([
          trafficSignalSchema.shape.trafficSignalConcept,
          z.string(),
        ]),
      }),
    )
    .parse(bindings.map(objectify));
  for (const trafficSignal of trafficSignals) {
    const concept = await getTrafficSignalConceptByUri(
      trafficSignal.trafficSignalConcept as string,
    );
    trafficSignal.trafficSignalConcept = concept!;
  }
  return z.array(trafficSignalSchema).parse(trafficSignals);
}
