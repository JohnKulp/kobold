// Update with your config settings.
// eslint-disable-next-line import/no-extraneous-dependencies
import 'ts-node/register';

import dotenv from 'dotenv';

dotenv.config({ path: './.envcache' });

const dbConfig = {
	client: 'postgresql',
	connection: process.env.DATABASE_URL,
	migrations: {
		directory: './database/migrations',
		tableName: 'knex_migrations',
	},
	seeds: { directory: './database/seeds' },
	pool: {
		min: process.env.POOL_SIZE_MIN || 2,
		max: process.env.POOL_SIZE_MAX || 10,
	},
};

export default {
	testing: {
		...dbConfig,
		connection: process.env.TEST_DATABASE_URL,
		pool: {
			//every jest worker has its own pool. We can't overload the database by having each using the max pool size of the normal app.
			min: 1,
			max: 1,
		},
	},
	development: dbConfig,
	production: dbConfig,
};
