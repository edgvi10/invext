export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function isEmpty(value) {
    return value === undefined || value === null || value === '' || value.toString().trim().length === 0;
}

export function mysqlDate(date) {
    // check if is Date object
    return (date && date instanceof Date) ? date.toISOString().slice(0, 19).replace('T', ' ') : new Date(date ?? "").toISOString().slice(0, 19).replace('T', ' ');
}

export function mysqlDateToJSDate(date) {
    return new Date(date);
}

export function dateMask(mask, date) {
    const date_object = (date && date instanceof Date) ? date : new Date(date ?? "");

    const date_parts = {};
    date_parts["Y"] = date_object.getFullYear();
    date_parts["y"] = date_object.getFullYear().toString().slice(-2);
    date_parts["m"] = (date_object.getMonth() + 1).toString().padStart(2, "0");
    date_parts["d"] = date_object.getDate().toString().padStart(2, "0");
    date_parts["H"] = date_object.getHours().toString().padStart(2, "0");
    date_parts["h"] = (date_object.getHours() % 12).toString().padStart(2, "0");
    date_parts["i"] = date_object.getMinutes().toString().padStart(2, "0");
    date_parts["s"] = date_object.getSeconds().toString().padStart(2, "0");

    let date_string = mask;
    for (const key in date_parts) {
        date_string = date_string.replace(key, date_parts[key]);
    }

    return date_string;
}

export function apiHandler(error, res) {
    console.log(error);
    if (error.status) {
        return res.status(error.status).json({ message: error.message });
    } else {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export function ApiRequestErrorHandler(error) {
    console.log(error);
    if (error.response) {
        return { status: error.response.status, message: error.response.data.message };
    } else {
        return { status: 500, message: "Internal server error" };
    }
}