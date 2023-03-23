// import Ajv from 'ajv';
// import Ajv2019, { ErrorObject} from 'npm:ajv/dist/2019';
// import addFormats from 'npm:ajv-formats';
// import * as Ajv from './ajv2019.bundle.js';

import Ajv from 'https://esm.sh/ajv@8.11.0';
import addFormats from 'https://esm.sh/ajv-formats@2.1.1';
const ajv = new Ajv({allErrors: true});
addFormats(ajv);

import * as yaml from 'npm:yaml';
import { RawVocab, ValidationError, ValidationResults } from './common.ts';

import * as schema from "./schema.json" assert {type: "json"};

/**
 * Perform a JSON Schema validation on the YAML content. Done by converting the YAML content into 
 * a Javascript object (using the YAML parser) and checking the object against a schema.
 * 
 * @param yaml_raw_content The raw textual content of the YAML file (i.e, presumably after reading the file itself)
 * @returns 
 */
export function validateWithSchema(yaml_raw_content: string): ValidationResults {
    try {
        const yaml_content :unknown = yaml.parse(yaml_raw_content);

        if (!ajv.validate(schema, yaml_content)) {
            // Simplify the error messages of Ajv, this schema is way too simple to need the
            // full complexity of those;
            if (!ajv.errors) {
                // In fact, this branch does not happen, but the TypeScript compiler doesn't know
                return {
                    vocab: null, error: []
                }
            } else {

            const simple_errors = ajv.errors.map((e): ValidationError => {
                return {
                    message: (e.message) ? e.message : undefined,
                    params: e.params,
                    data: (e.data) ? e.data : undefined,
                }
                });
                return {
                    vocab: null,
                    error: simple_errors
                }
            }
        } else {
            return {
                vocab: yaml_content as RawVocab,
                error: []
            }
        }
    } catch(e) {
        // This is the case if the yaml parser throws some errors
        return {
            vocab: null,
            error: [{message: `${e}`}]
        }
    }
}
