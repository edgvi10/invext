import UserRepository from "root/src/repo/UsersRepository";

export default async function handler(req, res) {
    try {
        const { method, headers, query, body } = req;

        const user_repository = new UserRepository();

        if (method === "GET") {
            const params = { ...query };
            const select_result = await user_repository.select(params);
            return res.status(200).json({ users: select_result });
        }

        if (method === "POST") {
            const data_raw = { ...body };

            const insert_result = await user_repository.insert(data_raw);
            if (insert_result) {
                const select_user = await user_repository.select({ uuid: insert_result });
                const user_inserted = select_user[0];

                return res.status(201).json({ success: true, user: user_inserted });
            } else {
                throw { status: "400", message: "User not created" }
            }
        }

        if (method === "PUT") {
            if (!query.uuid && !query.user_uuid) throw { status: "400", message: "uuid or user_uuid is required" };

            const data_raw = { ...body };
            const update_result = await user_repository.update(data_raw, { uuid: query.uuid || query.user_uuid });
            if (update_result) {
                const select_user = await user_repository.select({ uuid: query.uuid || query.user_uuid });
                const user_updated = select_user[0];

                return res.status(200).json({ success: true, user: user_updated });
            } else {
                throw { status: "400", message: "User not updated" }
            }
        }

        if (method === "DELETE") {
            if (!query.uuid && !query.user_uuid) throw { status: "400", message: "uuid or user_uuid is required" };

            const delete_result = await user_repository.delete(query.uuid || query.user_uuid);

            if (delete_result) {
                return res.status(200).json({ success: true, message: "User deleted" });
            } else {
                throw { status: "400", message: "User not deleted" }
            }
        }

        throw { status: 405, message: 'Method not allowed' }

    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
    }
}