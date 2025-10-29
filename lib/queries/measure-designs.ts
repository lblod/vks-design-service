import * as z from 'zod';
import {
  idValuesClause,
  uriValuesClause,
  type GetQueryOpts,
} from './schema-query.ts';
import { wrappedQuery } from './wrapped-query.ts';
import { objectify } from '../utils/sparql.ts';
import { measureDesignSchema } from '../schemas/measure-design.ts';
import { getMeasureConceptByUri } from './measure-concepts.ts';
import { hasVKSRelationship } from '../utils/vks-relationship-helpers.ts';

export async function getMeasureDesigns(opts: GetQueryOpts = {}) {
  const { ids, uris } = opts;
  const result = await wrappedQuery(/* sparql */ `
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
    WHERE {
      ?uri 
        a mobiliteit:MobiliteitsmaatregelOntwerp;
        mu:uuid ?id.
      ${hasVKSRelationship('?uri', '?measureConcept', 'onderdeel:IsGebaseerdOp')}

      ${ids ? idValuesClause(ids) : ''}
      ${uris ? uriValuesClause(uris) : ''}
    } 
    GROUP BY ?id ?uri
  `);
  const bindings = result.results.bindings;
  const measureDesigns = z
    .array(
      measureDesignSchema.extend({
        measureConcept: z.union([
          measureDesignSchema.shape.measureConcept,
          z.string(),
        ]),
      }),
    )
    .parse(bindings.map(objectify));

  for (const measureDesign of measureDesigns) {
    const measureConcept = await getMeasureConceptByUri(
      z.string().parse(measureDesign.measureConcept),
    );
    measureDesign.measureConcept = measureConcept!;
  }

  return z.array(measureDesignSchema).parse(measureDesigns);

  // return schemaQuery(z.array(measureDesignSparqlSchema), queryStr, {
  //   endpoint: getMowEndpoint(),
  // });
}
