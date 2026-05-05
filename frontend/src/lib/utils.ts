import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Конвертация западных цифр в арабские (١٢٣ вместо 123)
export function toArabic(value: string | number | null | undefined): string {
  if (value == null) return "";
  return String(value).replace(/[0-9]/g, d => "٠١٢٣٤٥٦٧٨٩"[+d]);
}
