import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { DebtStatusScreen } from '../screens/DebtStatusScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import type { AppStackParamList, AuthStackParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigatorStack() {
  return (
    <AppStack.Navigator>
      <AppStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Inicio' }}
      />
      <AppStack.Screen
        name="DebtStatus"
        component={DebtStatusScreen}
        options={{ title: 'Estado de deuda' }}
      />
    </AppStack.Navigator>
  );
}

export function AppNavigator() {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigatorStack /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FA',
  },
});
