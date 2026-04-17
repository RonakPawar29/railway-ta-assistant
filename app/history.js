import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Storage } from '../utils/storage';
import { Theme, GlobalStyles } from '../styles/theme';
import { FileText, Trash2, ChevronRight, Calendar } from 'lucide-react-native';

export default function HistoryScreen() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [profile, setProfile] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [])
  );

  const loadRecords = async () => {
    const data = await Storage.getEntries();
    const prof = await Storage.getProfile();
    setRecords(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    setProfile(prof);
  };

  const confirmDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Bhai, kya aap sach me ye journal delete karna chahte hain?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => handleDelete(id) }
      ]
    );
  };

  const handleDelete = async (id) => {
    const updated = await Storage.deleteEntry(id);
    setRecords(updated);
  };

  const renderItem = ({ item }) => {
    const amount = Math.round(item.totalUnits * (parseFloat(profile?.baseTaRate) || 800));
    return (
      <TouchableOpacity 
        style={[GlobalStyles.glassCard, styles.recordItem]}
        onPress={() => router.push({ pathname: '/preview', params: { id: item.id } })}
      >
        <View style={styles.iconContainer}>
          <FileText size={24} color={Theme.colors.primary} />
        </View>
        <View style={styles.recordContent}>
          <Text style={styles.periodText}>{item.journalPeriod.month} {item.journalPeriod.year}</Text>
          <View style={styles.statsRow}>
            <View style={styles.miniStat}>
              <Calendar size={12} color={Theme.colors.textMuted} />
              <Text style={styles.miniStatText}>{item.dayBlocks.length} Dates</Text>
            </View>
            <Text style={styles.amountText}>₹{amount.toLocaleString()}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item.id)}>
          <Trash2 size={20} color={Theme.colors.accent} />
        </TouchableOpacity>
        <ChevronRight size={20} color={Theme.colors.border} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={GlobalStyles.container}>
      <View style={styles.padding}>
        <Text style={GlobalStyles.title}>Journal History</Text>
        <Text style={GlobalStyles.subtitle}>Manage all your past TA claims</Text>
      </View>
      
      <FlatList
        data={records}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FileText size={64} color={Theme.colors.border} />
            <Text style={styles.emptyText}>Abhi tak koi journal save nahi kiya gaya.</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/new')}>
              <Text style={styles.createBtnText}>Create Your First Journal</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  padding: { padding: Theme.spacing.md, paddingTop: Theme.spacing.lg },
  listContent: { padding: Theme.spacing.md },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 15,
  },
  iconContainer: {
    padding: 10,
    backgroundColor: 'rgba(0, 51, 153, 0.05)',
    borderRadius: 12,
  },
  recordContent: { flex: 1 },
  periodText: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.primary },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 4 },
  miniStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  miniStatText: { fontSize: 12, color: Theme.colors.textMuted },
  amountText: { fontSize: 14, fontWeight: 'bold', color: Theme.colors.success },
  deleteBtn: { padding: 10 },
  emptyState: { alignItems: 'center', marginTop: 100, padding: 40 },
  emptyText: { textAlign: 'center', color: Theme.colors.textMuted, marginTop: 20, fontSize: 16 },
  createBtn: { backgroundColor: Theme.colors.primary, padding: 15, borderRadius: 12, marginTop: 30 },
  createBtnText: { color: '#fff', fontWeight: 'bold' }
});
