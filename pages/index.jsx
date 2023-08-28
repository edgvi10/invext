import { useEffect, useState } from "react";
import api from "root/src/libs/api";
import { ApiRequestErrorHandler, dateMask, isEmpty } from "root/src/utils";

import HeaderComponent from "root/components/HeaderComponent";
import FormInput from "root/components/FormInputComponent";
import IconLoading from "root/components/IconLoadingComponent";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


export default function HomePage() {
    const [loading, toggleLoading] = useState({});

    const [users, setUsers] = useState([]);
    const getUsers = async () => {
        try {
            toggleLoading({ ...loading, getUsers: true });

            const api_request = await api.get("/users");
            const response_data = api_request.data;
            if (response_data.users) setUsers(response_data.users);
            else throw new Error(response_data.message);
        } catch (error) {
            alert(ApiRequestErrorHandler(error).message);
        } finally {
            toggleLoading({ ...loading, getUsers: false });
        }
    }

    const [user_logged, setUserLogged] = useState({});
    const selectUserLoggedIn = (user) => {
        setUserLogged(user);
    }

    const [categories, setCategories] = useState([]);
    const getCategories = async () => {
        try {
            toggleLoading({ ...loading, getCategories: true });

            const params = { user_uuid: user_logged.uuid }
            if (user_logged.category_uuid !== null) params.category_uuid = user_logged.category_uuid;

            const api_request = await api.get("/categories", { params });
            const response_data = api_request.data;
            if (response_data.categories) setCategories(response_data.categories);
            else throw new Error(response_data.message);
        } catch (error) {
            alert(ApiRequestErrorHandler(error).message);
        } finally {
            toggleLoading({ ...loading, getCategories: false });
        }
    }

    const [requests, setRequests] = useState([]);
    const getRequests = async () => {
        try {
            toggleLoading({ ...loading, getRequests: true });

            const params = {}
            if (!isEmpty(user_logged.category_uuid)) {
                params.user_uuid = user_logged.uuid;
                params.category_uuid = user_logged.category_uuid;
            }

            const api_request = await api.get("/requests", { params });
            const response_data = api_request.data;
            if (response_data.requests) setRequests(response_data.requests);
            else throw new Error(response_data.message);
        } catch (error) {
            alert(ApiRequestErrorHandler(error).message);
        } finally {
            toggleLoading({ ...loading, getRequests: false });
        }
    }

    const [requests_sort, setRequestsSort] = useState({ field: "created_at", asc: true });
    const sortRequests = (field) => {
        if (requests_sort.field === field) setRequestsSort({ ...requests_sort, asc: !requests_sort.asc });
        else setRequestsSort({ field, asc: true });

        const sorted = requests.sort((a, b) => {
            if (a[field] < b[field]) return -1;
            if (a[field] > b[field]) return 1;
            return 0;
        });
        if (!requests_sort.asc) sorted.reverse();
        setRequests([...sorted]);
    }

    const [request_form, setRequestFormData] = useState({});
    const requestInputHandler = ({ target }) => {
        setRequestFormData({ ...request_form, [target.name]: target.value ?? null });
    }

    const requestSubmit = async (event) => {
        try {
            event.preventDefault();
            toggleLoading({ ...loading, requestSubmit: true });

            const params = {};
            var api_request;
            if (request_form.uuid) {
                params.uuid = request_form.uuid;
                api_request = await api.put("/requests", request_form, { params });
            } else {
                if (!request_form.user_uuid) request_form.user_uuid = user_logged.uuid;
                if (!request_form.owner_uuid) request_form.owner_uuid = user_logged.uuid;

                api_request = await api.post("/requests", request_form);
            }

            const response_data = api_request.data;
            if (response_data.success) {
                getRequests();
                setRequestFormData({});
            } else throw new Error(data.message);
        } catch (error) {
            alert(ApiRequestErrorHandler(error).message);
        } finally {
            toggleLoading({ ...loading, requestSubmit: false });
        }
    }

    useEffect(() => {
        getUsers();
    }, []);

    useEffect(() => {
        getCategories();
        getRequests();
    }, [user_logged]);


    const status_list = [
        { value: 1, label: "Aberto" },
        { value: 2, label: "Fechado" },
        { value: 3, label: "Arquivado" }
    ];

    const form_inputs = [];
    form_inputs.push({ label: "Título", name: "title", type: "text", colSize: "col-12 col-xl-6", placeholder: "Informe o assunto", required: true });
    form_inputs.push({
        label: "Categoria", name: "category_uuid", type: "select", placeholder: "Selecione uma categoria", colSize: "col-12 col-xl-6", required: true,
        options: categories.map(cat => { return { value: cat.uuid, label: cat.subject } })
    });
    form_inputs.push({ label: "Descrição", name: "description", type: "textarea", placeholder: "Descreva a solicitação", rows: 5, colSize: "col-12" });
    form_inputs.push({ label: "Solução", name: "solution", type: "textarea", placeholder: "Descreva a solução", rows: 5, colSize: "col-12", visibleWhen: { isset: ["uuid"] } });
    form_inputs.push({ label: "Situação", name: "status_id", type: "select", options: status_list, colSize: "col-12 col-xl-6", visibleWhen: { isset: ["uuid"] } });
    form_inputs.push({
        label: "Usuário Responsável", name: "owner_uuid", type: "select", placeholder: "Selecione um usuário", colSize: "col-12 col-xl-6",
        options: users.map(user => { return { value: user.uuid, label: user.name } })
    });
    form_inputs.push({
        label: "Atendente", name: "user_uuid", type: "select", placeholder: "Selecione um usuário", colSize: "col-12 col-xl-6", required: true, readOnly: true, visibleWhen: { isset: ["uuid"] },
        defaultValue: user_logged.uuid ?? "",
        options: users.map(user => { return { value: user.uuid, label: user.name } })
    });

    const requests_table = [];
    requests_table.push({ label: "Categoria", name: "category_name", type: "text", colSize: "col-12 col-xl-6" });
    requests_table.push({ label: "Título", name: "title", type: "text", colSize: "col-12 col-xl-6", onClick: "setRequestFormData", });
    requests_table.push({ label: "Situação", name: "status_name", type: "text", colSize: "col-12 col-xl-6" });
    requests_table.push({ label: "Atendente", name: "user_name", type: "text", colSize: "col-12 col-xl-6" });
    requests_table.push({ label: "Responsável", name: "owner_name", type: "text", colSize: "col-12 col-xl-6" });
    requests_table.push({ label: "Criado em", name: "created_at", type: "text", colSize: "col-12 col-xl-6", useMask: true, mask: "date" });

    return <main>
        <HeaderComponent title="Solicitações" active="Solicitações" />

        <div className="">
            <div className="container-fluid p-3 d-flex flex-column gap-3">
                <select className="form-select me-auto" onChange={({ target }) => selectUserLoggedIn(users.find(user => user.uuid === target.value))}>
                    <option value="">Selecione um usuário</option>
                    {users.map((user, index) => <option key={index} value={user.uuid}>{user.name}</option>)}
                </select>
            </div>

            {(user_logged && user_logged.uuid) && <section className="container-fluid p-3 d-flex flex-column gap-3">
                <header className="section-header">
                    <h1 className="h3">Solicitações: {user_logged.category_name}</h1>
                </header>

                <div className="navbar m-0">
                    {/* <button className="btn btn-primary btn-sm" onClick={() => setRequestFormData({})}>Nova solicitação <IconLoading className="ms-2" icon="fa-plus" isLoading={loading.getUsers} /></button> */}

                    <button className="btn btn-outline-primary btn-sm" onClick={getRequests} disabled={loading.getRequests}>Atualizar lista <IconLoading className="ms-2" icon="fa-sync" isLoading={loading.getRequests} /></button>
                </div>
                <div className="row g-3">
                    <div className="col-12 col-md-8 order-md-2">

                        <table className="table table-hover rounded border rounded">
                            <thead>
                                <tr>
                                    {requests_table.map((field, index) => {
                                        return <th key={index} onClick={() => sortRequests(field.name)}>
                                            {field.label}
                                            {requests_sort.field === field.name && <i className={`fal ms-2 fa-sort-${requests_sort.asc ? "up" : "down"}`}></i>}
                                        </th>
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((request, index) => <tr key={index}>
                                    {requests_table.map((field, index) => {
                                        const { label, onClick, ...props } = field;
                                        var value = request[field.name];
                                        if (field.useMask)
                                            switch (field.mask) {
                                                case "date": value = dateMask("d/m/y H:i", value); break;
                                            }

                                        return <td key={index} onClick={() => field.onClick && eval(`${field.onClick}(${JSON.stringify(request)})`)} {...props}>
                                            {value}
                                        </td>
                                    })}
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
                    <div className="col-12 col-md-4 order-md-1">
                        <section className="card">
                            <div className="card-body p-3">
                                <form onSubmit={requestSubmit} className="d-flex flex-column">
                                    <fieldset disabled={loading.requestSubmit} className="row g-3">
                                        {form_inputs.map((input, index) => {
                                            if (input.visibleWhen) {
                                                let visible = true;
                                                if (input.visibleWhen.isset) visible = input.visibleWhen.isset.every(field => request_form[field] !== undefined && request_form[field] !== null);
                                                if (input.visibleWhen.notset) visible = input.visibleWhen.notset.some(field => request_form[field] === undefined || request_form[field] === null);
                                                if (!visible) return null;
                                            }
                                            delete input.visibleWhen;
                                            return <FormInput key={index} {...input} value={request_form[input.name] ?? ""} onChange={requestInputHandler} />
                                        })}
                                    </fieldset>
                                </form>
                            </div>
                            <footer className="card-footer p-3 d-flex flex-row gap-3">
                                <button type="button" className="btn btn-outline-danger me-auto" onClick={() => setRequestFormData({})}>Cancelar</button>
                                <button type="button" className="btn btn-primary" onClick={requestSubmit} disabled={loading.requestSubmit}>Salvar Solicitação <IconLoading icon="fa-save" isLoading={loading.requestSubmit} /></button>
                            </footer>
                        </section>
                    </div>
                </div>
            </section>}
        </div>
    </main>
}