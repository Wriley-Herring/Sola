import { vi } from "vitest";

type MaybeResult<T> = { data: T; error: null } | { data: null; error: { code?: string; message: string } };

export function createSelectBuilder<T>(result: MaybeResult<T>) {
  return {
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(async () => result),
    single: vi.fn(async () => result)
  };
}

export function createSupabaseMock(overrides: Record<string, unknown> = {}) {
  return {
    auth: {
      getUser: vi.fn(async () => ({ data: { user: null } })),
      signOut: vi.fn(async () => ({ error: null }))
    },
    from: vi.fn(),
    ...overrides
  };
}
