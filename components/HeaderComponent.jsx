import Head from "next/head";
import Link from "next/link";

const MenuItem = ({ children, icon, active = false, submenu, ...props }) => {
    const hasSubmenu = (submenu) ? true : false;

    if (!props.href) props.href = "#";

    if (hasSubmenu) {
        props["data-bs-toggle"] = "dropdown";
    }

    return <li className={`nav-item ms-lg-3 ${hasSubmenu && "dropdown"}`}>
        <Link className={`nav-link ${(active) && "active"}`} {...props}>
            {icon && <i className={`fal fa-${icon} me-2`} />}
            {children}
            {hasSubmenu && <i className="fal fa-chevron-down ms-2"></i>}
        </Link>
        {hasSubmenu && <ul className="dropdown-menu dropdown-menu-end">
            {submenu.map((item, index) => {
                const { label, icon, ...props } = item;
                return <li key={index} className="dropdown-item" {...props}>
                    <Link {...props}>{icon && <i className={`fal fa-${icon} me-2`} />}{label}</Link>
                </li>
            })}
        </ul>}
    </li>
}

export default function HeaderComponent({ title, active, hideMenu, ...props }) {
    const menu_items = [];
    menu_items.push({ href: "/", icon: "tasks", label: "Solicitações", });
    menu_items.push({ href: "/users", icon: "user-tie", label: "Usuários", });
    menu_items.push({
        icon: "list", label: "Configurações", submenu: [
            { href: "/config/categories", label: "Categorias", },
        ]
    });
    return <header>
        <Head>
            <title>{`${(title) && title + " - "}Invext`}</title>
        </Head>

        <nav className="navbar navbar-expand-lg navbar-dark bg-dark p-0">
            <div className="container-fluid p-3 py-2">
                <a className="navbar-brand" href="/">Invext</a>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="mainNavbar">
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        {menu_items.map((item, index) => <MenuItem key={index} active={(active == item.label)} {...item}>{item.label}</MenuItem>)}
                    </ul>
                </div>
            </div>
        </nav>
    </header>
}