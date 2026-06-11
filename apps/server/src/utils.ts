export function apiJsonRseponse<T = unknown>(
  status: boolean,
  data: T | null = null,
  message: string = "",
  errors: unknown | null = null,
) {
  return {
    status,
    message,
    data,
    errors,
  };
}
