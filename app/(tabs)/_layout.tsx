import React from 'react';
import { TouchableOpacity, Text, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

function HeaderTitle({ title }: { title: string }) {
  const router = useRouter();

  const handlePress = () => {
    // Navigate to home - use push then back to force refresh
    if (Platform.OS === 'web') {
      window.location.href = '/';
    } else {
      router.replace('/');
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined}
    >
      <Text style={{ color: '#fff', fontSize: 17, fontWeight: 'bold' }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
          borderTopColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
          headerTitle: () => <HeaderTitle title="Status Intel" />,
          headerStyle: {
            backgroundColor: '#0ea5e9',
          },
          headerTintColor: '#fff',
        }}
      />
      <Tabs.Screen
        name="audit"
        options={{
          title: 'Contribute',
          tabBarIcon: ({ color }) => <TabBarIcon name="plus-circle" color={color} />,
          headerTitle: 'Share Your Stay',
          headerStyle: {
            backgroundColor: '#0ea5e9',
          },
          headerTintColor: '#fff',
        }}
      />
    </Tabs>
  );
}
