/**
 * theme.js
 * Professional Railway TA - Design Tokens
 */

export const Theme = {
  colors: {
    primary: '#003399',      // Official Railway Blue
    primaryLight: '#2b5cb8',
    secondary: '#FFD700',    // Railway Gold
    accent: '#ff4d4d',       // Indian Railways Red (Stop/Danger)
    success: '#059669',
    background: '#f8fafc',
    card: '#ffffff',
    text: '#1e293b',
    textMuted: '#64748b',
    border: '#e2e8f0',
    glass: 'rgba(255, 255, 255, 0.8)'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 30
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  }
};

export const GlobalStyles = {
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  glassCard: {
    backgroundColor: Theme.colors.glass,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Theme.shadow
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Theme.colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.textMuted,
  }
};
