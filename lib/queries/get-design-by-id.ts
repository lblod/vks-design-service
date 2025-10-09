import { query, sparqlEscapeString } from 'mu';
import * as z from 'zod';
import { queryResultSchema } from '../database-validation/sparql-result-schema';
import {
  dateTimeValue,
  stringValue,
  uriList,
  uriValue,
} from '../database-validation/sparql-value-schemas';

const designBindings = z
  .array(
    z.strictObject({
      name: stringValue,
      date: dateTimeValue,
      uri: uriValue,
      measures: uriList,
    }),
  )
  .max(1);

const designResultSchema = queryResultSchema(designBindings);
export async function getDesignById(id: string) {
  const queryStr = `
  PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
  PREFIX arOntwerp: <https://data.vlaanderen.be/ns/mobiliteit#AanvullendReglementOntwerp.>
  PREFIX relatie: <https://wegenenverkeer.data.vlaanderen.be/ns/implementatieelement#RelatieObject.>
  PREFIX onderdeel: <https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX dct: <http://purl.org/dc/terms/>

  SELECT DISTINCT ?uri ?name ?date (GROUP_CONCAT(str(?measure); SEPARATOR=",") as ?measures) WHERE { 
    ?uri a mobiliteit:AanvullendReglementOntwerp;
       mu:uuid ${sparqlEscapeString(id)};
       arOntwerp:naam ?name;
       dct:issued ?date.

    ?hasMeasureDesignRel relatie:bron ?uri;
       a onderdeel:BevatMaatregelOntwerp;
       relatie:doel ?measureDesign.

    ?basedOnRel relatie:bron ?measureDesign;
      a onderdeel:IsGebaseerdOp;
      relatie:doel ?measure.

  } GROUP BY ?uri ?name ?date
  `;
  const rawResult = await query(queryStr);
  const result = designResultSchema.parse(rawResult);
  return result.results.bindings[0] ?? null;
}
