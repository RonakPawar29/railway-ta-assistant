import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Storage } from '../utils/storage';
import { calculateDayBlocksTA } from '../utils/taCalculator';
import { Theme, GlobalStyles } from '../styles/theme';
import { Plus, Trash2, Save, Calendar, Clock, MapPin } from 'lucide-react-native';

export default function NewEntryScreen() {
  const router = useRouter();
  const [journalPeriod, setJournalPeriod] = useState({
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear().toString()
  });

  const [dayBlocks, setDayBlocks] = useState([
    {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      objectOfJourney: '',
      legs: [{ id: Date.now() + 1, depTime: '', arrTime: '', fromStation: '', toStation: '', trainNo: '' }]
    }
  ]);

  const addBlock = () => {
    const lastDate = new Date(dayBlocks[dayBlocks.length - 1].date);
    lastDate.setDate(lastDate.getDate() + 1);
    setDayBlocks([...dayBlocks, {
      id: Date.now(),
      date: lastDate.toISOString().split('T')[0],
      objectOfJourney: '',
      legs: [{ id: Date.now() + 1, depTime: '', arrTime: '', fromStation: '', toStation: '', trainNo: '' }]
    }]);
  };

  const addLeg = (blockId) => {
    setDayBlocks(dayBlocks.map(b => b.id === blockId ? {
      ...b,
      legs: [...b.legs, { id: Date.now(), depTime: '', arrTime: '', fromStation: '', toStation: '', trainNo: '' }]
    } : b));
  };

  const updateLeg = (blockId, legId, field, value) => {
    setDayBlocks(dayBlocks.map(b => b.id === blockId ? {
      ...b,
      legs: b.legs.map(l => l.id === legId ? { ...l, [field]: value } : l)
    } : b));
  };

  const handleSave = async () => {
    const prof = await Storage.getProfile();
    const { totalUnits, dayLog } = calculateDayBlocksTA(dayBlocks, prof?.headquarter);
    
    const entry = {
      id: Date.now(),
      journalPeriod,
      dayBlocks,
      totalUnits,
      calculationLog: dayLog,
      createdAt: new Date().toISOString()
    };

    await Storage.saveEntry(entry);
    Alert.alert("Success", "Journal saved to history!", [
      { text: "OK", onPress: () => router.push('/history') }
    ]);
  };

  return (
    <ScrollView style={GlobalStyles.container}>
      <View style={styles.padding}>
        <View style={GlobalStyles.glassCard}>
          <Text style={styles.sectionTitle}>Journal Period</Text>
          <View style={styles.row}>
            <TextInput style={styles.flexInput} value={journalPeriod.month} onChangeText={t => setJournalPeriod({...journalPeriod, month: t})} placeholder="Month" />
            <TextInput style={styles.flexInput} value={journalPeriod.year} onChangeText={t => setJournalPeriod({...journalPeriod, year: t})} placeholder="Year" />
          </View>
        </View>

        {dayBlocks.map((block, bIdx) => (
          <View key={block.id} style={[GlobalStyles.glassCard, styles.block]}>
            <View style={styles.blockHeader}>
              <View style={styles.iconInput}>
                <Calendar size={16} color={Theme.colors.primary} />
                <TextInput 
                  style={styles.dateInput} 
                  value={block.date} 
                  onChangeText={t => setDayBlocks(dayBlocks.map(b => b.id === block.id ? {...b, date: t} : b))} 
                />
              </View>
              <TouchableOpacity onPress={() => setDayBlocks(dayBlocks.filter(b => b.id !== block.id))}>
                <Trash2 size={20} color={Theme.colors.accent} />
              </TouchableOpacity>
            </View>

            <TextInput 
              style={styles.objInput} 
              placeholder="Object of Journey (e.g. Inspecting KM 45)" 
              value={block.objectOfJourney}
              onChangeText={t => setDayBlocks(dayBlocks.map(b => b.id === block.id ? {...b, objectOfJourney: t} : b))}
            />

            {block.legs.map((leg, lIdx) => (
              <View key={leg.id} style={styles.legCard}>
                <View style={styles.legRow}>
                  <View style={styles.minorIconInput}>
                    <MapPin size={12} color={Theme.colors.textMuted} />
                    <TextInput style={styles.legInput} placeholder="From" value={leg.fromStation} onChangeText={t => updateLeg(block.id, leg.id, 'fromStation', t)} />
                  </View>
                  <Text style={styles.arrow}>→</Text>
                  <View style={styles.minorIconInput}>
                    <MapPin size={12} color={Theme.colors.textMuted} />
                    <TextInput style={styles.legInput} placeholder="To" value={leg.toStation} onChangeText={t => updateLeg(block.id, leg.id, 'toStation', t)} />
                  </View>
                </View>
                <View style={styles.legRow}>
                  <View style={styles.minorIconInput}>
                    <Clock size={12} color={Theme.colors.textMuted} />
                    <TextInput style={styles.legInput} placeholder="Dep (HH:mm)" value={leg.depTime} onChangeText={t => updateLeg(block.id, leg.id, 'depTime', t)} />
                  </View>
                  <View style={styles.minorIconInput}>
                    <Clock size={12} color={Theme.colors.textMuted} />
                    <TextInput style={styles.legInput} placeholder="Arr (HH:mm)" value={leg.arrTime} onChangeText={t => updateLeg(block.id, leg.id, 'arrTime', t)} />
                  </View>
                </View>
              </View>
            ))}
            
            <TouchableOpacity style={styles.addLegBtn} onPress={() => addLeg(block.id)}>
              <Plus size={14} color={Theme.colors.primary} />
              <Text style={styles.addLegText}>Add Return / Multi-stop Leg</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={addBlock}>
          <Plus size={20} color={Theme.colors.primary} />
          <Text style={styles.addBtnText}>Add Next Date</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Save size={20} color="#fff" />
          <Text style={styles.saveBtnText}>Generate Journal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  padding: { padding: Theme.spacing.md },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: Theme.colors.textMuted, marginBottom: 10, textTransform: 'uppercase' },
  row: { flexDirection: 'row', gap: 10 },
  flexInput: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  block: { marginTop: 15 },
  blockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  iconInput: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f8fafc', padding: 8, borderRadius: 8, flex: 0.8 },
  dateInput: { fontWeight: 'bold', color: Theme.colors.primary, fontSize: 16 },
  objInput: { borderBottomWidth: 1, borderBottomColor: Theme.colors.border, padding: 8, marginBottom: 15, fontSize: 13 },
  legCard: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9' },
  legRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 8 },
  minorIconInput: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fcfcfc', padding: 6, borderRadius: 6, borderWidth: 0.5, borderColor: '#eee' },
  legInput: { fontSize: 12, flex: 1 },
  arrow: { color: Theme.colors.textMuted },
  addLegBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 5 },
  addLegText: { fontSize: 12, color: Theme.colors.primary, fontWeight: 'bold' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: Theme.colors.primary, borderRadius: 12, marginTop: 20 },
  addBtnText: { color: Theme.colors.primary, fontWeight: 'bold' },
  saveBtn: { backgroundColor: Theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 18, borderRadius: 15, marginTop: 25 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});
