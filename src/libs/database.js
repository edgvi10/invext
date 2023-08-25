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
    constructor({ connection_string, table_name }) {
        if (!connection_string) connection_string = process.env.DBWALKER_CONNECTION_STRING;
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

    pagination(params) {
        if (params.limit && parseInt(params.limit) > 0) {
            if (params.limit && !isNaN(params.limit)) params.limit = parseInt(params.limit);
            if (params.offset && !isNaN(params.offset)) params.offset = parseInt(params.offset);
            else if (params.page && !isNaN(params.page)) params.offset = (parseInt(params.page) - 1) * params.limit;
            else params.offset = 0;
        }

        if (params.order_by) {
            params.order_direction = (params.order_direction) ? params.order_direction.toUpperCase() : "ASC";
            params.order_by = `${params.order_by} ${params.order_direction}`;
        }

        return params;
    }


    async prepare(raw_data) {
        try {
            const data = {};

            const table_fields = await this.dbwalker.describe(this.table_name)
            const table_fields_keys = [];
            for (const field of table_fields) table_fields_keys.push(field.name);

            for (const key in raw_data) {
                if (table_fields_keys.includes(key)) data[key] = raw_data[key];
            }

            return data;
        } catch (error) {

            throw error;
        }
    }

    async select(params) {
        try {
            const select_params = { table: params.table_name ?? this.table_name, ...params };
            const select_sql = this.dbwalker.select(select_params);

            const result = await this.dbwalker.query(select_sql);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async insert(raw_data) {
        try {
            if (this.use_uuid && !raw_data.uuid) raw_data.uuid = await this.dbwalker.uuid();

            const prepared_data = await this.prepare(raw_data);
            const data = { ...prepared_data };

            const insert_params = { table: this.table_name, data };
            const insert_sql = this.dbwalker.insert(insert_params);

            const result = await this.dbwalker.query(insert_sql);
            if (result.affectedRows > 0) return (this.use_uuid) ? data.uuid : result.insertId;
            else return false;
        } catch (error) {
            throw error;
        }
    }

    async update(raw_data, params) {
        try {
            const prepared_data = await this.prepare(raw_data);
            const data = { ...prepared_data };

            if (this.use_uuid) delete data.uuid;

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