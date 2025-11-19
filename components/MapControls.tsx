import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface MapControlsProps {
  onLocationPress: () => void;
  onLayerPress: () => void;
  onDirectionsPress: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function MapControls({
  onLocationPress,
  onLayerPress,
  onDirectionsPress,
  onZoomIn,
  onZoomOut,
}: MapControlsProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  
  return (
    <View style={styles.container}>
      {/* Zoom Controls */}
      <View style={[styles.zoomContainer, { backgroundColor: theme.controlButton, borderColor: theme.controlButtonBorder }]}>
        <TouchableOpacity
          style={[styles.zoomButton, { borderBottomColor: theme.controlButtonBorder }]}
          onPress={onZoomIn}
        >
          <Ionicons name="add" size={20} color={theme.icon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={onZoomOut}
        >
          <Ionicons name="remove" size={20} color={theme.icon} />
        </TouchableOpacity>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: theme.controlButton, borderColor: theme.controlButtonBorder }]}
          onPress={onLocationPress}
        >
          <Ionicons name="locate" size={20} color={theme.icon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: theme.controlButton, borderColor: theme.controlButtonBorder }]}
          onPress={onLayerPress}
        >
          <Ionicons name="layers" size={20} color={theme.icon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: theme.controlButton, borderColor: theme.controlButtonBorder }]}
          onPress={onDirectionsPress}
        >
          <Ionicons name="navigate" size={20} color={theme.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    top: 80,
    gap: 12,
  },
  zoomContainer: {
    width: 44,
    height: 88,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  zoomButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  controlsContainer: {
    gap: 12,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

interface LayerSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLayer: (style: string) => void;
  currentStyle: string;
}

export function LayerSelectorModal({ visible, onClose, onSelectLayer, currentStyle }: LayerSelectorModalProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];

  const mapStyles = [
    { id: 'dark', name: 'Dark', description: 'Dark theme for night viewing' },
    { id: 'streets', name: 'Streets', description: 'Detailed street map' },
    { id: 'outdoors', name: 'Outdoors', description: 'Outdoor features and trails' },
    { id: 'satellite', name: 'Satellite', description: 'Satellite imagery' },
    { id: 'hybrid', name: 'Hybrid', description: 'Satellite with street labels' },
  ];

  const getStyleUrl = (styleId: string) => {
    return `mapbox://styles/mapbox/${styleId}-v12`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={[modalStyles.modalContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={modalStyles.modalHeader}>
            <ThemedText type="subtitle" style={{ color: theme.text }}>
              Map Layers
            </ThemedText>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.modalContent} showsVerticalScrollIndicator={false}>
            {mapStyles.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[
                  modalStyles.layerItem,
                  currentStyle === getStyleUrl(style.id) && { 
                    backgroundColor: theme.primary + '20',
                    borderColor: theme.primary 
                  },
                  { borderColor: theme.border }
                ]}
                onPress={() => {
                  onSelectLayer(getStyleUrl(style.id));
                  onClose();
                }}
              >
                <View style={modalStyles.layerInfo}>
                  <ThemedText style={{ color: theme.text, fontWeight: '600' }}>
                    {style.name}
                  </ThemedText>
                  <ThemedText style={{ color: theme.icon, fontSize: 12 }}>
                    {style.description}
                  </ThemedText>
                </View>
                {currentStyle === getStyleUrl(style.id) && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  layerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  layerInfo: {
    flex: 1,
  },
});

// Floating Action Button Component
interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  color?: string;
}

export function FloatingActionButton({ 
  onPress, 
  icon = "add", 
  color 
}: FloatingActionButtonProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  
  return (
    <TouchableOpacity
      style={[
        fabStyles.fab,
        { backgroundColor: color || theme.primary }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon as any} size={24} color="#ffffff" />
    </TouchableOpacity>
  );
}

const fabStyles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});