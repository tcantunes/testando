import React, { useEffect, useState, useRef } from "react";
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
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParamList } from "../routes/types";
import { minhasInscricoes, cancelarInscricao } from "../lib/backend";
import { colors, spacing, typography, borderRadius } from '../theme/colors';

interface VagaInscricao {
  id: number;
  vagaId: number;
  vaga: {
    id: number;
    nome: string;
    local: string;
    data_hora: string | null;
    categoria?: string;
    criador?: { nome: string };
  };
}

const VagasVoluntariadasScreen = () => {
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();
  const [vagas, setVagas] = useState<VagaInscricao[]>([]);
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
      const data = await minhasInscricoes();
      const mapped = data.map((i: any) => ({
        id: i.id,
        vagaId: i.vagaId ?? i.vaga?.id,
        vaga: i.vaga,
      }));
      setVagas(mapped);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível carregar suas inscrições.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVagas();
    setRefreshing(false);
  };

  const handleRemoveRegistration = async (vagaId: number) => {
    Alert.alert(
      "Cancelar Inscrição",
      "Tem certeza que deseja cancelar sua inscrição nesta ação?",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelarInscricao(vagaId);
              setVagas((prev) => prev.filter((v) => v.vagaId !== vagaId));
              Alert.alert("Sucesso", "Inscrição cancelada.");
            } catch (err) {
              Alert.alert("Erro", "Não foi possível cancelar a inscrição.");
            }
          },
        },
      ]
    );
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

  const renderItem = ({ item }: { item: VagaInscricao }) => (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      {/* Badge de inscrito */}
      <View style={styles.enrolledBadge}>
        <MaterialIcons name="check-circle" size={14} color={colors.primary.main} />
        <Text style={styles.enrolledText}>Inscrito</Text>
      </View>

      <Text style={styles.cardTitle}>{item.vaga?.nome}</Text>
      
      <View style={styles.cardInfo}>
        <View style={styles.infoItem}>
          <MaterialIcons name="location-on" size={18} color={colors.primary.main} />
          <Text style={styles.infoText}>{item.vaga?.local}</Text>
        </View>
        <View style={styles.infoItem}>
          <MaterialIcons name="schedule" size={18} color={colors.accent.orange} />
          <Text style={styles.infoText}>{formatDate(item.vaga?.data_hora)}</Text>
        </View>
        {item.vaga?.criador && (
          <View style={styles.infoItem}>
            <MaterialIcons name="business" size={18} color={colors.neutral.textMuted} />
            <Text style={styles.infoText}>{item.vaga.criador.nome}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => navigation.navigate("Chat", { 
            vagaId: item.vagaId, 
            vagaNome: item.vaga?.nome 
          })}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={colors.gradients.primary as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.chatButtonGradient}
          >
            <MaterialIcons name="chat" size={20} color={colors.neutral.white} />
            <Text style={styles.chatButtonText}>Abrir Chat</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => handleRemoveRegistration(item.vagaId)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="close" size={20} color={colors.feedback.error} />
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Carregando suas inscrições...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      
      {/* Espaço para o AppHeader */}
      <View style={styles.headerSpacer} />

      <FlatList
        data={vagas}
        keyExtractor={(item) => String(item.vagaId)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search" size={64} color={colors.neutral.border} />
            <Text style={styles.emptyTitle}>Nenhuma inscrição</Text>
            <Text style={styles.emptyText}>
              Você ainda não se inscreveu em nenhuma ação. Explore as oportunidades disponíveis!
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => navigation.navigate('DashboardVagas')}
            >
              <Text style={styles.exploreButtonText}>Explorar ações</Text>
            </TouchableOpacity>
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
  enrolledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary.main + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  enrolledText: {
    ...typography.small,
    color: colors.primary.main,
    fontWeight: '600',
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
    gap: spacing.md,
  },
  chatButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  chatButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  chatButtonText: {
    ...typography.caption,
    color: colors.neutral.white,
    fontWeight: '700',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: '#FEF2F2',
    gap: spacing.xs,
  },
  cancelButtonText: {
    ...typography.caption,
    color: colors.feedback.error,
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
    marginBottom: spacing.lg,
  },
  exploreButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  exploreButtonText: {
    ...typography.body,
    color: colors.neutral.white,
    fontWeight: '700',
  },
});

export default VagasVoluntariadasScreen;
