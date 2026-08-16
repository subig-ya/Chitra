import { ApiError } from "../utils/ApiError.js";

export function validate(schema, source = "body") {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      throw new ApiError(422, "Validation failed", result.error.issues);
    }
    if (source === "query") {
      req.validatedQuery = result.data;
    } else if (source === "params") {
      req.validatedParams = result.data;
    } else {
      req[source] = result.data;
    }
    next();
  };
}
