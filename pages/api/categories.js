import CategoryRepository from "root/src/repo/CategoryRepository";

export default async function handler(req, res) {
    try {
        const { method, headers, query, body } = req;

        const category_repository = new CategoryRepository();

        if (method === "GET") {
            const params = { ...query };
            const select_result = await category_repository.select(params);
            return res.status(200).json({ categories: select_result });
        }

        if (method === "POST") {
            const data_raw = { ...body };

            const insert_result = await category_repository.insert(data_raw);
            if (insert_result) {
                const select_category = await category_repository.select({ uuid: insert_result });
                const category_inserted = select_category[0];

                return res.status(201).json({ success: true, category: category_inserted });
            } else {
                throw { status: "400", message: "Category not created" }
            }
        }

        if (method === "PUT") {
            if (!query.uuid && !query.category_uuid) throw { status: "400", message: "uuid or category_uuid is required" };

            const data_raw = { ...body };
            const update_result = await category_repository.update(data_raw, { uuid: query.uuid || query.category_uuid });
            if (update_result) {
                const select_category = await category_repository.select({ uuid: query.uuid || query.category_uuid });
                const category_updated = select_category[0];

                return res.status(200).json({ success: true, category: category_updated });
            } else {
                throw { status: "400", message: "Category not updated" }
            }
        }

        if (method === "DELETE") {
            if (!query.uuid && !query.category_uuid) throw { status: "400", message: "uuid or category_uuid is required" };

            const delete_result = await category_repository.delete(query.uuid || query.category_uuid);

            if (delete_result) {
                return res.status(200).json({ success: true, message: "Category deleted" });
            } else {
                throw { status: "400", message: "Category not deleted" }
            }
        }

        throw { status: 405, message: 'Method not allowed' }

    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
    }
}