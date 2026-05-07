// يمسك اخطاء async controllers تلقائيا
const asyncHandler = (fn) => (req, res, next) =>

  Promise
    .resolve(fn(req, res, next))
    .catch(next);
// ارسال response ناجح بشكل موحد
const sendSuccess = (res, data, statusCode = 200, meta = {}) =>

  res.status(statusCode).json({
    success: true,
    data,
    ...meta,
  });
// ارسال error response بشكل موحد
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