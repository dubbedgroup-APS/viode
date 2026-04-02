export const notFound = (request, response) => {
  response.status(404).json({
    message: `Route not found: ${request.originalUrl}`,
  });
};

export const errorHandler = (error, _request, response, _next) => {
  const statusCode = response.statusCode && response.statusCode !== 200
    ? response.statusCode
    : 500;

  response.status(statusCode).json({
    message: error.message || "Something went wrong.",
    stack:
      process.env.NODE_ENV === "production" ? undefined : error.stack,
  });
};

