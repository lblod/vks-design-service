import Ajv from 'ajv';
import jsonApiSchema from './jsonapi-schema.json';
import addFormats from 'ajv-formats';
import draft6 from 'ajv/dist/refs/json-schema-draft-06.json';

const ajv = new Ajv();

addFormats(ajv);
ajv.addMetaSchema(draft6);
export const validate = ajv.compile(jsonApiSchema);
