import RequestRepository from "root/src/repo/RequestRepository";
import UserRepository from "root/src/repo/UsersRepository";

export default async function handler(req, res) {
    try {
        const { method, headers, query, body } = req;

        const user_repository = new UserRepository();
        const request_repository = new RequestRepository();

        if (method === "GET") {

            const params = { ...query };

            const select_result = await request_repository.select(params);

            const requests = [];
            for (const row of select_result) {
                const request_object = { ...row };
                requests.push(request_object);
            }

            return res.status(200).json({ requests });
        }
        if (method === "POST") {
            const data_raw = { ...body };

            const insert_result = await request_repository.insert(data_raw);

            if (insert_result) {
                const select_request = await request_repository.select({ uuid: insert_result.uuid });
                const request_inserted = select_request[0];

                return res.status(201).json({
                    success: true,
                    request: request_inserted
                });
            } else {
                throw { status: "400" }
            }
        }

        if (method === "PUT") {
            if (!query.uuid && !query.request_uuid) throw { status: "400", message: "uuid or request_uuid is required" };

            const data_raw = { ...body };

            const update_result = await request_repository.update(data_raw, { uuid: query.uuid || query.request_uuid });

            if (update_result) {
                const select_request = await request_repository.select({ uuid: query.uuid || query.request_uuid });
                const request_updated = select_request[0];

                return res.status(200).json({
                    success: true,
                    request: request_updated
                });
            } else {
                throw { status: "400" }
            }
        }

        if (method === "DELETE") {
            if (!query.uuid && !query.request_uuid) throw { status: "400", message: "uuid or request_uuid is required" };

            const delete_result = await request_repository.delete(query.uuid || query.request_uuid);

            if (delete_result) {
                return res.status(200).json({
                    success: true,
                    message: "Request deleted"
                });
            } else {
                throw { status: "400" }
            }
        }

        throw { status: 405, message: 'Method not allowed' }

    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
    }
}