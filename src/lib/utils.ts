import { contactInfo } from "./content";

export function getWhatsAppLink(message?: string): string {
  const baseUrl = contactInfo.whatsappLink;
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
