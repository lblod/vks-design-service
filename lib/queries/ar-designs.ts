import * as z from 'zod';
import {
  idValuesClause,
  type GetQueryOpts,
  uriValuesClause,
} from './schema-query.ts';
import { hasVKSRelationship } from '../utils/vks-relationship-helpers.ts';
import { objectify } from '../utils/sparql.ts';
import { arDesignSchema } from '../schemas/ar-design.ts';
import { query } from 'mu';

export async function getARDesigns(opts: GetQueryOpts = {}) {
  const { ids, uris } = opts;
  const result = await query(`
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX arOntwerp: <https://data.vlaanderen.be/ns/mobiliteit#AanvullendReglementOntwerp.>
    PREFIX relatie: <https://wegenenverkeer.data.vlaanderen.be/ns/implementatieelement#RelatieObject.>
    PREFIX onderdeel: <https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX dct: <http://purl.org/dc/terms/>

    SELECT DISTINCT 
      ?uri 
      ?name 
      ?date 
      ?id 
      (GROUP_CONCAT(str(?measureDesign); SEPARATOR=",") as ?measureDesigns) 
    WHERE {
      ?uri 
        a mobiliteit:AanvullendReglementOntwerp;
        mu:uuid ?id;
        arOntwerp:naam ?name;
        dct:issued ?date.

      ${hasVKSRelationship('?uri', '?measureDesign', 'onderdeel:BevatMaatregelOntwerp')}

      ?measureDesign 
        a mobiliteit:MobiliteitsmaatregelOntwerp.

      ${hasVKSRelationship('?measureDesign', '?measureConcept', 'onderdeel:IsGebaseerdOp')}

      ?signalisationDesign
        a mobiliteit:SignalisatieOntwerp.

      ${hasVKSRelationship('?signalisationDesign', '?signalDesign', 'onderdeel:BevatVerkeersteken')}

      ?signalDesign
        a mobiliteit:OntwerpVerkeersteken.

      ${hasVKSRelationship('?signalDesign', '?uri', 'onderdeel:HeeftOntwerp')}

      ${ids ? idValuesClause(ids) : ''}
      ${uris ? uriValuesClause(uris) : ''}
    } 
    GROUP BY ?uri ?name ?date ?id`);
  const bindings = result.results.bindings;
  const objectifiedBindings = bindings.map(objectify).map((obj) => ({
    ...obj,
    measureDesigns: obj['measureDesigns']!.split(','),
  }));
  return z.array(arDesignSchema).parse(objectifiedBindings);
}

export async function getARDesignById(id: string) {
  return getARDesigns({ ids: [id] }).then((designs) => designs[0]);
}
