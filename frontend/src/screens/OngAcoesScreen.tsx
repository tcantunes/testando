import React, { useEffect, useState, useRef } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Animated,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { StackParamList } from '../routes/types';
import { colors, spacing, typography, borderRadius } from '../theme/colors';

import {
  minhasVagas,
  deletarVaga
} from '../lib/backend';

type Vaga = {
  id: number;
  nome: string;
  descricao: string;
  local: string;
  data_hora: string;
  vagas_disponiveis: number;
  categoria: string;
};

const OngAcoesScreen = () => {
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();

  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchVagas = async () => {
    try {
      const data = await minhasVagas();
      setVagas(data);
    } catch (error: any) {
      Alert.alert("Erro", error?.response?.data?.error || "Não foi possível carregar as vagas.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVagas();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVagas();
    setRefreshing(false);
  };

  const handleDelete = (vagaId: number) => {
    Alert.alert(
      "Excluir ação",
      "Tem certeza que deseja excluir esta ação? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deletarVaga(vagaId);
              setVagas((prev) => prev.filter((v) => v.id !== vagaId));
              Alert.alert("Sucesso", "Ação excluída com sucesso!");
            } catch (err: any) {
              Alert.alert("Erro", err?.response?.data?.error || "Erro ao excluir ação");
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Data a definir';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }: { item: Vaga }) => (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim }
      ]}
    >
      {/* Header do card */}
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <MaterialIcons name="volunteer-activism" size={16} color={colors.primary.main} />
          <Text style={styles.categoryText}>{item.categoria || 'Geral'}</Text>
        </View>
        <View style={styles.vagasCount}>
          <MaterialIcons name="people" size={16} color={colors.neutral.textMuted} />
          <Text style={styles.vagasText}>{item.vagas_disponiveis} vagas</Text>
        </View>
      </View>

      {/* Título e descrição */}
      <Text style={styles.cardTitle}>{item.nome}</Text>
      <Text style={styles.cardDescription} numberOfLines={2}>{item.descricao}</Text>

      {/* Info */}
      <View style={styles.cardInfo}>
        <View style={styles.infoItem}>
          <MaterialIcons name="location-on" size={18} color={colors.primary.main} />
          <Text style={styles.infoText}>{item.local}</Text>
        </View>
        <View style={styles.infoItem}>
          <MaterialIcons name="schedule" size={18} color={colors.accent.orange} />
          <Text style={styles.infoText}>{formatDate(item.data_hora)}</Text>
        </View>
      </View>

      {/* Ações */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("Chat", { vagaId: item.id, vagaNome: item.nome })}
          activeOpacity={0.7}
        >
          <MaterialIcons name="chat" size={20} color={colors.primary.main} />
          <Text style={styles.actionButtonText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("EditarVaga", { vaga: item })}
          activeOpacity={0.7}
        >
          <MaterialIcons name="edit" size={20} color={colors.secondary.main} />
          <Text style={[styles.actionButtonText, { color: colors.secondary.main }]}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="delete" size={20} color={colors.feedback.error} />
          <Text style={[styles.actionButtonText, { color: colors.feedback.error }]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Suas Ações</Text>
        <Text style={styles.sectionSubtitle}>
          {vagas.length} {vagas.length === 1 ? 'ação criada' : 'ações criadas'}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary.main} size="large" />
        <Text style={styles.loadingText}>Carregando suas ações...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      
      {/* Espaço para o AppHeader */}
      <View style={styles.headerSpacer} />

      {/* Botão criar nova ação */}
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
          <MaterialIcons name="add-circle" size={24} color={colors.neutral.white} />
          <Text style={styles.createButtonText}>Criar Nova Ação</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Lista de vagas */}
      <FlatList
        data={vagas}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="campaign" size={64} color={colors.neutral.border} />
            <Text style={styles.emptyTitle}>Nenhuma ação criada</Text>
            <Text style={styles.emptyText}>
              Crie sua primeira ação e comece a recrutar voluntários!
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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

export default OngAcoesScreen;

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
  mainHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  headerTitle: {
    ...typography.title,
    color: colors.neutral.white,
    fontWeight: '800',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
    ...typography.subtitle,
    color: colors.neutral.white,
    fontWeight: '700',
  },
  headerSection: {
    paddingTop: spacing.md,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.neutral.textPrimary,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.neutral.textMuted,
    marginTop: spacing.xs,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.neutral.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
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
    marginBottom: spacing.xs,
  },
  cardDescription: {
    ...typography.body,
    color: colors.neutral.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
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
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral.background,
    gap: spacing.xs,
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.primary.main,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
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
