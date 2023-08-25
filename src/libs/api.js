import axios from "axios";

const Api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL
});


Api.interceptors.request.use(async (config) => {
    const token = process.env.NEXT_PUBLIC_API_TOKEN;

    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default Api;