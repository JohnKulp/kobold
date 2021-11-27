import type { SchemaTypes } from 'Types';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '~/resources/models/lib/base-model';
import { WgToken as WgTokenSchema } from '~/resources/models/wg-token/wg-token.schema';
import { WgTokenFactory } from '~/resources/models/wg-token/wg-token.factory';

export interface WgToken extends SchemaTypes.WgToken {}
export class WgToken extends BaseModel {
	static get tableName() {
		return 'WgToken';
	}

	static get jsonSchema(): JSONSchema7 {
		return WgTokenSchema;
	}

	static readonly factory = WgTokenFactory;
}
