import { useEffect, useState } from "react";
import FormInputComponent from "root/components/FormInputComponent";
import HeaderComponent from "root/components/HeaderComponent";
import IconLoadingComponent from "root/components/IconLoadingComponent";
import Api from "root/src/libs/api";
import { ApiRequestErrorHandler, sleep } from "root/src/utils";

export default function CategoriesPage({ ...props }) {
    const [loading, toggleLoading] = useState({});
    const [categories, setCategories] = useState([]);
    const [category_form, setCategoryFormData] = useState({});
    const [category_users, setCategoryUsers] = useState([]);

    const categoryFormDataHandler = (event) => {
        const { name, value } = event.target;
        setCategoryFormData({ ...category_form, [name]: value });
    }

    const getCategories = async () => {
        try {
            toggleLoading({ ...loading, getCategories: true });
            const api_request = await Api.get("/categories");
            const response_data = api_request.data;

            if (response_data.categories) setCategories(response_data.categories);
            else throw new Error("Erro ao buscar categorias");
        } catch (error) {
            console.log(error);
            alert(ApiRequestErrorHandler(error));
        } finally {
            toggleLoading({ ...loading, categories: false });
        }
    }

    const saveCategory = async (event) => {
        try {
            if (event) event.preventDefault();
            toggleLoading({ ...loading, saveCategory: true });

            if (!category_form.name) throw new Error("O campo nome é obrigatório");
            if (!category_form.subject) throw new Error("O campo assunto é obrigatório");

            if (category_form.uuid) {
                const api_request = await Api.put(`/categories`, category_form, { params: { uuid: category_form.uuid } });
                const response_data = api_request.data;

                if (response_data.success) {
                    alert("Categoria atualizada com sucesso");
                    setCategoryFormData({});
                    getCategories();
                } else throw new Error("Erro ao atualizar categoria");
            } else {
                const api_request = await Api.post(`/categories`, category_form);
                const response_data = api_request.data;

                if (response_data.category) {
                    alert("Categoria cadastrada com sucesso");
                    setCategoryFormData({});
                    getCategories();
                } else throw new Error("Erro ao cadastrar categoria");
            }

        } catch (error) {
            console.log(error);
            alert(ApiRequestErrorHandler(error));
        } finally {
            toggleLoading({ ...loading, saveCategory: false });
        }
    }

    const deleteCategory = async (category_uuid) => {
        try {
            toggleLoading({ ...loading, deleteCategory: true });
            const api_request = await Api.delete(`/categories`, { params: { uuid: category_uuid } });
            const response_data = api_request.data;

            if (response_data.success) {
                alert("Categoria excluída com sucesso");
                setCategoryFormData({});
                getCategories();
            } else throw new Error("Erro ao excluir categoria");
        } catch (error) {
            console.log(error);
            alert(ApiRequestErrorHandler(error));
        } finally {
            toggleLoading({ ...loading, deleteCategory: false });
        }
    }

    const getCategoryUsers = async (category_uuid) => {
        try {
            toggleLoading({ ...loading, getCategoryUsers: true });
            const api_request = await Api.get(`/users`, { params: { category_uuid } });
            const response_data = api_request.data;

            if (response_data.users) setCategoryUsers(response_data.users);
            else throw new Error("Erro ao buscar usuários");
        } catch (error) {
            console.log(error);
            alert(ApiRequestErrorHandler(error));
        } finally {
            toggleLoading({ ...loading, category_users: false });
        }
    }

    const category_table = {};
    category_table.name = { label: "Nome", type: "text", centered: false };
    category_table.subject = { label: "Assunto", type: "text", centered: false };
    category_table.users = { label: "Usuários", type: "number", centered: true };
    category_table.open_requests = { label: "Solicitações abertas", type: "number", centered: true };
    category_table.actions = {
        label: "Ações", type: "actions", content: [
            {
                label: "Editar", type: "button", className: "btn btn-sm btn-primary", onclick: "setCategoryFormData"
            }
        ]
    };

    const category_users_table = {};
    category_users_table.name = { label: "Nome", type: "text", centered: false };
    category_users_table.phone = { label: "Telefone", type: "phone", centered: false };
    category_users_table.email = { label: "E-mail", type: "text", centered: false };

    const category_fields = {};
    category_fields.name = { name: "name", label: "Nome", type: "text", placeholder: "Nome da categoria", required: true };
    category_fields.subject = { name: "subject", label: "Assunto", type: "text", placeholder: "Assunto da categoria", required: true };
    category_fields.description = { name: "description", label: "Descrição", type: "textarea", rows: 3, placeholder: "Descrição da categoria" };

    useEffect(() => {
        getCategories();
    }, []);

    useEffect(() => {
        if (category_form.uuid) getCategoryUsers(category_form.uuid);
    }, [category_form]);

    return <main>
        <HeaderComponent title={"Categorias"} active={"Categorias"} />

        <section className="container-fluid p-3 d-flex flex-column gap-3">
            <header className="section-header">
                <h3 className="section-title">Categorias</h3>
            </header>

            <table className="table table-hover table-striped table-bordered table-sm">
                <thead>
                    <tr>
                        {Object.keys(category_table).map((key, index) => {
                            const item = category_table[key];
                            return <th key={index} className={item.centered ? "text-center" : ""}>{item.label}</th>
                        })}
                    </tr>
                </thead>
                <tbody>
                    {(loading.getCategories) && <tr><td colSpan={Object.keys(category_table).length} className="text-center p-5"><IconLoadingComponent className="text-primary h3" isLoading={loading.getCategories} /></td></tr>}
                    {(categories.length === 0 && !loading.getCategories) && <tr><td colSpan={Object.keys(category_table).length} className="text-center">Nenhuma categoria encontrada</td></tr>}

                    {(categories.length > 0 && !loading.getCategories) && categories.map((category, index) => {
                        return <tr key={index}>
                            {Object.keys(category_table).map((key, index) => {
                                const item = category_table[key];
                                return <td key={index} className={item.centered ? "text-center" : ""}>
                                    {item.type === "actions" ? item.content.map((action, index) => {
                                        const { label, onclick, ...props } = action;

                                        return <button key={index} type="button" onClick={() => {
                                            if (onclick === "setCategoryFormData") setCategoryFormData(category);
                                        }} {...props}>{label}</button>
                                    }) : category[key]}
                                </td>
                            })}
                        </tr>
                    })}
                </tbody>
            </table>
        </section>

        <section className="container-fluid p-3">
            <form onSubmit={saveCategory} className="card">
                <header className="card-header">
                    <h3 className="card-title h4">{(category_form.uuid) ? "Editar" : "Nova"} Categoria</h3>
                </header>
                <div className="card-body p-3 d-flex flex-column gap-3">
                    <fieldset className="row g-3" disabled={loading.saveCategory}>
                        {Object.keys(category_fields).map((key, index) => {
                            const field_props = category_fields[key];
                            return <FormInputComponent key={index} {...field_props} value={category_form[key] || ""} onChange={categoryFormDataHandler} />
                        })}
                    </fieldset>

                    {(category_form.uuid) && <>
                        <div className="modal fade" id="categoryUsersModal" tabIndex="-1" aria-labelledby="categoryUsersModalLabel" aria-hidden="true">
                            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-md-down">
                                <section className="modal-content">
                                    <header className="modal-header p-3">
                                        <h5 className="modal-title" id="categoryUsersModalLabel">Usuários da categoria {category_form.name}</h5>
                                    </header>
                                    <div className="modal-body p-3">
                                        <table className="table table-hover table-striped table-bordered table-sm">
                                            <thead>
                                                <tr>
                                                    {Object.keys(category_users_table).map((key, index) => {
                                                        const item = category_users_table[key];
                                                        return <th key={index} className={item.centered ? "text-center" : ""}>{item.label}</th>
                                                    })}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(loading.getCategoryUsers) && <tr><td colSpan={4} className="text-center p-5"><IconLoadingComponent className="text-primary h3" isLoading={loading.getCategoryUsers} /></td></tr>}
                                                {(category_users.length === 0 && !loading.getCategoryUsers) && <tr><td colSpan={4} className="text-center">Nenhum usuário encontrado</td></tr>}

                                                {(category_users.length > 0 && !loading.getCategoryUsers) && category_users.map((user, index) => {
                                                    return <tr key={index}>
                                                        {Object.keys(category_users_table).map((key, index) => {
                                                            const item = category_users_table[key];
                                                            return <td key={index} className={item.centered ? "text-center" : ""}>{user[key]}</td>
                                                        })}
                                                    </tr>
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <footer className="modal-footer p-3">
                                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                                    </footer>
                                </section>
                            </div>
                        </div>

                    </>}
                </div>
                <footer className="card-footer d-flex flex-row gap-3 p-3 justify-content-end">
                    {(category_form.uuid) && <>
                        <button type="button" className="btn btn-secondary me-auto" data-bs-toggle="modal" data-bs-target="#categoryUsersModal">Ver usuários</button>
                        <button type="button" className="btn btn-danger" onClick={() => deleteCategory(category_form.uuid)} disabled={loading.deleteCategory}>Excluir<IconLoadingComponent isLoading={loading.deleteCategory} /></button>
                    </>}
                    <button type="button" className="btn btn-outline-danger" onClick={() => setCategoryFormData({})}>Cancelar</button>
                    <button type="submit" className="btn btn-success" disabled={loading.saveCategory}>Salvar<IconLoadingComponent isLoading={loading.saveCategory} /></button>
                </footer>
            </form>


        </section>
    </main>
}