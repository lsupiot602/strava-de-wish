import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Button,
  Alert,
} from 'react-native';
import MapView, { Polyline, Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';

export default function TrackingScreen({ navigation }) {
  const [tracking, setTracking] = useState(false);
  const [coords, setCoords] = useState([]);
  const watcher = useRef(null);

  const start = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Impossible d’accéder au GPS.');
      return;
    }
    setCoords([]);
    setTracking(true);

    watcher.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 5, timeInterval: 1000 },
      loc => {
        const point = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          timestamp: loc.timestamp,
        };
        setCoords(old => [...old, point]);
      }
    );
  };

  const stop = async () => {
    setTracking(false);
    watcher.current?.remove();

    if (coords.length < 2) {
      Alert.alert('Erreur', 'Pas assez de points GPS pour enregistrer.');
      return;
    }

    const startTime = coords[0]?.timestamp;
    const endTime = coords[coords.length - 1]?.timestamp;

    let dist = 0;
    for (let i = 1; i < coords.length; i++) {
      const a = coords[i - 1], b = coords[i];
      const dx = (a.latitude - b.latitude) * 111000;
      const dy = (a.longitude - b.longitude) * 111000;
      dist += Math.sqrt(dx * dx + dy * dy);
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        coords,
        distance: dist,
      });
    if (error) Alert.alert('Erreur sauvegarde', error.message);
    else {
      Alert.alert('Session enregistrée', `Distance : ${dist.toFixed(0)} m`);
      navigation.navigate('Home');
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: coords[0]?.latitude || 48.8566,
          longitude: coords[0]?.longitude || 2.3522,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <UrlTile
          urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
        />
        {coords.length > 0 && (
          <>
            <Polyline coordinates={coords} strokeWidth={5} />
            <Marker coordinate={coords[0]} title="Départ" />
            <Marker coordinate={coords[coords.length - 1]} title="Arrêt" />
          </>
        )}
      </MapView>

      <View style={styles.controlsContainer}>
        <View style={styles.buttons}>
          {!tracking
            ? <Button title="Démarrer" onPress={start} />
            : <Button title="Arrêter" onPress={stop} color="red" />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
    zIndex: 9999,
  },

  buttons: {
    width: '60%',
    marginBottom: 20,
  },
});
