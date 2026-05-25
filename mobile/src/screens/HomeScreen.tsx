import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { cardShadow } from '../utils/cardShadow';
import type { AppStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();

  const greetingName = user?.nombre?.trim() || user?.loginId;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>Hola{greetingName ? `, ${greetingName}` : ''}</Text>
        <Text style={styles.welcome}>Bienvenido al club</Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate('DebtStatus')}
          accessibilityRole="button"
          accessibilityLabel="Estado de deuda"
        >
          <Text style={styles.primaryButtonText}>Estado de deuda</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => void logout()}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
        >
          <Text style={styles.secondaryButtonText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 24,
    justifyContent: 'center',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    ...cardShadow,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  welcome: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#003366',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#003366',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#003366',
    fontSize: 16,
    fontWeight: '600',
  },
});
