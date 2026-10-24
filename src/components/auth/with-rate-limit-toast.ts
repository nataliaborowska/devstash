import { toast } from "sonner";

interface RateLimitableResult {
  error?: string;
  rateLimited?: boolean;
}

/** Wraps a form server action so rate limit errors show as a toast. */
export function withRateLimitToast<State extends RateLimitableResult>(
  action: (prevState: State | null, formData: FormData) => Promise<State>
) {
  return async (prevState: State | null, formData: FormData): Promise<State> => {
    const result = await action(prevState, formData);
    if (result.rateLimited) toast.error(result.error);
    return result;
  };
}
