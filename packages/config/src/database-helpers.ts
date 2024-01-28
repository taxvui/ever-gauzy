import { TlsOptions } from "tls";
import { parseToBoolean } from '@gauzy/common';

export enum databaseTypes {
	mongodb = 'mongodb',
	sqlite = 'sqlite',
	betterSqlite3 = 'better-sqlite3',
	postgres = 'postgres',
	mysql = 'mysql'
}

const isMysqlValue = process.env.DB_TYPE === databaseTypes.mysql;
const isSqliteValue = process.env.DB_TYPE === databaseTypes.sqlite;
const isBetterSqlite3Value = process.env.DB_TYPE === databaseTypes.betterSqlite3;
const isPostgresValue = process.env.DB_TYPE === databaseTypes.postgres;
const isMongodbValue = process.env.DB_TYPE === databaseTypes.mongodb;

export const isMySQL = (): boolean => isMysqlValue;
export const isSqlite = (): boolean => isSqliteValue;
export const isBetterSqlite3 = (): boolean => isBetterSqlite3Value;
export const isPostgres = (): boolean => isPostgresValue;
export const isMongodb = (): boolean => isMongodbValue;

export const getTlsOptions = (dbSslMode: string): TlsOptions | undefined => {
	if (!parseToBoolean(dbSslMode)) return undefined;

	const base64data = process.env.DB_CA_CERT;
	const buff = Buffer.from(base64data, 'base64');
	const sslCert = buff.toString('ascii');
	return {
		rejectUnauthorized: true,
		ca: sslCert
	};
}

/**
 * Get logging options based on the provided dbLogging value.
 * @param {string} dbLogging - The value of process.env.DB_LOGGING
 * @returns {false | 'all' | ['query', 'error'] | ['error']} - The logging options
 */
export const getLoggingOptions = (dbLogging: string): false | 'all' | ['query', 'error'] | ['error'] => {
	let loggingOptions: false | 'all' | ['query', 'error'] | ['error'];
	switch (dbLogging) {
		case 'false':
			loggingOptions = false;
			break;
		case 'all':
			loggingOptions = 'all';
			break;
		case 'query':
			loggingOptions = ['query', 'error'];
			break;
		default:
			loggingOptions = ['error'];
	}
	return loggingOptions;
};
