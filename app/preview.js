import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Storage } from '../utils/storage';
import { generateS4HTML } from '../utils/pdfGenerator';
import { Theme, GlobalStyles } from '../styles/theme';
import { Printer, Share2, ArrowLeft, FileCheck } from 'lucide-react-native';

export default function PreviewScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    const prof = await Storage.getProfile();
    const entries = await Storage.getEntries();
    const found = entries.find(e => e.id.toString() === id);
    setRecord(found);
    setProfile(prof);
    setLoading(false);
  };

  const handlePrint = async () => {
    const html = generateS4HTML(record, profile);
    await Print.printAsync({ html });
  };

  const handleShare = async () => {
    const html = generateS4HTML(record, profile);
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Theme.colors.primary} /></View>;
  if (!record) return <View style={styles.center}><Text>Bhai, record nahi mila!</Text></View>;

  return (
    <View style={GlobalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Journal Preview</Text>
      </View>

      <View style={styles.content}>
        <View style={GlobalStyles.glassCard}>
          <View style={styles.iconCircle}>
            <FileCheck size={48} color={Theme.colors.success} />
          </View>
          <Text style={styles.readyText}>Journal is Ready!</Text>
          <Text style={styles.detailText}>
            {record.journalPeriod.month} {record.journalPeriod.year} - {record.totalUnits.toFixed(1)} Units
          </Text>

          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionBtn} onPress={handlePrint}>
              <Printer size={32} color={Theme.colors.primary} />
              <Text style={styles.actionLabel}>Print S4</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.shareBtn]} onPress={handleShare}>
              <Share2 size={32} color="#fff" />
              <Text style={[styles.actionLabel, { color: '#fff' }]}>Share PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.hint}>
          Note: This will generate an official Western Railway S4 TA Journal format.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, paddingTop: 50 },
  backBtn: { padding: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10, color: Theme.colors.primary },
  content: { flex: 1, padding: Theme.spacing.lg, alignItems: 'center' },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(5, 150, 105, 0.1)', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 20 },
  readyText: { fontSize: 24, fontWeight: '800', textAlign: 'center', color: Theme.colors.text },
  detailText: { textAlign: 'center', color: Theme.colors.textMuted, marginTop: 10, fontSize: 16 },
  actionGrid: { flexDirection: 'row', gap: 20, marginTop: 40, width: '100%' },
  actionBtn: { flex: 1, backgroundColor: '#f1f5f9', padding: 25, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  shareBtn: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  actionLabel: { marginTop: 10, fontWeight: 'bold', fontSize: 14, color: Theme.colors.primary },
  hint: { marginTop: 40, textAlign: 'center', fontSize: 12, color: Theme.colors.textMuted, fontStyle: 'italic', paddingHorizontal: 20 }
});
