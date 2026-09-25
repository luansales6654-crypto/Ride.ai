/**
 * Normalizes Brazilian phone numbers according to rule 10.3:
 * - Remove non-digit characters and leading zeros
 * - If 10 or 11 digits, prefix 55
 * - If 12-13 digits starting with 55, keep as is
 * - Validate DDD (11-99)
 */
export function normalizeBrazilPhone(raw: string): {
  normalized: string | null;
  digitsOnly: string;
  isMobile: boolean;
  isLandline: boolean;
  warning?: string;
} {
  if (!raw) {
    return { normalized: null, digitsOnly: '', isMobile: false, isLandline: false, warning: 'Telefone não informado' };
  }

  // Strip non-digits and leading zeros
  let digits = raw.replace(/\D/g, '').replace(/^0+/, '');

  if (digits.length === 10 || digits.length === 11) {
    digits = '55' + digits;
  }

  if (digits.length === 12 || digits.length === 13) {
    if (!digits.startsWith('55')) {
      return { normalized: null, digitsOnly: digits, isMobile: false, isLandline: false, warning: 'Código de país inválido' };
    }

    const ddd = parseInt(digits.slice(2, 4), 10);
    if (ddd < 11 || ddd > 99) {
      return { normalized: null, digitsOnly: digits, isMobile: false, isLandline: false, warning: 'DDD inválido' };
    }

    const numberLength = digits.length - 4; // digits after 55 + DDD

    if (numberLength === 9) {
      // 11 digits original (55 + DDD + 9XXXX-XXXX)
      const firstDigit = digits.charAt(4);
      if (firstDigit === '9') {
        return { normalized: digits, digitsOnly: digits, isMobile: true, isLandline: false };
      }
    } else if (numberLength === 8) {
      // 10 digits original (55 + DDD + XXXX-XXXX)
      return {
        normalized: digits,
        digitsOnly: digits,
        isMobile: false,
        isLandline: true,
        warning: 'Este número parece ser fixo; o WhatsApp pode não funcionar',
      };
    }
  }

  return {
    normalized: digits.length >= 12 ? digits : null,
    digitsOnly: digits,
    isMobile: digits.length === 13,
    isLandline: digits.length === 12,
  };
}
