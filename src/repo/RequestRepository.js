import { BaseRepository } from "root/src/libs/database";
import { mysqlDate } from "root/src/utils";

export default class RequestRepository extends BaseRepository {
    constructor() {
        super({ table_name: "requests" });

        this.use_uuid = true;

        this.select_params = { table: "requests AS request", fields: {}, where: [] };
        const fields = {};
        fields.uuid = "request.uuid";

        fields.user_uuid = "request.user_uuid";
        fields.user_name = "user.name";

        fields.owner_uuid = "request.owner_uuid";
        fields.owner_name = "owner.name";

        fields.title = "request.title";
        fields.description = "request.description";

        fields.category_uuid = "request.category_uuid";
        fields.category_name = "category.name";

        fields.status_id = "request.status_id";
        fields.status_name = "status.name";

        fields.created_at = "request.created_at";
        fields.updated_at = "request.updated_at";
        fields.closed_at = "request.closed_at";
        fields.archived_at = "request.archived_at";

        this.select_params.fields = fields;

        const joins = [];
        joins.push({ table: "users AS user", on: ["user.uuid = request.user_uuid"] });
        joins.push({ table: "users AS owner", on: ["owner.uuid = request.owner_uuid"] });
        joins.push({ table: "categories AS category", on: ["category.uuid = request.category_uuid"] });
        joins.push({ table: "status AS status", on: ["status.id = request.status_id"] });

        this.select_params.joins = joins;
    }

    async select(params) {
        try {
            var select_params = { ...this.select_params };

            if (params.uuid) select_params.where.push({ "request.uuid": params.uuid });
            if (params.status_id) select_params.where.push({ "request.status_id": params.status_id });
            if (params.user_uuid) select_params.where.push({ "request.user_uuid": params.user_uuid });
            if (params.category_uuid) select_params.where.push({ "request.category_uuid": params.category_uuid });

            if (params.order_by) select_params.order_by = params.order_by;
            if (params.order_direction) select_params.order_direction = params.order_direction;

            select_params = { ...select_params, ...this.pagination(params) }

            const select_sql = this.dbwalker.select(select_params).toString();
            const result = await this.dbwalker.query(select_sql);

            return result;
        } catch (error) {
            throw error;
        }
    }

    async update(raw_data, params) {
        try {
            const prepared_data = await this.prepare(raw_data);
            const data = { ...prepared_data };

            const update_params = { table: this.table_name, data, where: [{ uuid: params.uuid }] };
            const update_sql = this.dbwalker.update(update_params).toString();
            console.log(update_sql);
            const result = await this.dbwalker.query(update_sql);
            if (result.affectedRows > 0) return true;
            else return false;
        } catch (error) {
            throw error;
        }
    }

    async delete(uuid) {
        try {
            const delete_params = {
                table: this.table_name,
                data: {
                    status_id: 2,
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