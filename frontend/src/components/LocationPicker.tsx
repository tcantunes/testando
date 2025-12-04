import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme/colors';

const { width } = Dimensions.get('window');

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
  address?: string;
  loading?: boolean;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  onLocationChange,
  address,
  loading = false,
}) => {
  const mapRef = useRef<MapView>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    latitude && longitude ? { latitude, longitude } : null
  );

  // Região padrão (Brasil - Rio de Janeiro)
  const defaultRegion: Region = {
    latitude: -22.9068,
    longitude: -43.1729,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Atualizar marcador quando as coordenadas mudam externamente
  useEffect(() => {
    if (latitude && longitude) {
      const newPosition = { latitude, longitude };
      setMarkerPosition(newPosition);
      
      // Animar para a nova posição
      if (mapRef.current && isMapReady) {
        mapRef.current.animateToRegion({
          ...newPosition,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 500);
      }
    }
  }, [latitude, longitude, isMapReady]);

  const handleMarkerDragEnd = (e: any) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    setMarkerPosition({ latitude: lat, longitude: lng });
    onLocationChange(lat, lng);
  };

  const handleMapPress = (e: any) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    setMarkerPosition({ latitude: lat, longitude: lng });
    onLocationChange(lat, lng);
  };

  const centerOnMarker = () => {
    if (markerPosition && mapRef.current) {
      mapRef.current.animateToRegion({
        ...markerPosition,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 300);
    }
  };

  if (loading) {
    return (
      <View style={styles.placeholder}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.placeholderText}>
          Buscando localização...
        </Text>
        <Text style={styles.placeholderSubtext}>
          Aguarde enquanto encontramos o endereço no mapa
        </Text>
      </View>
    );
  }

  if (!latitude && !longitude) {
    return (
      <View style={styles.placeholder}>
        <MaterialIcons name="map" size={48} color={colors.neutral.border} />
        <Text style={styles.placeholderText}>
          Digite o CEP para visualizar o mapa
        </Text>
        <Text style={styles.placeholderSubtext}>
          O mapa aparecerá aqui após preencher o CEP
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="place" size={20} color={colors.primary.main} />
          <Text style={styles.headerTitle}>Localização no Mapa</Text>
        </View>
        <TouchableOpacity 
          style={styles.centerButton}
          onPress={centerOnMarker}
          activeOpacity={0.7}
        >
          <MaterialIcons name="my-location" size={18} color={colors.primary.main} />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={
            markerPosition 
              ? { ...markerPosition, latitudeDelta: 0.005, longitudeDelta: 0.005 }
              : defaultRegion
          }
          onMapReady={() => setIsMapReady(true)}
          onPress={handleMapPress}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          toolbarEnabled={false}
        >
          {markerPosition && (
            <Marker
              coordinate={markerPosition}
              draggable
              onDragEnd={handleMarkerDragEnd}
              title="Local da Ação"
              description={address || "Arraste para ajustar"}
            >
              <View style={styles.customMarker}>
                <View style={styles.markerPin}>
                  <MaterialIcons name="volunteer-activism" size={24} color={colors.neutral.white} />
                </View>
                <View style={styles.markerShadow} />
              </View>
            </Marker>
          )}
        </MapView>

        {!isMapReady && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary.main} />
          </View>
        )}
      </View>

      <View style={styles.instructions}>
        <MaterialIcons name="info-outline" size={16} color={colors.neutral.textMuted} />
        <Text style={styles.instructionsText}>
          Toque no mapa ou arraste o marcador para ajustar o local exato
        </Text>
      </View>

      {markerPosition && (
        <View style={styles.coordsDisplay}>
          <Text style={styles.coordsLabel}>Coordenadas:</Text>
          <Text style={styles.coordsValue}>
            {markerPosition.latitude.toFixed(6)}, {markerPosition.longitude.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
};

export default LocationPicker;

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerTitle: {
    ...typography.subtitle,
    color: colors.neutral.textPrimary,
    fontSize: 16,
  },
  centerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.main + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    height: 250,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.neutral.border,
    ...colors.shadows.medium,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutral.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customMarker: {
    alignItems: 'center',
  },
  markerPin: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.neutral.white,
    ...colors.shadows.medium,
  },
  markerShadow: {
    width: 20,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    marginTop: 2,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  instructionsText: {
    ...typography.small,
    color: colors.neutral.textMuted,
    flex: 1,
  },
  coordsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.primary.main + '10',
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  coordsLabel: {
    ...typography.small,
    color: colors.neutral.textSecondary,
    fontWeight: '600',
  },
  coordsValue: {
    ...typography.small,
    color: colors.primary.main,
    fontFamily: 'monospace',
  },
  placeholder: {
    height: 200,
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.neutral.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
    padding: spacing.lg,
  },
  placeholderText: {
    ...typography.body,
    color: colors.neutral.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  placeholderSubtext: {
    ...typography.small,
    color: colors.neutral.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
