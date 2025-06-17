import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import * as Location from 'expo-location';

export default function LocationTracker() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission refusée pour accéder à la localisation');
      Alert.alert('Erreur', 'Permission refusée pour accéder à la localisation');
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <View style={{ flex:1, justifyContent: 'center', alignItems: 'center' }}>
      {errorMsg ? <Text>{errorMsg}</Text> : null}
      {location ? (
        <Text>
          Latitude: {location.coords.latitude.toFixed(6)}{'\n'}
          Longitude: {location.coords.longitude.toFixed(6)}
        </Text>
      ) : (
        <Text>Chargement de la localisation...</Text>
      )}
      <Button title="Rafraîchir position" onPress={getLocation} />
    </View>
  );
}
