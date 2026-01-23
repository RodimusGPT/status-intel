import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider } from '@/hooks/useAuth';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsReady, setFontsReady] = useState(false);
  
  // On web, fonts are loaded differently - use system fonts as fallback
  const fontConfig = Platform.select({
    web: {
      ...FontAwesome.font,
    },
    default: {
      SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
      ...FontAwesome.font,
    },
  });

  const [loaded, error] = useFonts(fontConfig);

  useEffect(() => {
    if (error) {
      // On web, font loading errors are non-fatal - use system fonts
      if (Platform.OS === 'web') {
        console.warn('Font loading error (non-fatal on web):', error);
        setFontsReady(true);
      } else {
        throw error;
      }
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      setFontsReady(true);
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!fontsReady && !loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="property/[id]"
          options={{
            headerTitle: 'Property Details',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="auth/login"
          options={{
            headerTitle: 'Sign In',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="auth/register"
          options={{
            headerTitle: 'Sign Up',
            presentation: 'modal',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
