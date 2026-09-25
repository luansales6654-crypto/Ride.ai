export interface ButtonTheme {
  id: string;
  name: string;
  primaryHex: string;
  gradStart: string;
  gradEnd: string;
  gradDark: string;
  glowRgba: string;
}

export const PRESET_BUTTON_THEMES: ButtonTheme[] = [
  {
    id: 'blue',
    name: 'Azul Elétrico (Padrão)',
    primaryHex: '#1769FF',
    gradStart: '#3D8BFF',
    gradEnd: '#1769FF',
    gradDark: '#0D347A',
    glowRgba: 'rgba(23, 105, 255, 0.35)',
  },
  {
    id: 'emerald',
    name: 'Verde Esmeralda',
    primaryHex: '#10B981',
    gradStart: '#34D399',
    gradEnd: '#059669',
    gradDark: '#064E3B',
    glowRgba: 'rgba(16, 185, 129, 0.35)',
  },
  {
    id: 'purple',
    name: 'Roxo Neon',
    primaryHex: '#8B5CF6',
    gradStart: '#A78BFA',
    gradEnd: '#7C3AED',
    gradDark: '#4C1D95',
    glowRgba: 'rgba(139, 92, 246, 0.35)',
  },
  {
    id: 'crimson',
    name: 'Vermelho Carmim',
    primaryHex: '#EF4444',
    gradStart: '#F87171',
    gradEnd: '#DC2626',
    gradDark: '#7F1D1D',
    glowRgba: 'rgba(239, 68, 68, 0.35)',
  },
  {
    id: 'amber',
    name: 'Âmbar Dourado',
    primaryHex: '#F59E0B',
    gradStart: '#FBBF24',
    gradEnd: '#D97706',
    gradDark: '#78350F',
    glowRgba: 'rgba(245, 158, 11, 0.35)',
  },
  {
    id: 'pink',
    name: 'Rosa Magenta',
    primaryHex: '#EC4899',
    gradStart: '#F472B6',
    gradEnd: '#DB2777',
    gradDark: '#831843',
    glowRgba: 'rgba(236, 72, 153, 0.35)',
  },
  {
    id: 'cyan',
    name: 'Ciano Elétrico',
    primaryHex: '#06B6D4',
    gradStart: '#22D3EE',
    gradEnd: '#0891B2',
    gradDark: '#164E63',
    glowRgba: 'rgba(6, 182, 212, 0.35)',
  },
];

export function applyButtonColor(colorHex: string) {
  if (!colorHex) return;

  const preset = PRESET_BUTTON_THEMES.find(
    (t) => t.primaryHex.toLowerCase() === colorHex.toLowerCase()
  );

  let gradStart = colorHex;
  let gradEnd = colorHex;
  let gradDark = colorHex;
  let glowRgba = 'rgba(23, 105, 255, 0.35)';

  if (preset) {
    gradStart = preset.gradStart;
    gradEnd = preset.gradEnd;
    gradDark = preset.gradDark;
    glowRgba = preset.glowRgba;
  } else {
    gradStart = colorHex;
    gradEnd = colorHex;
    gradDark = colorHex;
    glowRgba = `${colorHex}55`;
  }

  const root = document.documentElement;
  root.style.setProperty('--blue-500', colorHex);
  root.style.setProperty('--blue-400', gradStart);
  root.style.setProperty(
    '--grad-blue',
    `linear-gradient(135deg, ${gradStart} 0%, ${gradEnd} 50%, ${gradDark} 100%)`
  );
  root.style.setProperty(
    '--glow-blue',
    `0 0 0 1px ${gradStart}77, 0 8px 32px ${glowRgba}`
  );

  try {
    localStorage.setItem('ride_button_color', colorHex);
  } catch (e) {
    // ignore
  }
}

export function initButtonColor() {
  try {
    const saved = localStorage.getItem('ride_button_color');
    if (saved) {
      applyButtonColor(saved);
    }
  } catch (e) {
    // ignore
  }
}
