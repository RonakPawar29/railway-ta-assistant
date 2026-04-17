import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Storage } from '../utils/storage';
import { Theme, GlobalStyles } from '../styles/theme';
import { PlusCircle, TrendingUp, Calendar, History } from 'lucide-react-native';

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function DashboardScreen() {
  const [profile, setProfile] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const prof = await Storage.getProfile();
    const entries = await Storage.getEntries();
    setProfile(prof);

    const now = new Date();
    const currentYear = now.getFullYear();
    const stats = MONTHS.map((m, i) => ({
      name: m,
      amount: 0,
      units: 0,
    }));

    entries.forEach(entry => {
      const eDate = new Date(entry.createdAt);
      if (eDate.getFullYear() === currentYear) {
        const mIdx = eDate.getMonth();
        const units = entry.totalUnits || 0;
        const rate = parseFloat(prof?.baseTaRate || 800);
        stats[mIdx].amount += Math.round(units * rate);
        stats[mIdx].units += units;
      }
    });

    setChartData(stats);
    const currMonth = now.getMonth();
    setSelectedMonth(stats[currMonth]);
  };

  const maxAmount = Math.max(...chartData.map(d => d.amount), 5000);

  return (
    <ScrollView style={GlobalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Namaste,</Text>
          <Text style={GlobalStyles.title}>{profile?.fullName || "Journal User"}</Text>
        </View>
      </View>

      {/* Analytics Chart */}
      <View style={[GlobalStyles.glassCard, styles.chartCard]}>
        <View style={styles.cardHeader}>
          <TrendingUp size={20} color={Theme.colors.primary} />
          <Text style={styles.cardTitle}>Earnings Chart ({new Date().getFullYear()})</Text>
        </View>
        
        <View style={styles.chartArea}>
          {chartData.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.barContainer}
              onPress={() => setSelectedMonth(item)}
            >
              <View style={[
                styles.bar, 
                { height: `${(item.amount / maxAmount) * 100}%` },
                selectedMonth?.name === item.name && styles.activeBar
              ]} />
              <Text style={styles.barLabel}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Selected Month Summary */}
      <View style={[GlobalStyles.glassCard, styles.summaryCard]}>
        <View style={styles.cardHeader}>
          <Calendar size={20} color={Theme.colors.primary} />
          <Text style={styles.cardTitle}>{selectedMonth?.name} Summary</Text>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Units</Text>
            <Text style={styles.statValue}>{selectedMonth?.units.toFixed(1) || "0.0"}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Claim Amount</Text>
            <Text style={[styles.statValue, { color: Theme.colors.success }]}>
              ₹{(selectedMonth?.amount || 0).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footerInfo}>
        <History size={14} color={Theme.colors.textMuted} />
        <Text style={styles.footerText}>Syncing with Local Railway Records</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
  },
  welcome: {
    fontSize: 16,
    color: Theme.colors.textMuted,
  },
  chartCard: {
    margin: Theme.spacing.md,
    height: 300,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.primary,
  },
  chartArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  barContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '70%',
    backgroundColor: Theme.colors.primaryLight,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    opacity: 0.7,
  },
  activeBar: {
    backgroundColor: Theme.colors.accent,
    opacity: 1,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 8,
    color: Theme.colors.textMuted,
    fontWeight: 'bold',
  },
  summaryCard: {
    margin: Theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.colors.primary,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  }
});
