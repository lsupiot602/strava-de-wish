// screens/SessionDetailScreen.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Polyline, UrlTile } from 'react-native-maps';

export default function SessionDetailScreen({ route }) {
  const { coords, start_time, end_time, distance } = route.params;

  // Si jamais pas de coords, on peut afficher un message
  if (!coords || coords.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Aucun tracé disponible pour cette session.</Text>
      </View>
    );
  }

  const first = coords[0];
  const last  = coords[coords.length - 1];

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: first.latitude,
          longitude: first.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <UrlTile
          urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
        />
        <Polyline
          coordinates={coords}
          strokeWidth={4}
        />
      </MapView>
      <View style={styles.info}>
        <Text>Début : {new Date(start_time).toLocaleString()}</Text>
        <Text>Fin   : {new Date(end_time).toLocaleString()}</Text>
        <Text>Distance : {distance.toFixed(0)} m</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.7,
  },
  info: {
    padding: 20,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
