import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
  Animated,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList } from '../routes/types';
import { minhasVagas } from '../lib/backend';
import { colors, spacing, typography, borderRadius } from '../theme/colors';

interface VagaCriada {
  id: number;
  nome: string;
  local: string;
  data_hora: string;
  vagas_disponiveis: number;
  categoria?: string;
  descricao?: string;
}

const MinhasVagasScreen = () => {
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();
  const [vagas, setVagas] = useState<VagaCriada[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchVagas();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const fetchVagas = async () => {
    try {
      const data = await minhasVagas();
      setVagas(data);
    } catch (error: any) {
      Alert.alert("Erro", error?.response?.data?.error || "Não foi possível carregar suas vagas.");
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVagas();
    setRefreshing(false);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Data a definir';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }: { item: VagaCriada }) => (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <MaterialIcons name="volunteer-activism" size={14} color={colors.primary.main} />
          <Text style={styles.categoryText}>{item.categoria || 'Geral'}</Text>
        </View>
        <View style={styles.vagasCount}>
          <MaterialIcons name="people" size={14} color={colors.neutral.textMuted} />
          <Text style={styles.vagasText}>{item.vagas_disponiveis}</Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>{item.nome}</Text>

      <View style={styles.cardInfo}>
        <View style={styles.infoItem}>
          <MaterialIcons name="location-on" size={16} color={colors.primary.main} />
          <Text style={styles.infoText}>{item.local}</Text>
        </View>
        <View style={styles.infoItem}>
          <MaterialIcons name="schedule" size={16} color={colors.accent.orange} />
          <Text style={styles.infoText}>{formatDate(item.data_hora)}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.inscritosButton}
          onPress={() => navigation.navigate("GerenciarInscritos", { vagaId: item.id, vagaNome: item.nome })}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={colors.gradients.primary as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionButtonGradient}
          >
            <MaterialIcons name="people" size={18} color={colors.neutral.white} />
            <Text style={styles.actionButtonText}>Inscritos</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => navigation.navigate("Chat", { vagaId: item.id, vagaNome: item.nome })}
          activeOpacity={0.7}
        >
          <MaterialIcons name="chat" size={18} color={colors.primary.main} />
          <Text style={styles.chatButtonText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("EditarVaga", { vaga: item })}
          activeOpacity={0.7}
        >
          <MaterialIcons name="edit" size={18} color={colors.secondary.main} />
          <Text style={[styles.editButtonText]}>Editar</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Carregando suas ações...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Espaço para o AppHeader */}
      <View style={styles.headerSpacer} />

      {/* Botão criar */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("CreateVaga")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors.gradients.secondary as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.createButtonGradient}
        >
          <MaterialIcons name="add-circle" size={22} color={colors.neutral.white} />
          <Text style={styles.createButtonText}>Criar Nova Ação</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Lista */}
      <FlatList
        data={vagas}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="campaign" size={64} color={colors.neutral.border} />
            <Text style={styles.emptyTitle}>Nenhuma ação criada</Text>
            <Text style={styles.emptyText}>
              Crie sua primeira ação voluntária e comece a fazer a diferença!
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.main]}
            tintColor={colors.primary.main}
          />
        }
      />
    </SafeAreaView>
  );
};

export default MinhasVagasScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  headerSpacer: {
    height: Platform.OS === 'ios' ? 120 : 100,
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
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    left: spacing.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  headerTitle: {
    ...typography.title,
    color: colors.neutral.white,
    marginTop: spacing.sm,
  },
  headerSubtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
  },
  createButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...colors.shadows.medium,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  createButtonText: {
    ...typography.body,
    color: colors.neutral.white,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...colors.shadows.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main + '15',
    gap: spacing.xs,
  },
  categoryText: {
    ...typography.small,
    color: colors.primary.main,
    fontWeight: '600',
  },
  vagasCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  vagasText: {
    ...typography.small,
    color: colors.neutral.textMuted,
  },
  cardTitle: {
    ...typography.subtitle,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.md,
  },
  cardInfo: {
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    ...typography.caption,
    color: colors.neutral.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
  },
  inscritosButton: {
    flex: 1.2,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  chatButton: {
    flex: 0.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.primary.main,
    gap: spacing.xs,
    backgroundColor: colors.neutral.white,
  },
  chatButtonText: {
    ...typography.small,
    color: colors.primary.main,
    fontWeight: '600',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    gap: spacing.xs,
  },
  actionButtonText: {
    ...typography.small,
    color: colors.neutral.white,
    fontWeight: '700',
  },
  editButton: {
    flex: 0.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.secondary.main,
    backgroundColor: colors.neutral.white,
    gap: spacing.xs,
  },
  editButtonText: {
    ...typography.small,
    color: colors.secondary.main,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...typography.subtitle,
    color: colors.neutral.textPrimary,
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.neutral.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
