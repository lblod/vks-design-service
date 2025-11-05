import * as z from 'zod';
import { hasVKSRelationship } from '../utils/vks-relationship-helpers.ts';
import { objectify } from '../utils/sparql.ts';
import { arDesignSchema } from '../schemas/ar-design.ts';
import { query } from 'mu';
import {
  idValuesClause,
  schemaQuery,
  uriValuesClause,
  type GetQueryOpts,
} from './schema-query.ts';
import { paginationClause } from '../utils/pagination.ts';
import { stringToNumber } from '../utils/conversions.ts';
import { typedLiteralResult } from '../database-validation/sparql-value-schemas.ts';
import { sortClause } from '../utils/sorting.ts';

// TODO move
const countSchema = z.object({
  count: typedLiteralResult(
    stringToNumber,
    z.literal('http://www.w3.org/2001/XMLSchema#integer'),
  ),
});
export type QueryResponseMeta = {
  count?: number;
};

export async function getARDesigns(opts: GetQueryOpts = {}) {
  const { ids, uris, page, sort } = opts;
  // TODO remove duplication and clean up
  const count = (
    await schemaQuery(
      z.array(countSchema),
      `
        PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
        PREFIX arOntwerp: <https://data.vlaanderen.be/ns/mobiliteit#AanvullendReglementOntwerp.>
        PREFIX relatie: <https://wegenenverkeer.data.vlaanderen.be/ns/implementatieelement#RelatieObject.>
        PREFIX onderdeel: <https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#>
        PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
        PREFIX dct: <http://purl.org/dc/terms/>

        SELECT (COUNT(DISTINCT ?uri) as ?count)
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
      }`,
    )
  )[0]?.count.value;
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
    GROUP BY ?uri ?name ?date ?id
    ${sortClause(sort)}
    ${paginationClause(page)}`);
  const bindings = result.results.bindings;
  const objectifiedBindings = bindings.map(objectify).map((obj) => ({
    ...obj,
    measureDesigns: obj['measureDesigns']!.split(','),
  }));
  const data = z.array(arDesignSchema).parse(objectifiedBindings);
  const meta = { count };

  return { data, meta };
}

export async function getARDesignById(id: string) {
  return getARDesigns({ ids: [id] }).then((designs) => designs.data[0]);
}
