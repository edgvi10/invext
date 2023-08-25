export async function middleware(req) {
    try {
        if (req.url.match(/^\/api\//)) {
            const { headers } = req;
            const { authorization } = headers;
            if (!authorization) throw { status: 401, message: 'Unauthorized' };

            const token = authorization.replace(/^Bearer\s/, '');
            if (!token) throw { status: 401, message: 'Unauthorized' };
            if (token !== process.env.NEXT_PUBLIC_API_TOKEN) throw { status: 401, message: 'Unauthorized' };

            return;
        }
    } catch (error) {
        throw error;
    }
}