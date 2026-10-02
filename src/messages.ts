import catalog from "../custom_components/matter_binding_studio/messages.json";
import { copy, type Copy, type Language } from "./copy";

export type Message = string | { code: string; params?: Record<string, string | number>; fallback?: string };

export function resolveLanguage(hass?: { locale?: { language?: string }; language?: string }): Language {
  const language = (hass?.locale?.language ?? hass?.language ?? "en").toLowerCase().replaceAll("_", "-");
  // Explicit script wins over region; bare Chinese retains the historic default.
  if (/^zh-hans(?:-|$)/.test(language)) return "zh-Hans";
  if (language === "zh" || /^zh-(hant(?:-|$)|tw(?:-|$)|hk(?:-|$)|mo(?:-|$))/.test(language)) return "zh-Hant";
  if (/^zh-(cn|sg|my)(?:-|$)/.test(language)) return "zh-Hans";
  return "en";
}

export function formatMessage(value: Message, t: Copy): string {
  if (typeof value === "string") return value;
  const language = t === copy["zh-Hant"] ? "zh-Hant" : t === copy["zh-Hans"] ? "zh-Hans" : "en";
  const entry = (catalog as Record<string, Record<string, string>>)[value.code];
  const template = entry?.[language] ?? entry?.en ?? value.fallback ?? catalog.unexpected_error[language];
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const parameter = value.params?.[key];
    return parameter === undefined ? match : String(parameter);
  });
}

export function errorMessage(error: unknown): Message {
  if (typeof error === "object" && error !== null) {
    const value = error as { studio_message?: Message; message?: unknown; error?: unknown };
    if (value.studio_message && typeof value.studio_message === "object" && typeof value.studio_message.code === "string") return value.studio_message;
    if (value.error) return errorMessage(value.error);
    if (typeof value.message === "string" && value.message) return value.message;
  }
  return { code: "unexpected_error" };
}

export function decodeMessages(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(decodeMessages);
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  const result = Object.fromEntries(Object.entries(record).map(([key, item]) => [key, decodeMessages(item)]));
  for (const key of ["message", "steps", "warnings", "subjects", "endpoint", "capability"]) {
    if (record[`${key}_i18n`] !== undefined) result[key] = record[`${key}_i18n`];
  }
  return result;
}

export async function studioCall<T>(hass: { callWS<R>(message: { type: string; [key: string]: unknown }): Promise<R> }, request: { type: string; [key: string]: unknown }): Promise<T> {
  return decodeMessages(await hass.callWS(request)) as T;
}
