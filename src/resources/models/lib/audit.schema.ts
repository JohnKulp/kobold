export const auditSchema = {
	createdAt: {
		type: 'string',
		format: 'date-time',
		readOnly: true,
		description: 'A timestamp indicating when the resource was created.',
	},
	updatedAt: {
		type: 'string',
		format: 'date-time',
		readOnly: true,
		description: 'A timestamp indicating when the resource was most recently updated.',
	},
	lastUpdatedBy: {
		type: ['string', 'null'],
		readOnly: true,
		description:
			"The discord 'snowflake' typed id of the user who most recently updated the resource.",
	},
	createdBy: {
		type: ['string', 'null'],
		readOnly: true,
		description: "The discord 'snowflake' typed id of the user who created the resource.",
	},
};
