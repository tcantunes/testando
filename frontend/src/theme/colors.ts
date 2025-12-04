// 🎨 Paleta de cores moderna para o Voluntaí
// Inspirada em natureza, esperança e ação social

export const colors = {
  // Cores principais
  primary: {
    main: '#10B981',      // Verde esmeralda vibrante
    light: '#34D399',     // Verde claro
    dark: '#059669',      // Verde escuro
    gradient: ['#10B981', '#059669'], // Gradiente principal
  },
  
  // Cores secundárias
  secondary: {
    main: '#6366F1',      // Índigo moderno
    light: '#818CF8',     // Índigo claro
    dark: '#4F46E5',      // Índigo escuro
  },
  
  // Cores de destaque
  accent: {
    orange: '#F59E0B',    // Laranja energia
    pink: '#EC4899',      // Rosa vibrante
    cyan: '#06B6D4',      // Ciano fresco
  },
  
  // Cores de feedback
  feedback: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Neutros
  neutral: {
    white: '#FFFFFF',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    disabled: '#CBD5E1',
  },
  
  // Gradientes para fundos
  gradients: {
    primary: ['#10B981', '#059669'],
    secondary: ['#6366F1', '#4F46E5'],
    sunset: ['#F59E0B', '#EC4899'],
    ocean: ['#06B6D4', '#3B82F6'],
    nature: ['#10B981', '#06B6D4'],
    card: ['#FFFFFF', '#F8FAFC'],
  },
  
  // Sombras
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    colored: (color: string) => ({
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    }),
  },
};

// Espaçamentos consistentes
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Bordas arredondadas
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Tipografia
export const typography = {
  hero: {
    fontSize: 32,
    fontWeight: '800' as const,
    lineHeight: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export default colors;

