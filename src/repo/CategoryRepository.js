import { BaseRepository } from "root/src/libs/database";
import { mysqlDate } from "root/src/utils";

export default class CategoryRepository extends BaseRepository {
    constructor() {
        super({ table_name: "categories" });

        this.use_uuid = true;
        this.use_delete_timestamp = true;

        this.select_params = { table: "categories AS category", fields: {}, where: [] };
        const fields = {};
        fields.uuid = "category.uuid";
        fields.name = "category.name";
        fields.subject = "category.subject";
        fields.description = "category.description";

        fields.open_requests = "(SELECT COUNT(*) FROM requests WHERE requests.category_uuid = category.uuid AND requests.status_id = 1)";
        fields.users = "(SELECT COUNT(*) FROM users WHERE users.category_uuid = category.uuid)";

        fields.created_at = "category.created_at";
        fields.updated_at = "category.updated_at";
        fields.deleted_at = "category.deleted_at";

        this.select_params.fields = fields;

        const joins = [];

        this.select_params.joins = joins;
    }

    async select(params) {
        try {
            var select_params = { ...this.select_params };

            if (params.uuid) select_params.where.push({ "category.uuid": params.uuid });
            if (params.name) select_params.where.push({ like: "category.name", value: "%" + params.name.split(" ").join("%") + "%" });
            if (params.subject) select_params.where.push({ like: "category.subject", value: "%" + params.subject.split(" ").join("%") + "%" });

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