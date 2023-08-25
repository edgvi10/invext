import DBWalker from "dbwalker";
import { isEmpty, mysqlDate } from "root/src/utils";

export function ERPWalker(connection_string) {
    try {
        if (!connection_string) throw new Error("Connection string is required");
        return new DBWalker(connection_string);
    } catch (error) {
        console.log("[ERPWalker]", error);
        throw error;
    }
}

export class BaseRepository {
    constructor(connection_string, table_name) {
        if (!connection_string) connection_string = process.env.DBWALKER_STRING;
        if (!connection_string) throw new Error("Connection string is required");

        if (!table_name || isEmpty(table_name)) throw new Error("Table name is required");

        this.dbwalker = ERPWalker(connection_string);
        this.table_name = table_name;
        this.select_params = {
            table_name: table_name,
            fields: {},
            where: [],
        }

        this.use_uuid = false;
        this.use_delete_timestamp = false;
    }

    async select(params) {
        try {
            const select_params = { table: this.table_name, ...params };
            const select_sql = this.dbwalker.select(select_params);

            const result = await this.dbwalker.query(select_sql);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async insert(data) {
        try {
            if (this.use_uuid && !data.uuid) data.uuid = await this.dbwalker.uuid();

            const insert_params = { table: this.table_name, data };
            const insert_sql = this.dbwalker.insert(insert_params);

            const result = await this.dbwalker.query(insert_sql);
            if (result.affectedRows > 0) return result.insertId;
            else return false;
        } catch (error) {
            throw error;
        }
    }

    async update(data, params) {
        try {
            const update_params = { table: this.table_name, data, ...params };
            const update_sql = this.dbwalker.update(update_params);

            const result = await this.dbwalker.query(update_sql);
            if (result.affectedRows > 0) return result.affectedRows;
            else return false;
        } catch (error) {
            throw error;
        }
    }

    async delete(params, hard = false) {
        try {
            if (hard) {
                const delete_params = { table: this.table_name, ...params };
                const delete_sql = this.dbwalker.delete(delete_params);
            } else {
                if (!this.use_delete_timestamp) throw new Error("Table does not have deleted_at column. Use hard delete instead");
                const delete_params = { table: this.table_name, data: { deleted_at: mysqlDate() }, ...params };
                const delete_sql = this.dbwalker.update(delete_params);
            }

            const result = await this.dbwalker.query(delete_sql);
            return result;
        } catch (error) {
            throw error;
        }
    }
}