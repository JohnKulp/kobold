import { writeFileSync } from 'fs';
import { compile } from 'json-schema-to-typescript';
import * as schemas from '~/resources/models/schemas';

const replaceRegex = / \*\n \* This(.|\n)*?export /gm;

const buildTypes = async () => {
	const schema = {
		type: 'object',
		title: 'Kobold Schemas',
		$schema: 'http://json-schema.org/draft-07/schema#',
		definitions: Object.values(schemas),
	};

	const parsed = await compile(<any>schema, schema.title, {
		unreachableDefinitions: true,
		unknownAny: false, // Ensures flexibility in schema types for objection queries
		style: {
			useTabs: true,
			tabWidth: 1,
		},
	});

	const cleaned = parsed.replace(replaceRegex, ' */\n');
	const tabbed = cleaned.replace(/^/gm, '\t');
	const namespaced = `export declare namespace SchemaTypes {\n${tabbed}\n}`;

	writeFileSync(`${__dirname}/../../src/Types.d.ts`, namespaced);
};
buildTypes();
