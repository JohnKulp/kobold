import type { JSONSchema7 } from 'json-schema';
import { auditSchema } from '~/resources/models/lib/audit.schema';

export const WgToken: JSONSchema7 = {
	title: 'WgToken',
	type: 'object',
	description: "an oauth api token for a wanderer's guide character",
	properties: {
		// audit
		...auditSchema,

		// other properties
		id: {
			type: 'integer',
			readOnly: true,
			description: 'The id of the token request.',
		},
		characterId: {
			type: 'integer',
			description: "The external wanderer's guide character id.",
		},
		accessToken: {
			type: 'string',
			description: "the wanderer's guide oauth access token",
		},
		expiresAt: {
			type: 'string',
			format: 'date-time',
			description: 'when the token expires',
		},
		accessRights: {
			type: 'string',
			description: 'the rights granted for the character',
		},
		tokenType: {
			type: 'string',
			description: 'the OAUTH token type',
		},
	},
};
