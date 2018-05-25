export class Response {
    constructor(result, statusCode, message, data) {
        this.result = result;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}