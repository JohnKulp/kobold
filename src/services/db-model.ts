/* eslint-disable camelcase */
import Knex from 'knex';
import type { Knex as KnexType } from 'knex';
import { Model, knexSnakeCaseMappers } from 'objection';
import { types } from 'pg';
import { format } from 'date-fns';

export class DBModel {
	static knex: KnexType;

	static init(databaseUrl: string, pool_size_min = 2, pool_size_max = 10): void {
		DBModel.knex = Knex({
			client: 'postgresql',
			connection: databaseUrl,
			pool: {
				min: pool_size_min,
				max: pool_size_max,
			},
			...knexSnakeCaseMappers(),
		});
		Model.knex(DBModel.knex);
	}

	static destroy(): void {
		DBModel.knex.destroy();
	}
}

// Globally turn of automatic date parsing from PG
function parseDateTime(val: string) {
	/* TODO, this introduces a lot of extra conversions.
	 * The JSON-Schema->class interface currently only knows to convert date-time to string type, not Date type
	 * Additionally, postgres strings format as `2021-02-05 19:29:38.362+00` but javascript formats as `2021-02-05T19:29:38.362Z`
	 * Solutions:
	 * 1) fix JSON Schema class interface to reconize date-strings as Date types
	 * 2) fix either Postgres or Javascript to the other type.
	 */

	if (val === null) return null;
	return new Date(val).toISOString();
}

function parseDate(val: string) {
	if (val === null) return null;
	return format(new Date(val), 'YYYY-MM-DD');
}

types.setTypeParser(types.builtins.TIMESTAMPTZ, (val) => parseDateTime(val));
types.setTypeParser(types.builtins.TIMESTAMP, (val) => parseDateTime(val));
types.setTypeParser(types.builtins.DATE, (val) => parseDate(val));

// Convert bitInts to js number
types.setTypeParser(types.builtins.INT8, parseInt);
