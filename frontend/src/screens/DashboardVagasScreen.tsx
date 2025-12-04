import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
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
import ConfirmationModal from '../components/ConfirmationModal';
import { colors, spacing, typography, borderRadius } from '../theme/colors';

import * as Location from 'expo-location';
import {
  listarVagas,
  minhasInscricoes,
  inscreverNaVaga
} from '../lib/backend';
import { useFavorites } from '../contexts/FavoritesContext';
import { useToast } from '../contexts/ToastContext';
import { calculateDistance, formatDistance } from '../utils/distance';
import { shareVaga } from '../utils/share';

interface Vaga {
  id: number;
  nome: string;
  descricao: string;
  local: string;
  data_hora: string | null;
  vagas_disponiveis: number;
  categoria: string;
  cidade: string;
  estado: string;
  latitude?: number | null;
  longitude?: number | null;
  distancia?: number | null;
  criador?: { nome: string };
}

const CATEGORIAS = [
  { key: '', label: 'Todas', icon: 'apps' },
  { key: 'proximas', label: 'Próximas', icon: 'near-me' },
  { key: 'favoritos', label: 'Favoritos', icon: 'favorite' },
  { key: 'Meio Ambiente', label: 'Meio Ambiente', icon: 'eco' },
  { key: 'Saúde', label: 'Saúde', icon: 'local-hospital' },
  { key: 'Educação', label: 'Educação', icon: 'school' },
  { key: 'Animais', label: 'Animais', icon: 'pets' },
  { key: 'Social', label: 'Social', icon: 'people' },
];

const DashboardVagasScreen = () => {
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { showSuccess, showWarning } = useToast();

  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedVagaId, setSelectedVagaId] = useState<number | null>(null);
  const [volunteeredVagaIds, setVolunteeredVagaIds] = useState<number[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Obter localização do usuário
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.log('Erro ao obter localização:', error);
      }
    })();
  }, []);

  const buscarVagas = async () => {
    setLoading(true);
    try {
      let data = await listarVagas();

      // Filtro de favoritos
      if (categoriaFiltro === 'favoritos') {
        data = data.filter((v: Vaga) => favorites.includes(v.id));
      } else if (categoriaFiltro === 'proximas') {
        // Filtro por distância (até 50km)
        if (userLocation) {
          data = data
            .filter((v: Vaga) => v.latitude && v.longitude)
            .map((v: Vaga) => ({
              ...v,
              distancia: calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                v.latitude!,
                v.longitude!
              ),
            }))
            .filter((v: any) => v.distancia <= 50)
            .sort((a: any, b: any) => a.distancia - b.distancia);
        } else {
          showWarning('Ative a localização para ver vagas próximas');
          data = [];
        }
      } else if (categoriaFiltro) {
        data = data.filter((v: Vaga) => 
          v.categoria?.toLowerCase().includes(categoriaFiltro.toLowerCase())
        );
      }

      // Calcular distância para todas as vagas se tiver localização
      if (userLocation) {
        data = data.map((v: Vaga) => ({
          ...v,
          distancia: v.latitude && v.longitude
            ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                v.latitude,
                v.longitude
              )
            : null,
        }));
      }

      setVagas(data);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível carregar as vagas');
    }
    setLoading(false);
  };

  const buscarMinhasInscricoes = async () => {
    try {
      const data = await minhasInscricoes();
      const ids = data.map((item: any) => item.vagaId);
      setVolunteeredVagaIds(ids);
    } catch (err) {
      console.log('Erro ao buscar inscrições:', err);
    }
  };

  useEffect(() => {
    buscarVagas();
    buscarMinhasInscricoes();
  }, [categoriaFiltro, favorites, userLocation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await buscarVagas();
    await buscarMinhasInscricoes();
    setRefreshing(false);
  };

  const openConfirmationModal = (vagaId: number) => {
    setSelectedVagaId(vagaId);
    setIsModalVisible(true);
  };

  const handleConfirm = async () => {
    if (!selectedVagaId) return;

    setIsModalVisible(false);
    setLoading(true);

    try {
      await inscreverNaVaga(selectedVagaId);
      Alert.alert('Sucesso! 🎉', 'Você se inscreveu nesta ação voluntária!');
      buscarVagas();
      buscarMinhasInscricoes();
    } catch (error: any) {
      Alert.alert('Erro', error?.response?.data?.error || 'Erro ao se voluntariar.');
    }

    setLoading(false);
    setSelectedVagaId(null);
  };

  const getCategoryIcon = (categoria: string) => {
    const cat = CATEGORIAS.find(c => c.key.toLowerCase() === categoria?.toLowerCase());
    return cat?.icon || 'volunteer-activism';
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

  const renderVaga = ({ item, index }: { item: Vaga; index: number }) => {
    const hasVolunteered = volunteeredVagaIds.includes(item.id);

    return (
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }]
          }
        ]}
      >
        {/* Header do card */}
        <View style={styles.cardHeader}>
          <View style={[
            styles.categoryBadge,
            { backgroundColor: colors.primary.light + '20' }
          ]}>
            <MaterialIcons 
              name={getCategoryIcon(item.categoria) as any} 
              size={16} 
              color={colors.primary.main} 
            />
            <Text style={styles.categoryText}>{item.categoria || 'Geral'}</Text>
          </View>
          <View style={styles.cardHeaderRight}>
            <TouchableOpacity 
              onPress={async () => {
                const shared = await shareVaga(item);
                if (shared) {
                  showSuccess('Vaga compartilhada!');
                }
              }}
              style={styles.shareButton}
            >
              <MaterialIcons 
                name="share" 
                size={20} 
                color={colors.neutral.textMuted} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                toggleFavorite(item.id);
                showSuccess(isFavorite(item.id) ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
              }}
              style={styles.favoriteButton}
            >
              <MaterialIcons 
                name={isFavorite(item.id) ? "favorite" : "favorite-border"} 
                size={22} 
                color={isFavorite(item.id) ? colors.feedback.error : colors.neutral.textMuted} 
              />
            </TouchableOpacity>
            <View style={styles.vagasCount}>
              <MaterialIcons name="people" size={16} color={colors.neutral.textMuted} />
              <Text style={styles.vagasText}>{item.vagas_disponiveis} vagas</Text>
            </View>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.cardTitle}>{item.nome}</Text>
        
        {/* Descrição */}
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.descricao}
        </Text>

        {/* Info */}
        <View style={styles.cardInfo}>
          <View style={styles.infoItem}>
            <MaterialIcons name="location-on" size={18} color={colors.primary.main} />
            <Text style={styles.infoText}>
              {item.local || item.cidade}
              {item.distancia !== null && item.distancia !== undefined && (
                <Text style={styles.distanceText}> • {formatDistance(item.distancia)}</Text>
              )}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="schedule" size={18} color={colors.accent.orange} />
            <Text style={styles.infoText}>{formatDate(item.data_hora)}</Text>
          </View>
        </View>

        {/* Organizador */}
        {item.criador && (
          <View style={styles.organizerRow}>
            <MaterialIcons name="business" size={16} color={colors.neutral.textMuted} />
            <Text style={styles.organizerText}>Por: {item.criador.nome}</Text>
          </View>
        )}

        {/* Botão */}
        {hasVolunteered ? (
          <View style={styles.enrolledBadge}>
            <MaterialIcons name="check-circle" size={20} color={colors.primary.main} />
            <Text style={styles.enrolledText}>Você está inscrito!</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.volunteerButton}
            onPress={() => openConfirmationModal(item.id)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={colors.gradients.primary as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.volunteerButtonGradient}
            >
              <MaterialIcons name="favorite" size={20} color={colors.neutral.white} />
              <Text style={styles.volunteerButtonText}>Quero participar</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Título da seção */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Oportunidades</Text>
        <Text style={styles.sectionSubtitle}>
          {vagas.length} {vagas.length === 1 ? 'vaga disponível' : 'vagas disponíveis'}
        </Text>
      </View>

      {/* Filtros de categoria */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIAS}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              categoriaFiltro === item.key && styles.filterChipActive
            ]}
            onPress={() => setCategoriaFiltro(item.key)}
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name={item.icon as any} 
              size={18} 
              color={categoriaFiltro === item.key ? colors.neutral.white : colors.primary.main} 
            />
            <Text style={[
              styles.filterChipText,
              categoriaFiltro === item.key && styles.filterChipTextActive
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      
      {/* Espaço para o AppHeader */}
      <View style={styles.headerSpacer} />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Buscando oportunidades...</Text>
        </View>
      ) : (
        <FlatList
          data={vagas}
          renderItem={renderVaga}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search-off" size={64} color={colors.neutral.border} />
              <Text style={styles.emptyTitle}>Nenhuma vaga encontrada</Text>
              <Text style={styles.emptyText}>
                Tente remover os filtros ou volte mais tarde
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
          showsVerticalScrollIndicator={false}
        />
      )}

      <ConfirmationModal
        visible={isModalVisible}
        onConfirm={handleConfirm}
        onCancel={() => setIsModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default DashboardVagasScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  headerSpacer: {
    height: Platform.OS === 'ios' ? 120 : 100,
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
  headerSection: {
    paddingTop: spacing.lg,
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
  filterList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.white,
    borderWidth: 1.5,
    borderColor: colors.primary.main,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: colors.primary.main,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.primary.main,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.neutral.white,
  },
  listContent: {
    paddingBottom: spacing.xxl,
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
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  shareButton: {
    padding: spacing.xs,
  },
  favoriteButton: {
    padding: spacing.xs,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
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
    marginBottom: spacing.sm,
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
  distanceText: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
  },
  organizerText: {
    ...typography.small,
    color: colors.neutral.textMuted,
  },
  volunteerButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  volunteerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  volunteerButtonText: {
    ...typography.body,
    color: colors.neutral.white,
    fontWeight: '700',
  },
  enrolledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.main + '15',
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  enrolledText: {
    ...typography.body,
    color: colors.primary.main,
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
