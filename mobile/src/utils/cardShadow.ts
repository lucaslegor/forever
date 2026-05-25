import { Platform, type ViewStyle } from 'react-native';

export const cardShadow: ViewStyle = Platform.select({
  web: {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
}) as ViewStyle;
