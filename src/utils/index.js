export function isEmpty(value) {
    return value === undefined || value === null || value === '' || value.toString().trim().length === 0;
}

export function mysqlDate(date) {
    // check if is Date object
    return (date && date instanceof Date) ? date.toISOString().slice(0, 19).replace('T', ' ') : new Date(date ?? "").toISOString().slice(0, 19).replace('T', ' ');
}