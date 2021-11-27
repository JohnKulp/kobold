import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('wg_token_request', (table) => {
		table.increments('id').notNullable().comment('id of the token request');
		table.integer('character_id').notNullable().comment("external wanderer's guide character id");
		table
			.text('oauth_state')
			.notNullable()
			.comment('unique hash to check the confirmation against to help combat CSRF');
		// default to expiring a token request in 1 day
		table
			.timestamp('expires_at')
			.defaultTo(knex.raw(`CURRENT_DATE + INTERVAL '1 day'`))
			.comment('when the token request expires');
		table
			.text('channel_id')
			.notNullable()
			.comment('The channel where the oauth link was requested');
		table
			.timestamp('created_at')
			.notNullable()
			.defaultTo(knex.fn.now())
			.comment('when the record was created');
		table.string('created_by').notNullable().comment('The user who requested an oauth link');
		table
			.timestamp('updated_at')
			.notNullable()
			.defaultTo(knex.fn.now())
			.comment('when the record was last updated');
		table
			.string('created_by')
			.notNullable()
			.comment('The user associated with the character upload');
		table
			.string('last_updated_by')
			.notNullable()
			.comment('The user associated with the last update of this record');
	});
	await knex.schema.createTable('wg_token', (table) => {
		table.increments('id').notNullable().comment('id of the token');
		table
			.integer('character_id')
			.notNullable()
			.unique()
			.comment("external wanderer's guide character id");
		table.text('access_token').notNullable().comment("the wanderer's guide oauth access token");
		table.timestamp('expires_at').notNullable().comment('when the token expires');
		table.text('access_rights').notNullable().comment('the rights granted for the character');
		table.text('token_type').notNullable().comment('the OAUTH token type');
		table
			.timestamp('created_at')
			.notNullable()
			.defaultTo(knex.fn.now())
			.comment('when the record was created');
		table
			.timestamp('updated_at')
			.notNullable()
			.defaultTo(knex.fn.now())
			.comment('when the record was last updated');
		table
			.string('created_by')
			.notNullable()
			.comment('The user associated with the character upload');
		table
			.string('last_updated_by')
			.notNullable()
			.comment('The user associated with the last update of this record');
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('wg_token_request');
	await knex.schema.dropTableIfExists('wg_token');
}
