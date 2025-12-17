import { sparqlEscapeString, sparqlEscapeUri } from 'mu';
import { hasVKSRelationship } from '../utils/vks-relationship-helpers.ts';
import { arDesignResult } from '../schemas/ar-design.ts';
import { paginatedQuery, type GetQueryOpts } from './schema-query.ts';

export type ArDesignsQueryOpts = GetQueryOpts & { administrativeUnit: string };
export async function getARDesigns(opts: ArDesignsQueryOpts) {
  const { administrativeUnit } = opts;
  const filterQuery = !opts.filter?.name
    ? ''
    : `FILTER(CONTAINS(LCASE(?name), LCASE(${sparqlEscapeString(opts.filter.name)})))`;

  return await paginatedQuery({
    schema: arDesignResult,
    params: opts,
    prefixes: `
      PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
      PREFIX arOntwerp: <https://data.vlaanderen.be/ns/mobiliteit#AanvullendReglementOntwerp.>
      PREFIX relatie: <https://wegenenverkeer.data.vlaanderen.be/ns/implementatieelement#RelatieObject.>
      PREFIX onderdeel: <https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#>
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX dct: <http://purl.org/dc/terms/>`,
    selectClause: `
      SELECT DISTINCT
        ?uri
        ?name
        ?date
        ?id
        (GROUP_CONCAT(str(?measureDesign); SEPARATOR=",") as ?measureDesigns)`,
    whereClause: `
      GRAPH <http://mu.semte.ch/graphs/awv/ldes> {
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

        ${hasVKSRelationship('?signalisationDesign', '?ovoUri', 'onderdeel:HeeftBetrokkene')}
      }
      GRAPH <http://mu.semte.ch/graphs/public> {
        ${sparqlEscapeUri(administrativeUnit)} owl:sameAs ?ovoUri.
      }
      `,
    filterClause: filterQuery,
    groupByClause: 'GROUP BY ?uri ?name ?date ?id',
    opts: { sudo: true },
  });
}

export async function getARDesignById(id: string, administrativeUnit: string) {
  return getARDesigns({ ids: [id], administrativeUnit }).then(
    (designs) => designs.data[0],
  );
}
