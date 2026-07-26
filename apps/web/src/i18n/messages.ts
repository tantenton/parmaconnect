/**
 * Loads messages for a given locale synchronously.
 * Used in client components where async import is not available.
 */
export function getMessagesSync(locale: string): Record<string, unknown> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(`../../messages/${locale}.json`);
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("../../messages/id.json");
  }
}

export function loadMessages(locale: string): Promise<Record<string, unknown>> {
  return import(`../../messages/${locale}.json`).then((m) => m.default);
}

export type Messages = Awaited<ReturnType<typeof loadMessages>>;