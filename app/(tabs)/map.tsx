import React from 'react';
import { View, Text } from 'react-native';
import useAuth from '@/hooks/useAuth';
import SimpleMapScreen from '@/components/SimpleMap';

export default function MapScreen() {
  const { user } = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Mapa funcional con controles */}
      <SimpleMapScreen />
    </View>
  );
}