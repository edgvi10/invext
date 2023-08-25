export default function IconLoadingComponent({ icon, size = "1x", type = "fal", isLoading, ...props }) {
    return <i className={`${type} ${isLoading ? "fa-spinner-third fa-spin" : icon}`} {...props} />
}