import React from 'react';
import { SafeAreaView } from 'react-native';
import LocationTracker from '../components/LocationTracker';

export default function Home() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LocationTracker />
    </SafeAreaView>
  );
}
