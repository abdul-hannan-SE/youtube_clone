class ApiError extends Error {
  constructor(
    statusCode = 500,
    message = "Something went wrong",
    type,
    details,
    success = false
  ) {
    super(message);
    this.statusCode = statusCode;
    this.success = success;
    this.type = type;
    this.details = details;
  }
}
module.exports = ApiError;
