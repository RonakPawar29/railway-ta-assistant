import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Storage } from '../utils/storage';
import { Theme, GlobalStyles } from '../styles/theme';
import { User, Shield, Warehouse, Landmark } from 'lucide-react-native';

export default function ProfileScreen() {
  const [profile, setProfile] = useState({
    fullName: '',
    designation: '',
    headquarter: '',
    pfNumber: '',
    basicPay: '',
    level: '6',
    baseTaRate: '800'
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await Storage.getProfile();
    if (data) setProfile(data);
  };

  const handleSave = async () => {
    if (!profile.fullName || !profile.pfNumber) {
      Alert.alert("Error", "Bhai, Name aur PF Number likhna zaroori hai!");
      return;
    }
    await Storage.saveProfile(profile);
    Alert.alert("Success", "Profile successfully save ho gayi!");
  };

  const updateRate = (level) => {
    let rate = '500';
    if (parseInt(level) >= 9) rate = '900';
    else if (parseInt(level) >= 6) rate = '800';
    setProfile({ ...profile, level, baseTaRate: rate });
  };

  return (
    <ScrollView style={GlobalStyles.container} contentContainerStyle={styles.scrollContent}>
      <View style={GlobalStyles.glassCard}>
        <View style={styles.header}>
          <User size={40} color={Theme.colors.primary} />
          <Text style={GlobalStyles.title}>Personal Profile</Text>
          <Text style={GlobalStyles.subtitle}>Setup once for all TA Journals</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name (Capital Letters)</Text>
          <TextInput 
            style={styles.input} 
            value={profile.fullName} 
            onChangeText={(t) => setProfile({...profile, fullName: t})} 
            placeholder="e.g. RAJESH KUMAR"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Designation</Text>
          <TextInput 
            style={styles.input} 
            value={profile.designation} 
            onChangeText={(t) => setProfile({...profile, designation: t})} 
            placeholder="e.g. SSE (P-WAY)"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>HQ Station</Text>
          <TextInput 
            style={styles.input} 
            value={profile.headquarter} 
            onChangeText={(t) => setProfile({...profile, headquarter: t})} 
            placeholder="e.g. BRC"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>P.F. / Staff Number</Text>
          <TextInput 
            style={styles.input} 
            value={profile.pfNumber} 
            keyboardType="numeric"
            onChangeText={(t) => setProfile({...profile, pfNumber: t})} 
            placeholder="8 Digit Number"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Pay Level</Text>
            <TextInput 
              style={styles.input} 
              value={profile.level} 
              keyboardType="numeric"
              onChangeText={updateRate} 
              placeholder="e.g. 6"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.label}>TA Rate (Per Day)</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: '#f1f5f9' }]} 
              value={profile.baseTaRate} 
              editable={false}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Profile Info</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Shield size={16} color={Theme.colors.textMuted} />
        <Text style={styles.infoText}>Data resides only on this phone for your privacy.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Theme.colors.textMuted,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.sm,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
  },
  saveBtn: {
    backgroundColor: Theme.colors.primary,
    padding: 15,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontStyle: 'italic',
  }
});
