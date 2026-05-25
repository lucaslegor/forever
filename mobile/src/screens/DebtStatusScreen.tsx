import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'DebtStatus'>;

export function DebtStatusScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estado de deuda</Text>
      <Text style={styles.description}>
        Esta pantalla se implementará en la próxima iteración del MVP móvil.
      </Text>
      <Pressable
        style={styles.button}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Volver al inicio"
      >
        <Text style={styles.buttonText}>Volver</Text>
      </Pressable>
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#003366',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
