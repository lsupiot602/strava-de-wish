import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Image } from 'react-native';
import { supabase } from '../lib/supabase';

export default function DashboardScreen() {
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalDistance: 0,
    totalDuration: 0,
    avgSpeed: 0,
    sessionCount: 0,
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('start_time', { ascending: false });

    if (error) {
      setError(error.message);
      setSessions([]);
    } else {
      setSessions(data);
      calculateStats(data);
    }
  }

  function calculateStats(data) {
    if (!data || data.length === 0) {
      setStats({
        totalDistance: 0,
        totalDuration: 0,
        avgSpeed: 0,
        sessionCount: 0,
      });
      return;
    }

    let totalDistance = 0;
    let totalDuration = 0;

    data.forEach(session => {
      totalDistance += session.distance || 0;
      if (session.start_time && session.end_time) {
        const start = new Date(session.start_time);
        const end = new Date(session.end_time);
        const diffSec = (end - start) / 1000;
        if (diffSec > 0) totalDuration += diffSec;
      }
    });

    const avgSpeed = totalDuration > 0 ? totalDistance / totalDuration : 0;

    setStats({
      totalDistance,
      totalDuration,
      avgSpeed,
      sessionCount: data.length,
    });
  }

  async function handleDelete(id) {
    if (!id) {
      Alert.alert('Erreur', 'ID de session invalide');
      return;
    }

    Alert.alert(
      "Confirmer la suppression",
      "Voulez-vous vraiment supprimer cette session ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from('sessions')
              .delete()
              .eq('id', id);

            if (error) {
              Alert.alert('Erreur', "Impossible de supprimer la session.");
              console.error('Delete error:', error);
            } else {
              fetchSessions();
            }
          },
        },
      ]
    );
  }

  if (sessions === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Chargement de l’historique…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Erreur : {error}</Text>
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.noSessionsText}>Aucune session enregistrée.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>Nombre de sessions : {stats.sessionCount}</Text>
        <Text style={styles.statText}>
          Distance totale : {(stats.totalDistance / 1000).toFixed(2)} km
        </Text>
        <Text style={styles.statText}>
          Durée totale : {(stats.totalDuration / 60).toFixed(1)} minutes
        </Text>
        <Text style={styles.statText}>
          Vitesse moyenne : {(stats.avgSpeed * 3.6).toFixed(2)} km/h
        </Text>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {item.photo_url ? (
              <Image
                source={{ uri: item.photo_url }}
                style={styles.sessionPhoto}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.noPhotoPlaceholder}>
                <Text style={{ color: '#888' }}>Pas de photo</Text>
              </View>
            )}
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.title}>
                Session du{' '}
                {item.start_time
                  ? new Date(item.start_time).toLocaleString()
                  : 'Date inconnue'}
              </Text>
              <Text>
                Distance: {item.distance != null ? item.distance.toFixed(0) : 'N/A'} m
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.deleteButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  statsContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#dff0d8',
    borderRadius: 8,
  },
  statText: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  item: {
    flexDirection: 'row',
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  title: { fontWeight: 'bold', marginBottom: 5 },
  noSessionsText: { fontSize: 16, color: '#666' },
  errorText: { color: 'red', fontWeight: 'bold', marginBottom: 10 },
  deleteButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sessionPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  noPhotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
