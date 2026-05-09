export const toFormData = (obj: any, fd = new FormData(), pre = "") => {
    for(const key in obj) {
        if(!Object.prototype.hasOwnProperty.call(obj, key)) {
            continue;
        }

        const value = obj[key];
        const name = pre ? `${pre}[${key}]` : key;

        if(value instanceof File || value instanceof Blob) {
            fd.append(name, value);
        }
        else if(Array.isArray(value) || (typeof value === "object" && value !== null)) {
            toFormData(value, fd, name);
        }
        else {
            fd.append(name, value ?? "");
        }
    }

    return fd;
};
