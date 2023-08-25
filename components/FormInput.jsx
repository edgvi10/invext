export default function FormInputComponent({ label, name, type = "text", children, ...props }) {
    const types = {};

    props.id = props.id ?? `input_${name}`;

    if (!props.placeholder) props.placeholder = label ?? "";
    if (props.required && !props.placeholder) props.placeholder = (type == "select") ? "Selecione uma opção" : "Campo obrigatório";

    const options = props.options ?? [];
    delete props.options;

    var colSize = props.colSize ?? null;
    if (props.colSize) delete props.colSize;

    types.text = <input type={type} name={name} className="form-control" {...props} />;
    types.email = <input type="email" name={name} className="form-control" {...props} pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" />;
    types.password = <input type="password" name={name} className="form-control" {...props} />;
    types.number = <input type="number" name={name} className="form-control" {...props} />;
    types.textarea = <textarea name={name} className="form-control" {...props}></textarea>;
    types.select = <select name={name} className="form-select" {...props}>
        {props.placeholder && <option value="">{props.placeholder}</option>}
        {(options) && options.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
        {children}
    </select>;

    return <div className={`${colSize ?? ""}`}>
        <label htmlFor={`${props.id}`} className="form-label">{label} {props.required && <span className="text-danger">*</span>}</label>
        {types[type] ?? types.text}
    </div>
}