import { BaseRepository } from "root/src/libs/database";
import UserRepository from "root/src/repo/UsersRepository";

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

    async prepare(raw_data) {
        if (raw_data.status_id)
            switch (parseInt(raw_data.status_id)) {
                case 2:
                    raw_data.closed_at = mysqlDate(new Date());
                    raw_data.archived_at = null;
                    break;
                case 3:
                    raw_data.archived_at = mysqlDate(new Date());
                    raw_data.closed_at = null;
                    break;
                default:
                    raw_data.closed_at = null;
                    raw_data.archived_at = null;
                    break;
            }

        await super.prepare(raw_data);
    }

    async select(params) {
        try {
            var select_params = { ...this.select_params };

            if (params.uuid) select_params.where.push(`request.uuid = '${params.uuid}'`);
            if (params.user_uuid) select_params.where.push(`request.user_uuid = '${params.user_uuid}'`);
            if (params.owner_uuid) select_params.where.push(`request.owner_uuid = '${params.owner_uuid}'`);
            if (params.category_uuid) select_params.where.push(`request.category_uuid = '${params.category_uuid}'`);
            if (params.status_id) select_params.where.push(`request.status_id = '${params.status_id}'`);

            select_params.order_by = (params.order_by) ? params.order_by : ["request.status_id", "request.created_at"];
            select_params.order_direction = (params.order_direction) ? params.order_direction.toUpperCase() : "DESC";

            if (!params.include_archived) select_params.where.push(`request.archived_at IS NULL`);
            if (!params.include_closed) select_params.where.push(`request.closed_at IS NULL`);

            select_params = { ...select_params, ...this.pagination(params) }

            const select_sql = this.dbwalker.select(select_params).toString();
            const result = await this.dbwalker.query(select_sql);

            return result;
        } catch (error) {
            throw error;
        }
    }

    async insert(raw_data) {
        try {
            if (this.use_uuid && !raw_data.uuid) raw_data.uuid = await this.dbwalker.uuid();

            await this.prepare(raw_data);
            const data = { ...this.data };

            if (!data.user_uuid) throw { status: "400", message: "user_uuid is required" };
            const user_repository = new UserRepository();
            const user_requests = await user_repository.countOpenRequests(raw_data.user_uuid);
            if (user_requests >= 3) throw { status: "400", message: "You can't have more than 3 open requests" };

            const insert_params = {
                table: this.table_name,
                data: data
            };

            const insert_sql = this.dbwalker.insert(insert_params);
            const result = await this.dbwalker.query(insert_sql);
            if (result.affectedRows > 0) return data;
            else return false;
        } catch (error) {
            throw error;
        }
    }

    async update(raw_data, params) {
        try {
            await this.prepare(raw_data);
            const data = { ...this.data };

            if (data.status_id == 1 && data.owner_uuid) {
                const user_repository = new UserRepository();
                const user_requests = await user_repository.countOpenRequests(data.owner_uuid, data.request_uuid);
                if (user_requests >= 3) throw { status: "400", message: "User can't have more than 3 open requests" };
            }

            return await super.update(data, { where: [{ uuid: params.uuid }] });
        } catch (error) {
            throw error;
        }
    }

    async delete(uuid) {
        try {
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