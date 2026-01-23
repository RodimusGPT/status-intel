import { useEffect, useState } from 'react';
import { useColorScheme as useColorSchemeRN, ColorSchemeName } from 'react-native';

export function useColorScheme(): ColorSchemeName {
  const colorScheme = useColorSchemeRN();
  const [currentScheme, setCurrentScheme] = useState<ColorSchemeName>(colorScheme);

  useEffect(() => {
    setCurrentScheme(colorScheme);
  }, [colorScheme]);

  return currentScheme;
}
