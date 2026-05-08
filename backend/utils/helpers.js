const asyncHandler = (fn) => (req, res, next) =>
  Promise
    .resolve(fn(req, res, next))
    .catch(next);
const sendSuccess = (res, data, statusCode = 200, meta = {}) =>

  res.status(statusCode).json({
    success: true,
    data,
    ...meta,
  });
const sendError = (res, message, statusCode = 400) =>
  res.status(statusCode).json({
    success: false,
    message,
  });
module.exports = {
  asyncHandler,
  sendSuccess,
  sendError,
};