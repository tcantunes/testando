import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
  TextInput,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackParamList } from '../routes/types';
import { colors, spacing, typography, borderRadius } from '../theme/colors';
import { inscritosDaVaga, confirmarPresenca, Inscricao } from '../lib/backend';
import { useToast } from '../contexts/ToastContext';

type GerenciarInscritosRouteProp = RouteProp<StackParamList, 'GerenciarInscritos'>;

const GerenciarInscritosScreen = () => {
  const route = useRoute<GerenciarInscritosRouteProp>();
  const navigation = useNavigation();
  const { showSuccess, showError } = useToast();
  const { vagaId, vagaNome } = route.params;

  const [inscritos, setInscritos] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedInscricao, setSelectedInscricao] = useState<Inscricao | null>(null);
  const [horas, setHoras] = useState('1');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const buscarInscritos = async () => {
    try {
      const data = await inscritosDaVaga(vagaId);
      setInscritos(data);
    } catch (err) {
      console.error('Erro ao buscar inscritos:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    buscarInscritos();
  }, [vagaId]);

  const onRefresh = () => {
    setRefreshing(true);
    buscarInscritos();
  };

  const openConfirmModal = (inscricao: Inscricao) => {
    setSelectedInscricao(inscricao);
    setHoras('1');
    setConfirmModalVisible(true);
  };

  const handleConfirmarPresenca = async () => {
    if (!selectedInscricao) return;

    try {
      await confirmarPresenca(selectedInscricao.id, parseFloat(horas) || 1);
      showSuccess('Presença confirmada com sucesso!');
      setConfirmModalVisible(false);
      buscarInscritos();
    } catch (err) {
      showError('Erro ao confirmar presença');
      console.error(err);
    }
  };

  const totalInscritos = inscritos.length;
  const confirmados = inscritos.filter(i => i.presencaConfirmada).length;
  const pendentes = inscritos.filter(i => !i.presencaConfirmada).length;

  const renderInscrito = ({ item, index }: { item: Inscricao; index: number }) => {
    const voluntario = item.voluntario;
    const presencaConfirmada = item.presencaConfirmada;

    return (
      <Animated.View
        style={[
          styles.voluntarioCard,
          presencaConfirmada && styles.voluntarioCardConfirmado,
          { 
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              })
            }]
          }
        ]}
      >
        {/* Avatar e Info Principal */}
        <View style={styles.voluntarioHeader}>
          <LinearGradient
            colors={presencaConfirmada 
              ? [colors.feedback.success, '#059669'] 
              : colors.gradients.primary as [string, string]
            }
            style={styles.avatar}
          >
            <MaterialIcons 
              name={presencaConfirmada ? "check" : "person"} 
              size={24} 
              color={colors.neutral.white} 
            />
          </LinearGradient>
          
          <View style={styles.voluntarioInfo}>
            <Text style={styles.voluntarioNome}>{voluntario?.nome || 'Voluntário'}</Text>
            <Text style={styles.voluntarioEmail}>{voluntario?.email}</Text>
          </View>

          {presencaConfirmada && (
            <View style={styles.confirmedBadge}>
              <MaterialIcons name="verified" size={16} color={colors.feedback.success} />
              <Text style={styles.confirmedBadgeText}>Confirmado</Text>
            </View>
          )}
        </View>

        {/* Detalhes do Voluntário */}
        <View style={styles.detalhesContainer}>
          {voluntario?.telefone && (
            <View style={styles.detalheItem}>
              <View style={styles.detalheIconContainer}>
                <MaterialIcons name="phone" size={16} color={colors.primary.main} />
              </View>
              <Text style={styles.detalheText}>{voluntario.telefone}</Text>
            </View>
          )}

          {voluntario?.cidade && (
            <View style={styles.detalheItem}>
              <View style={styles.detalheIconContainer}>
                <MaterialIcons name="location-on" size={16} color={colors.accent.orange} />
              </View>
              <Text style={styles.detalheText}>
                {voluntario.cidade}{voluntario.estado ? `, ${voluntario.estado}` : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Ação */}
        {presencaConfirmada ? (
          <View style={styles.horasInfo}>
            <MaterialIcons name="schedule" size={18} color={colors.feedback.success} />
            <Text style={styles.horasText}>
              {item.horasVoluntariadas || 1}h voluntariada{(item.horasVoluntariadas || 1) !== 1 ? 's' : ''}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => openConfirmModal(item)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={colors.gradients.primary as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmButtonGradient}
            >
              <MaterialIcons name="check-circle" size={20} color={colors.neutral.white} />
              <Text style={styles.confirmButtonText}>Confirmar Presença</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.headerSpacer} />

      {/* Header Card */}
      <View style={styles.headerCard}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={22} color={colors.neutral.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Voluntários Inscritos</Text>
          <Text style={styles.headerSubtitle}>{vagaNome}</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalInscritos}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        
        <View style={[styles.statCard, styles.statCardSuccess]}>
          <Text style={[styles.statNumber, styles.statNumberSuccess]}>{confirmados}</Text>
          <Text style={styles.statLabel}>Confirmados</Text>
        </View>
        
        <View style={[styles.statCard, styles.statCardWarning]}>
          <Text style={[styles.statNumber, styles.statNumberWarning]}>{pendentes}</Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
      </View>

      {/* Lista de Voluntários */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Carregando inscritos...</Text>
        </View>
      ) : (
        <FlatList
          data={inscritos}
          renderItem={renderInscrito}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary.main]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <MaterialIcons name="people-outline" size={48} color={colors.neutral.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>Nenhum inscrito</Text>
              <Text style={styles.emptyText}>
                Os voluntários inscritos nesta ação aparecerão aqui.
              </Text>
            </View>
          }
        />
      )}

      {/* Modal de Confirmação */}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <MaterialIcons name="check-circle" size={32} color={colors.primary.main} />
              </View>
              <Text style={styles.modalTitle}>Confirmar Presença</Text>
            </View>
            
            <Text style={styles.modalVoluntario}>
              {selectedInscricao?.voluntario?.nome}
            </Text>

            <View style={styles.horasInputContainer}>
              <Text style={styles.horasInputLabel}>Horas voluntariadas</Text>
              <View style={styles.horasInputWrapper}>
                <TouchableOpacity 
                  style={styles.horasButton}
                  onPress={() => setHoras(String(Math.max(1, parseInt(horas) - 1)))}
                >
                  <MaterialIcons name="remove" size={20} color={colors.primary.main} />
                </TouchableOpacity>
                <TextInput
                  style={styles.horasInput}
                  value={horas}
                  onChangeText={setHoras}
                  keyboardType="numeric"
                  textAlign="center"
                />
                <TouchableOpacity 
                  style={styles.horasButton}
                  onPress={() => setHoras(String(parseInt(horas) + 1))}
                >
                  <MaterialIcons name="add" size={20} color={colors.primary.main} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleConfirmarPresenca}
              >
                <LinearGradient
                  colors={colors.gradients.primary as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalConfirmGradient}
                >
                  <Text style={styles.modalConfirmText}>Confirmar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default GerenciarInscritosScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  headerSpacer: {
    height: Platform.OS === 'ios' ? 120 : 100,
  },
  
  // Header Card
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    ...colors.shadows.medium,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerTitle: {
    ...typography.subtitle,
    color: colors.neutral.textPrimary,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.primary.main,
    fontWeight: '600',
    marginTop: 2,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    ...colors.shadows.small,
  },
  statCardSuccess: {
    backgroundColor: '#ECFDF5',
  },
  statCardWarning: {
    backgroundColor: '#FEF3C7',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.neutral.textPrimary,
  },
  statNumberSuccess: {
    color: colors.feedback.success,
  },
  statNumberWarning: {
    color: colors.accent.orange,
  },
  statLabel: {
    ...typography.caption,
    color: colors.neutral.textMuted,
    marginTop: spacing.xs,
    fontWeight: '500',
  },

  // Lista
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.neutral.textMuted,
  },

  // Card do Voluntário
  voluntarioCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...colors.shadows.medium,
  },
  voluntarioCardConfirmado: {
    borderLeftWidth: 4,
    borderLeftColor: colors.feedback.success,
  },
  voluntarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voluntarioInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  voluntarioNome: {
    ...typography.subtitle,
    color: colors.neutral.textPrimary,
    fontWeight: '600',
  },
  voluntarioEmail: {
    ...typography.caption,
    color: colors.neutral.textMuted,
    marginTop: 2,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  confirmedBadgeText: {
    ...typography.small,
    color: colors.feedback.success,
    fontWeight: '600',
  },

  // Detalhes
  detalhesContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    gap: spacing.sm,
  },
  detalheItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detalheIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detalheText: {
    ...typography.body,
    color: colors.neutral.textSecondary,
  },

  // Horas Info
  horasInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
  },
  horasText: {
    ...typography.body,
    color: colors.feedback.success,
    fontWeight: '600',
  },

  // Confirm Button
  confirmButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  confirmButtonText: {
    ...typography.body,
    color: colors.neutral.white,
    fontWeight: '700',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral.border + '50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.neutral.textSecondary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.neutral.textMuted,
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 340,
    ...colors.shadows.large,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.main + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.neutral.textPrimary,
    fontWeight: '700',
  },
  modalVoluntario: {
    ...typography.body,
    color: colors.neutral.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  horasInputContainer: {
    marginBottom: spacing.xl,
  },
  horasInputLabel: {
    ...typography.caption,
    color: colors.neutral.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  horasInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  horasButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.main + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  horasInput: {
    width: 80,
    height: 50,
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.lg,
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral.background,
  },
  modalCancelText: {
    ...typography.body,
    color: colors.neutral.textSecondary,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  modalConfirmGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalConfirmText: {
    ...typography.body,
    color: colors.neutral.white,
    fontWeight: '700',
  },
});

