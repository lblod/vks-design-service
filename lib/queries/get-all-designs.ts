import { query } from 'mu';
import * as z from 'zod';
const stringToDate = z.codec(
  z.iso.datetime({ offset: true }),
  z.date(), // output schema: Date object
  {
    decode: (isoString) => new Date(isoString), // ISO string → Date
    encode: (date) => date.toISOString(), // Date → ISO string
  },
);
const uriResult = z.strictObject({
  type: z.literal('uri'),
  value: z.string(),
});
function typedLiteralResult<V extends z.ZodType, D extends z.ZodType>(
  valueSchema: V,
  dataTypeSchema?: D,
) {
  return z.strictObject({
    type: z.literal('typed-literal'),
    value: valueSchema,
    datatype: dataTypeSchema ?? z.string(),
  });
}
const dateTimeLiteral = typedLiteralResult(
  stringToDate,
  z.literal('http://www.w3.org/2001/XMLSchema#dateTime'),
);
const stringLiteral = typedLiteralResult(
  z.string(),
  z.literal('http://www.w3.org/2001/XMLSchema#string'),
);
function queryResultSchema<S extends z.ZodType>(bindingSchema: S) {
  return z.strictObject({
    head: z.strictObject({
      link: z.array(z.strictObject({})),
      vars: z.array(z.string()),
    }),
    results: z.strictObject({
      distinct: z.boolean(),
      ordered: z.boolean(),
      bindings: bindingSchema,
    }),
  });
}

const designBindings = z.array(
  z.strictObject({
    name: stringLiteral,
    date: dateTimeLiteral,
    uri: uriResult,
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
