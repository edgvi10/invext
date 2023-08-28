export default function IconLoadingComponent({ icon, type = "fal", isLoading, className, ...props }) {
    return <span className={`${className ?? ""}`} {...props}><i className={`${type} ${isLoading ? "fa-spinner-third fa-spin" : icon}`} /></span>
}