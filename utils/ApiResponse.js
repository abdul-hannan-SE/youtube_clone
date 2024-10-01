class ApiResponse {
    constructor(statusCode = 200, message = "Success", data = null, meta = {}, links = {}) {
        this.data = data;
        this.message = message;
        this.statusCode = statusCode;
        this.success = statusCode < 400;
        this.meta = meta;
        this.links = links;
    }
}
module.exports = { ApiResponse };