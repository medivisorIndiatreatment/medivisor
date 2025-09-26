export function formatStringToArray(data: string[] | string | null | undefined): string[] {
  if (!data) return []
  if (Array.isArray(data)) return data.map((item) => String(item).trim())
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data.replace(/'/g, '"'))
      if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim())
    } catch (e) {
      return data.split(",").map((item) => item.trim())
    }
  }
  return []
}

export function parseSocialLinks(data: string | null | undefined): Record<string, string> {
  if (!data || typeof data !== "string") return {}
  try {
    const parsed = JSON.parse(data.replace(/'/g, '"'))
    if (typeof parsed === "object" && parsed !== null) return parsed
  } catch (e) {
    console.error("Failed to parse social links string:", e)
  }
  return {}
}

export function parseFaqs(data: string | null | undefined): { question: string; answer: string }[] {
  if (!data || typeof data !== "string") return []
  try {
    return JSON.parse(data)
  } catch (e) {
    console.error("Failed to parse FAQs string:", e)
  }
  return []
}