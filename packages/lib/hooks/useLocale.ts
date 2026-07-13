type TranslateFn = (key: string, values?: Record<string, unknown>) => string;

export function useLocale() {
  const t: TranslateFn = (key) => key;
  return {
    t,
    isLocaleReady: true,
    i18n: {
      language: "en",
      exists: (_key: string) => false,
    },
  };
}
