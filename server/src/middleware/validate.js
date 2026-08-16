import { ApiError } from "../utils/ApiError.js";

export function validate(schema, source = "body") {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      throw new ApiError(422, "Validation failed", result.error.issues);
    }
    req[source] = result.data;
    next();
  };
}
