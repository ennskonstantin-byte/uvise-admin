import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Standard-shadcn-Helfer: kombiniert Klassennamen und löst
// Tailwind-Konflikte auf (die letzte Klasse gewinnt).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
