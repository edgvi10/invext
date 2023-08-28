import { BaseRepository } from "root/src/libs/database";
import { mysqlDate } from "root/src/utils";

export default class UserRepository extends BaseRepository {
    constructor() {
        super({ table_name: "users" });

        this.use_uuid = true;
        this.use_delete_timestamp = true;

        this.select_params = { table: "users AS user", fields: {}, where: [] };
        const fields = {};
        fields.uuid = "user.uuid";
        fields.name = "user.name";
        fields.email = "user.email";
        fields.phone = "user.phone";

        fields.open_requests = "(SELECT COUNT(*) FROM requests WHERE requests.user_uuid = user.uuid AND requests.status_id = 1)";

        fields.category_uuid = "user.category_uuid";
        fields.category_name = "category.name";

        fields.created_at = "user.created_at";
        fields.updated_at = "user.updated_at";
        fields.deleted_at = "user.deleted_at";

        this.select_params.fields = fields;

        const joins = [];
        joins.push({ table: "categories AS category", on: ["category.uuid = user.category_uuid"] });

        this.select_params.joins = joins;
    }

    async select(params) {
        try {
            var select_params = { ...this.select_params };

            if (params.uuid) select_params.where.push({ "user.uuid": params.uuid });
            if (params.category_uuid) select_params.where.push({ "user.category_uuid": params.category_uuid });

            select_params.order_by = (params.order_by) ? params.order_by + ((params.order_direction) ? params.order_direction.toUpperCase() : " ASC") : "user.name ASC";

            select_params = { ...select_params, ...this.pagination(params) }

            const select_sql = this.dbwalker.select(select_params).toString();
            const result = await this.dbwalker.query(select_sql);

            return result;
        } catch (error) {
            throw error;
        }
    }

    async countOpenRequests(user_uuid, request_uuid) {
        try {
            const select_params = {
                table: "requests",
                fields: { count: "COUNT(*)" },
                where: [{ owner_uuid: user_uuid }, { status_id: 1 }, `uuid != '${request_uuid}'`]
            };

            const select_sql = this.dbwalker.select(select_params).toString();
            const result = await this.dbwalker.query(select_sql);

            return result[0].count;
        } catch (error) {
            throw error;
        }
    }

    async update(raw_data, params) {
        try {
            await this.prepare(raw_data);
            const data = { ...this.data };

            return await super.update(data, { where: [{ uuid: params.uuid }] });
        } catch (error) {
            throw error;
        }
    }

    async delete(uuid) {
        try {
            return await super.update(data, { where: [{ uuid: params.uuid }] });
            const delete_params = {
                table: this.table_name,
                data: {
                    status_id: 3,
                    archived_at: mysqlDate(new Date()),
                },
                where: [{ uuid: uuid }]
            };

            const delete_sql = this.dbwalker.update(delete_params);
            const result = await this.dbwalker.query(delete_sql);
            if (result.affectedRows > 0) return true;
            else return false;
        } catch (error) {
            throw error;
        }
    }
}