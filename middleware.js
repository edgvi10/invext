export function middleware(req, event) {
    const pathName = req.nextUrl.pathname;

    if (pathName.startsWith('/api/')) {
        const authorizationHeader = req?.headers?.get('authorization');
        let wrongCredentials = true;

        if (authorizationHeader) {
            const token = authorizationHeader.replace(/^Bearer\s/, '');
            if (token == process.env.NEXT_PUBLIC_API_TOKEN) wrongCredentials = false;
        }

        if (!authorizationHeader || wrongCredentials) {
            return new Response('401 Unauthorized', {
                status: 401,
                message: "Not permited"
            });
        }
    }
}