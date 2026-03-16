// Centralized color constants - replaces all hardcoded hex values
export const colors = {
  // Primary brand colors
  primary: '#0f766e',
  primaryLight: '#117a6d',
  primaryDark: '#0d5f59',
  secondary: '#ec4899',
  accent: '#7c3aed',
  
  // Status colors
  success: '#16a34a',
  warning: '#ea580c',
  danger: '#dc2626',
  
  // Grayscale
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',
  
  // Status backgrounds and text
  successStatus: '#16a34a',
  warningStatus: '#ea580c',
  dangerStatus: '#dc2626',
  
  // Yellow (for disclaimer sections)
  yellow50: '#fef3c7',
  yellow100: '#fef3c7',
  yellow400: '#fcc34d',
  yellow800: '#92400e',
  yellow900: '#78350f',
  
  // Classification backgrounds and text colors
  benignBg: '#dcfce7',
  benignText: '#15803d',
  malignantBg: '#fee2e2',
  malignantText: '#991b1b',
  
  // Risk level badge colors
  riskHighBg: '#fee2e2',
  riskHighText: '#991b1b',
  riskMediumBg: '#fef3c7',
  riskMediumText: '#92400e',
  riskLowBg: '#dcfce7',
  riskLowText: '#15803d',
  
  // Classification confidence text colors
  benignConfidenceText: '#166534',
  malignantConfidenceText: '#7f1d1d',
};

// Helper function to get status color
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'high':
      return colors.danger;
    case 'medium':
      return colors.warning;
    case 'low':
      return colors.success;
    default:
      return colors.gray500;
  }
};

// Helper function to get risk level color and background
export const getRiskLevelStyles = (level) => {
  switch (level?.toLowerCase()) {
    case 'high':
      return { color: colors.danger, background: '#fef2f2' };
    case 'medium':
      return { color: colors.warning, background: '#fef3c7' };
    case 'low':
      return { color: colors.success, background: '#dcfce7' };
    default:
      return { color: colors.gray500, background: colors.gray50 };
  }
};

// Export CSS variable references for style objects
export const cssVariables = {
  primary: 'var(--primary)',
  secondary: 'var(--secondary)',
  accent: 'var(--accent)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  gray50: 'var(--gray-50)',
  gray100: 'var(--gray-100)',
  gray200: 'var(--gray-200)',
  gray300: 'var(--gray-300)',
  gray400: 'var(--gray-400)',
  gray500: 'var(--gray-500)',
  gray600: 'var(--gray-600)',
  gray700: 'var(--gray-700)',
  gray800: 'var(--gray-800)',
  gray900: 'var(--gray-900)',
};
