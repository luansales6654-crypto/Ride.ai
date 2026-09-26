/**
 * Utility for normalizing and validating Brazilian and International phone numbers.
 */

export interface PhoneValidationResult {
  raw: string;
  normalized: string | null;
  digitsOnly: string;
  isValid: boolean;
  isMobile: boolean;
  isLandline: boolean;
  countryCode: string;
  formatted: string;
  error?: string;
  warning?: string;
}

export function normalizePhone(rawPhone: string): PhoneValidationResult {
  const raw = rawPhone || '';
  if (!raw.trim()) {
    return {
      raw,
      normalized: null,
      digitsOnly: '',
      isValid: false,
      isMobile: false,
      isLandline: false,
      countryCode: '',
      formatted: '',
      error: 'Telefone não informado.',
    };
  }

  // Strip spaces, parens, dashes, dots, non-digits (keep leading + for CC detection)
  const isPlusStarted = raw.trim().startsWith('+');
  let digits = raw.replace(/\D/g, '');

  if (!digits) {
    return {
      raw,
      normalized: null,
      digitsOnly: '',
      isValid: false,
      isMobile: false,
      isLandline: false,
      countryCode: '',
      formatted: '',
      error: 'O telefone deve conter dígitos numéricos válidos.',
    };
  }

  // If starts with 00 (e.g. 005511...), strip leading 00
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  // Handle Brazilian Phone Numbers (10 or 11 digits without 55 country code)
  if (!isPlusStarted && (digits.length === 10 || digits.length === 11)) {
    const ddd = parseInt(digits.slice(0, 2), 10);
    if (ddd >= 11 && ddd <= 99) {
      digits = '55' + digits;
    }
  }

  // Validate Brazilian numbers starting with 55
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    const ddd = parseInt(digits.slice(2, 4), 10);
    if (ddd < 11 || ddd > 99) {
      return {
        raw,
        normalized: null,
        digitsOnly: digits,
        isValid: false,
        isMobile: false,
        isLandline: false,
        countryCode: '55',
        formatted: digits,
        error: `DDD (${ddd}) inválido para números do Brasil.`,
      };
    }

    const numberBody = digits.slice(4);
    const isMobile = numberBody.length === 9 && numberBody.startsWith('9');
    const isLandline = numberBody.length === 8;

    const formatted = `+55 (${digits.slice(2, 4)}) ${numberBody.length === 9 ? `${numberBody.slice(0, 5)}-${numberBody.slice(5)}` : `${numberBody.slice(0, 4)}-${numberBody.slice(4)}`}`;

    return {
      raw,
      normalized: digits,
      digitsOnly: digits,
      isValid: true,
      isMobile,
      isLandline,
      countryCode: '55',
      formatted,
      warning: isLandline ? 'Número fixo detectado. O WhatsApp requer um número móvel com WhatsApp ativo.' : undefined,
    };
  }

  // Handle International numbers or pre-formatted numbers with country code (+ or 12-15 digits)
  if (digits.length >= 8 && digits.length <= 15) {
    const formatted = `+${digits}`;
    return {
      raw,
      normalized: digits,
      digitsOnly: digits,
      isValid: true,
      isMobile: true,
      isLandline: false,
      countryCode: digits.slice(0, 2),
      formatted,
    };
  }

  return {
    raw,
    normalized: null,
    digitsOnly: digits,
    isValid: false,
    isMobile: false,
    isLandline: false,
    countryCode: '',
    formatted: digits,
    error: 'Número de telefone inválido. Insira um número com DDD (ex: 11 99999-9999).',
  };
}

export function normalizeBrazilPhone(raw: string) {
  const result = normalizePhone(raw);
  return {
    normalized: result.normalized,
    digitsOnly: result.digitsOnly,
    isMobile: result.isMobile,
    isLandline: result.isLandline,
    warning: result.warning || result.error,
  };
}
