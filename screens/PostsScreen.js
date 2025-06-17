import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

export default function PostsScreen() {
  const [posts, setPosts] = useState(null);
  const [sessionsMap, setSessionsMap] = useState({});
  const [usersMap, setUsersMap] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // Récupérer les posts
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsError) {
      setError(postsError.message);
      setPosts([]);
      return;
    }

    setPosts(postsData);

    // Récupérer les sessions liées
    const sessionIds = [...new Set(postsData.map(p => p.session_id).filter(id => id))];
    if (sessionIds.length > 0) {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('id, distance, start_time, end_time')
        .in('id', sessionIds);

      if (sessionsError) {
        setError(sessionsError.message);
        return;
      }

      const map = {};
      sessionsData.forEach(s => {
        map[s.id] = s;
      });
      setSessionsMap(map);
    }

    // Récupérer les utilisateurs correspondants
    const userIds = [...new Set(postsData.map(p => p.user_id).filter(id => id))];
    if (userIds.length > 0) {
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, email')
        .in('id', userIds);

      if (usersError) {
        setError(usersError.message);
        return;
      }

      const userMap = {};
      usersData.forEach(u => {
        userMap[u.id] = u.email;
      });
      setUsersMap(userMap);
    }
  }

  // Fonction pour formater durée en hh:mm:ss
  const formatDuration = (start, end) => {
    if (!start || !end) return 'Durée inconnue';
    const durationSec = (new Date(end) - new Date(start)) / 1000;
    if (durationSec <= 0) return 'Durée invalide';

    const h = Math.floor(durationSec / 3600);
    const m = Math.floor((durationSec % 3600) / 60);
    const s = Math.floor(durationSec % 60);
    return `${h}h ${m}m ${s}s`;
  };

  // Calcul de la vitesse moyenne en km/h
  const calcAvgSpeed = (distance, start, end) => {
    if (!distance || !start || !end) return 'N/A';
    const durationSec = (new Date(end) - new Date(start)) / 1000;
    if (durationSec <= 0) return 'N/A';
    const hours = durationSec / 3600;
    return (distance / hours).toFixed(2);
  };

  if (posts === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Chargement des parcours...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>Erreur : {error}</Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Aucun parcours pour l’instant.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={{ padding: 20 }}
      renderItem={({ item }) => {
        const session = sessionsMap[item.session_id];
        const duration = session ? formatDuration(session.start_time, session.end_time) : 'Durée inconnue';
        const distance = session ? `${session.distance.toFixed(2)} km` : 'Distance inconnue';
        const avgSpeed = session ? `${calcAvgSpeed(session.distance, session.start_time, session.end_time)} km/h` : 'N/A';

        return (
          <View style={styles.postItem}>
            <Text style={styles.postContent}>{item.content}</Text>
            <Text style={styles.postInfo}>Durée : {duration}</Text>
            <Text style={styles.postInfo}>Distance : {distance}</Text>
            <Text style={styles.postInfo}>Vitesse moyenne : {avgSpeed}</Text>
            <Text style={styles.postUser}>Posté par: {usersMap[item.user_id] || 'Anonyme'}</Text>
            <Text style={styles.postDate}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  postItem: {
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  postContent: { fontSize: 16, marginBottom: 8 },
  postInfo: { fontSize: 14, marginBottom: 4 },
  postUser: { fontWeight: 'bold', marginBottom: 4 },
  postDate: { fontSize: 12, color: '#666' },
});
