export async function middleware(req) {
    try {
        if (req.url.match(/^\/api\//)) {
            const { headers } = req;
            const { authorization } = headers;
            if (!authorization) throw { status: 401, message: 'Unauthorized' };
        }
    } catch (error) {
        throw error;
    }
}