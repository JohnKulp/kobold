import type { JSONSchema7 } from 'json-schema';
import { auditSchema } from '~/resources/models/lib/audit.schema';

export const WgTokenRequest: JSONSchema7 = {
	title: 'WgTokenRequest',
	type: 'object',
	description: "a record of a user requesting a wanderer's guide oauth authorization link",
	properties: {
		// audit
		...auditSchema,

		// properties
		id: {
			type: 'integer',
			description: 'The id of the token request.',
		},
		characterId: {
			type: 'integer',
			description: "The external wanderer's guide character id.",
		},
		channelId: {
			type: 'string',
			description: "The 'snowflake' format discord channel id.",
		},
		oauthState: {
			type: 'string',
			description: 'unique hash to check the confirmation against to help combat CSRF',
		},
		expiresAt: {
			type: 'string',
			format: 'date-time',
			description: 'when the token request expires',
		},
	},
};
