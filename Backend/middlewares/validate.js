import logger from "../utils/logger.js";

/**
 * Enterprise Zod Request Validation Middleware
 * Validates req.body, req.query, and req.params against provided Zod schema.
 * Returns consistent 422 Unprocessable Entity on validation errors.
 */
export const validate = (schema) => async (req, res, next) => {
    try {
        const parsed = await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        // Replace request properties with parsed/coerced data
        if (parsed.body !== undefined) req.body = parsed.body;
        if (parsed.query !== undefined) req.query = parsed.query;
        if (parsed.params !== undefined) req.params = parsed.params;

        next();
    } catch (error) {
        const issues = error.issues || error.errors;

        if (issues && Array.isArray(issues)) {
            const formattedErrors = issues.map((err) => ({
                field: Array.isArray(err.path) ? err.path.slice(1).join(".") || err.path[0] || "request" : "field",
                message: err.message,
                location: Array.isArray(err.path) ? err.path[0] || "body" : "body",
            }));

            logger.warn("Validation Error on incoming request", {
                url: req.originalUrl || req.url,
                method: req.method,
                errors: formattedErrors,
                correlationId: req.correlationId,
            });

            return res.status(422).json({
                message: "Validation failed. Please check your input.",
                errors: formattedErrors,
                success: false,
            });
        }

        next(error);
    }
};

export default validate;
