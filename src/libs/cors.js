import NextCors from "nextjs-cors";

export default async function cors(req, res) {
    await NextCors(req, res, {
        origin: "*",
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
        headers: ["X-Requested-With", "Content-Type", "Authorization"],
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });
}