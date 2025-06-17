import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // <-- Correction ici
import { supabase } from '../lib/supabase';

export default function CreatePostScreen({ navigation }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return;

    const { data, error } = await supabase
      .from('sessions')
      .select('id, start_time, end_time')
      .eq('user_id', user.id)
      .order('start_time', { ascending: false });

    if (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les sessions.');
    } else {
      setSessions(data);
      if (data.length > 0) setSelectedSession(data[0].id);
    }
  }

  const handlePublish = async () => {
    if (!content.trim()) {
      Alert.alert('Erreur', 'Le contenu ne peut pas être vide.');
      return;
    }
    if (!selectedSession) {
      Alert.alert('Erreur', 'Veuillez sélectionner un parcours.');
      return;
    }

    setLoading(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setLoading(false);
      Alert.alert('Erreur', 'Utilisateur non connecté.');
      return;
    }

    const { error } = await supabase
      .from('posts')
      .insert([
        {
          user_id: user.id,
          content,
          session_id: selectedSession,
          created_at: new Date().toISOString(),
        },
      ]);

    setLoading(false);

    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      Alert.alert('Succès', 'Parcours publié avec le parcours sélectionné !');
      setContent('');
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Décris ton parcours ici..."
        multiline
        value={content}
        onChangeText={setContent}
        editable={!loading}
      />

      <Text style={{ marginBottom: 8 }}>Sélectionne un parcours :</Text>
      <Picker
        selectedValue={selectedSession}
        onValueChange={(itemValue) => setSelectedSession(itemValue)}
        style={styles.picker}
      >
        {sessions.map(session => (
          <Picker.Item
            key={session.id}
            label={`Parcours du ${new Date(session.start_time).toLocaleDateString()}`}
            value={session.id}
          />
        ))}
      </Picker>

      <Button
        title={loading ? 'Publication en cours...' : 'Publier'}
        onPress={handlePublish}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    height: 120,
    textAlignVertical: 'top',
  },
  picker: {
    marginBottom: 20,
  },
});
