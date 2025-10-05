import Ajv from 'ajv';
import jsonApiSchema from './jsonapi-schema.json';
import draft6 from 'ajv/dist/refs/json-schema-draft-06.json';

const ajv = new Ajv();

ajv.addMetaSchema(draft6);
export const validate = ajv.compile(jsonApiSchema);
