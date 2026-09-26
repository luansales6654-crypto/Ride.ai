import { normalizePhone } from './phone';

export interface WhatsAppUrlResult {
  url: string | null;
  isValid: boolean;
  phoneNormalized: string | null;
  phoneFormatted: string;
  error?: string;
  warning?: string;
}

/**
 * Builds official WhatsApp click-to-chat URL per section 2:
 * https://wa.me/PHONE_NUMBER?text=ENCODED_MESSAGE
 */
export function buildWhatsAppUrl(phone: string, text: string = ''): WhatsAppUrlResult {
  const phoneRes = normalizePhone(phone);

  if (!phoneRes.isValid || !phoneRes.normalized) {
    return {
      url: null,
      isValid: false,
      phoneNormalized: null,
      phoneFormatted: phoneRes.formatted || phone,
      error: phoneRes.error || 'Telefone inválido ou não informado. Digite um número válido com DDD.',
      warning: phoneRes.warning,
    };
  }

  const encodedText = encodeURIComponent(text || '');
  const url = `https://wa.me/${phoneRes.normalized}?text=${encodedText}`;

  return {
    url,
    isValid: true,
    phoneNormalized: phoneRes.normalized,
    phoneFormatted: phoneRes.formatted,
    warning: phoneRes.warning,
  };
}

/**
 * Opens WhatsApp click-to-chat link in a new tab or window.
 */
export function openWhatsAppChat(phone: string, text: string): { success: boolean; error?: string } {
  const result = buildWhatsAppUrl(phone, text);

  if (!result.isValid || !result.url) {
    return {
      success: false,
      error: result.error || 'Informe um número de WhatsApp válido antes de enviar.',
    };
  }

  try {
    window.open(result.url, '_blank', 'noopener,noreferrer');
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: 'Não foi possível abrir o link do WhatsApp no seu navegador.',
    };
  }
}
