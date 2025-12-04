import React, { useEffect, useState, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  Alert,
  StatusBar,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from "@expo/vector-icons";
import API from "../lib/api";
import { colors, spacing, typography, borderRadius } from '../theme/colors';

const { width } = Dimensions.get('window');

interface Metrics {
  total_vagas_criadas: number;
  total_inscricoes: number;
}

const OngReportsScreen = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (!loading && metrics) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, metrics]);

  const fetchMetrics = async () => {
    try {
      const res = await API.get("/relatorios/ong");
      setMetrics(res.data);
    } catch (err: any) {
      Alert.alert("Erro", err?.response?.data?.error || "Não foi possível buscar as métricas.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Carregando relatórios...</Text>
      </View>
    );
  }

  const taxa = metrics && metrics.total_vagas_criadas > 0 
    ? ((metrics.total_inscricoes / metrics.total_vagas_criadas) * 100).toFixed(1)
    : '0';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      
      {/* Espaço para o AppHeader */}
      <View style={styles.headerSpacer} />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Cards de métricas */}
          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, styles.metricCardPrimary]}>
              <LinearGradient
                colors={colors.gradients.primary as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.metricGradient}
              >
                <View style={styles.metricIconContainer}>
                  <MaterialIcons name="campaign" size={28} color={colors.neutral.white} />
                </View>
                <Text style={styles.metricValue}>{metrics?.total_vagas_criadas || 0}</Text>
                <Text style={styles.metricLabel}>Ações Criadas</Text>
              </LinearGradient>
            </View>

            <View style={[styles.metricCard, styles.metricCardSecondary]}>
              <LinearGradient
                colors={colors.gradients.ocean as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.metricGradient}
              >
                <View style={styles.metricIconContainer}>
                  <MaterialIcons name="people" size={28} color={colors.neutral.white} />
                </View>
                <Text style={styles.metricValue}>{metrics?.total_inscricoes || 0}</Text>
                <Text style={styles.metricLabel}>Inscrições</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Card de engajamento */}
          <View style={styles.engagementCard}>
            <View style={styles.engagementHeader}>
              <MaterialIcons name="trending-up" size={24} color={colors.primary.main} />
              <Text style={styles.engagementTitle}>Taxa de Engajamento</Text>
            </View>
            
            <View style={styles.engagementContent}>
              <Text style={styles.engagementValue}>{taxa}%</Text>
              <Text style={styles.engagementDescription}>
                média de inscrições por ação
              </Text>
            </View>

            {/* Barra de progresso */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={colors.gradients.primary as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(Number(taxa), 100)}%` }
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Dicas */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <MaterialIcons name="lightbulb" size={24} color={colors.accent.orange} />
              <Text style={styles.tipsTitle}>Dicas para melhorar</Text>
            </View>
            
            <View style={styles.tipItem}>
              <MaterialIcons name="check-circle" size={20} color={colors.primary.main} />
              <Text style={styles.tipText}>
                Adicione descrições detalhadas às suas ações
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <MaterialIcons name="check-circle" size={20} color={colors.primary.main} />
              <Text style={styles.tipText}>
                Use categorias relevantes para facilitar a busca
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <MaterialIcons name="check-circle" size={20} color={colors.primary.main} />
              <Text style={styles.tipText}>
                Mantenha o chat ativo para engajar voluntários
              </Text>
            </View>
          </View>

          {/* Footer info */}
          <View style={styles.footerInfo}>
            <MaterialIcons name="info-outline" size={16} color={colors.neutral.textMuted} />
            <Text style={styles.footerText}>
              Dados atualizados em tempo real
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  headerSpacer: {
    height: Platform.OS === 'ios' ? 100 : 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.neutral.background,
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.neutral.textMuted,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    right: -50,
  },
  decorCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -30,
    left: -40,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.neutral.white,
    marginTop: spacing.sm,
  },
  headerSubtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    marginTop: -spacing.lg,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  metricCard: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...colors.shadows.medium,
  },
  metricCardPrimary: {},
  metricCardSecondary: {},
  metricGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  metricIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  metricValue: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.neutral.white,
  },
  metricLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
  },
  engagementCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...colors.shadows.medium,
  },
  engagementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  engagementTitle: {
    ...typography.subtitle,
    color: colors.neutral.textPrimary,
  },
  engagementContent: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  engagementValue: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.primary.main,
  },
  engagementDescription: {
    ...typography.caption,
    color: colors.neutral.textMuted,
  },
  progressContainer: {
    paddingTop: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  tipsCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...colors.shadows.medium,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  tipsTitle: {
    ...typography.subtitle,
    color: colors.neutral.textPrimary,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tipText: {
    ...typography.body,
    color: colors.neutral.textSecondary,
    flex: 1,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xxl,
  },
  footerText: {
    ...typography.small,
    color: colors.neutral.textMuted,
  },
});

export default OngReportsScreen;
