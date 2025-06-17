// screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Button } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', "L’accès à la localisation est requis.");
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Chargement de la position...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Vous êtes ici"
          />
        </MapView>
      ) : (
        <View style={styles.center}>
          <Text>Impossible de récupérer la position.</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Nouvelle session"
          onPress={() => navigation.navigate('Track')}
        />
        <View style={{ height: 10 }} /> {/* espacement */}
        <Button
          title="Historique"
          onPress={() => navigation.navigate('Dashboard')}
        />
        <View style={{ height: 10 }} />
        <Button
          title="Voir les parcours"
          onPress={() => navigation.navigate('Posts')}
        />
        <View style={{ height: 10 }} />
        <Button
          title="Publier un parcours"
          onPress={() => navigation.navigate('CreatePost')}
        />
        <View style={{ height: 10 }} />
        <Button
          title="Mon profil"
          onPress={() => navigation.navigate('Profile')} // vérifie que 'Profile' est bien dans ta navigation !
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { flex: 1 },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    width: '60%',
  },
});
