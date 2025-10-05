import { query } from 'mu';
import * as z from 'zod';
import { queryResultSchema } from '../database-validation/sparql-result-schema';
import {
  dateTimeValue,
  stringValue,
  uriValue,
} from '../database-validation/sparql-value-schemas';

const designBindings = z.array(
  z.strictObject({
    name: stringValue,
    date: dateTimeValue,
    uri: uriValue,
  }),
);

const designSchema = z.strictObject({
  name: z.string(),
  date: z.date(),
  uri: z.string(),
});

const designResultSchema = queryResultSchema(designBindings);
const designs = z.array(designSchema);
const resultsToDesigns = designResultSchema
  .pipe(
    z.transform<z.infer<typeof designResultSchema>, z.infer<typeof designs>>(
      (result) =>
        result.results.bindings.map((b) => ({
          name: b.name.value,
          date: b.date.value,
          uri: b.uri.value,
        })),
    ),
  )
  .pipe(designs);
export async function getAllDesigns(): Promise<z.infer<typeof designs>> {
  const queryStr = `
  PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
  PREFIX ontwerp: <https://data.vlaanderen.be/ns/mobiliteit#SignalisatieOntwerp.>
  SELECT ?uri ?name ?date WHERE { 
    ?uri a mobiliteit:SignalisatieOntwerp;
       ontwerp:naam ?name;
       ontwerp:datum ?date.
  }

  `;
  const rawResult = await query<{ name: string; s: string }>(queryStr);
  const result = resultsToDesigns.parse(rawResult);

  return result;
}
