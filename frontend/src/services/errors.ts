import axios from "axios";

interface FastApiValidationItem {
  loc: (string | number)[];
  msg: string;
}

function cleanMsg(msg: string): string {
  // Pydantic: "Value error, Parol kamida 8 belgi..." -> "Parol kamida 8 belgi..."
  return msg.replace(/^Value error,\s*/i, "");
}

/** FastAPI xatosini bitta tushunarli matnga aylantiradi. */
export function getErrorMessage(error: unknown, fallback = "Nimadir xato ketdi. Qayta urinib ko'ring."): string {
  if (!axios.isAxiosError(error)) return fallback;
  if (!error.response) {
    return error.code === "ECONNABORTED"
      ? "Server javob bermadi (timeout)."
      : "Serverga ulanib bo'lmadi. Backend ishga tushirilganmi va CORS sozlanganmi — tekshiring.";
  }
  const detail = (error.response.data as { detail?: unknown } | undefined)?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length) return cleanMsg((detail[0] as FastApiValidationItem).msg);
  if (error.response.status >= 500) return "Serverda xatolik yuz berdi.";
  return fallback;
}

/** 422 xatolarini forma maydonlari bo'yicha: { password: "Parol kamida..." } */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError(error)) return {};
  const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail;
  if (!Array.isArray(detail)) return {};
  const out: Record<string, string> = {};
  for (const item of detail as FastApiValidationItem[]) {
    const field = item.loc?.[item.loc.length - 1];
    if (typeof field === "string" && field !== "body" && !out[field]) out[field] = cleanMsg(item.msg);
  }
  return out;
}

export function isNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}
