import { normalizeBrazilPhone } from './phone';

/**
 * Builds WhatsApp chat URL with encoded text per rule 10.3 and rule 9.4
 */
export function buildWhatsAppUrl(phone: string, text: string = ''): {
  url: string;
  isOverLimit: boolean;
  phoneNormalized: string | null;
  warning?: string;
} {
  const phoneRes = normalizeBrazilPhone(phone);
  
  if (!phoneRes.normalized) {
    // Alternative fallback format without phone
    const fallbackUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    return {
      url: fallbackUrl,
      isOverLimit: fallbackUrl.length > 2000,
      phoneNormalized: null,
      warning: phoneRes.warning || 'Número de telefone inválido. Selecione o contato no WhatsApp.',
    };
  }

  const encodedText = encodeURIComponent(text);
  const fullUrl = `https://wa.me/${phoneRes.normalized}?text=${encodedText}`;

  return {
    url: fullUrl,
    isOverLimit: fullUrl.length > 2000,
    phoneNormalized: phoneRes.normalized,
    warning: phoneRes.warning,
  };
}
