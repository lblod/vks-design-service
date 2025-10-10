import * as z from 'zod';
import { query, sparqlEscapeUri } from 'mu';
import { queryResultSchema } from '../database-validation/sparql-result-schema';
import {
  plainString,
  uriList,
} from '../database-validation/sparql-value-schemas';
import { getMultipleVariableInfos } from './get-variable-info';

export async function getMeasureConceptInfo(uri: string) {
  const measures = await getMultipleMeasureConceptInfos([uri]);
  return measures[0];
}
const measureConceptSparqlSchema = z.object({
  id: plainString,
  templateString: plainString,
  rawTemplateString: plainString,
  variables: uriList,
});
type SparqlMeasureConcept = z.infer<typeof measureConceptSparqlSchema>;
export async function getMultipleMeasureConceptInfos(uris: string[]) {
  if (uris.length === 0) {
    return [];
  }
  const queryStr = `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
  PREFIX mrConcept: <https://data.vlaanderen.be/ns/mobiliteit#Mobiliteitsmaatregelconcept.>
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  SELECT ?id ?rawTemplateString ?templateString (GROUP_CONCAT(str(?variable); SEPARATOR = ',') as ?variables) WHERE {
    VALUES ?uri { ${uris.map((uri) => sparqlEscapeUri(uri)).join(' ')} }
    ?uri a mobiliteit:Mobiliteitmaatregelconcept;
        mu:uuid ?id;
	mrConcept:template ?template.
      ?template a mobiliteit:Template;
	mobiliteit:variabele ?variable;
	rdf:value ?rawTemplateString;
	ext:preview ?templateString.
  } GROUP BY ?id ?rawTemplateString ?templateString
  `;

  const rawResponse = await query(queryStr);
  const response = queryResultSchema(
    z.array(measureConceptSparqlSchema).length(uris.length),
  ).parse(rawResponse);
  return response.results.bindings ?? null;
}
export async function getMultipleMeasureConceptsWithVariables(uris: string[]) {
  const measures = await getMultipleMeasureConceptInfos(uris);
  const promises = measures.map((measure) =>
    variablesForMeasureConcept(measure),
  );
  return Promise.all(promises);
}
async function variablesForMeasureConcept(measure: SparqlMeasureConcept) {
  const variables = await getMultipleVariableInfos(measure.variables.value);
  return { variables, measure };
}
