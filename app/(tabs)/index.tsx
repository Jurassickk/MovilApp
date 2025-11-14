import { Image } from 'expo-image';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: theme.background }}
      headerImage={
        <Image
          source={require('@/assets/images/white-complete-logo.svg')}
          style={styles.logoImage}
          contentFit="contain"
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ color: theme.text }}>
          Welcome to UrbanTracker
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.featureContainer}>
        <ThemedText type="subtitle" style={{ color: theme.text }}>
          Urban Mapping & Tracking
        </ThemedText>
        <ThemedText style={{ color: theme.text }}>
          Explore the city with our comprehensive mapping solution. Track urban features, public transport, and points of interest with real-time data.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="map" size={24} color={theme.primary} />
          <ThemedText type="title" style={{ color: theme.text }}>500+</ThemedText>
          <ThemedText style={{ color: theme.text }}>Urban Features</ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="bus" size={24} color={theme.secondary} />
          <ThemedText type="title" style={{ color: theme.text }}>50+</ThemedText>
          <ThemedText style={{ color: theme.text }}>Transport Routes</ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="location" size={24} color={theme.accent} />
          <ThemedText type="title" style={{ color: theme.text }}>1000+</ThemedText>
          <ThemedText style={{ color: theme.text }}>Points of Interest</ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.featuresContainer}>
        <ThemedText type="subtitle" style={{ color: theme.text }}>
          Key Features
        </ThemedText>

        <View style={[styles.featureCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.featureHeader}>
            <Ionicons name="search" size={20} color={theme.primary} />
            <ThemedText style={{ color: theme.text, fontWeight: '600' }}>Smart Search</ThemedText>
          </View>
          <ThemedText style={{ color: theme.text }}>
            Find any location, business, or urban feature with our intelligent search system.
          </ThemedText>
        </View>

        <View style={[styles.featureCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.featureHeader}>
            <Ionicons name="navigate" size={20} color={theme.secondary} />
            <ThemedText style={{ color: theme.text, fontWeight: '600' }}>Real-time Directions</ThemedText>
          </View>
          <ThemedText style={{ color: theme.text }}>
            Get turn-by-turn navigation with live traffic updates and alternative routes.
          </ThemedText>
        </View>

        <View style={[styles.featureCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.featureHeader}>
            <Ionicons name="notifications" size={20} color={theme.accent} />
            <ThemedText style={{ color: theme.text, fontWeight: '600' }}>Live Updates</ThemedText>
          </View>
          <ThemedText style={{ color: theme.text }}>
            Stay informed with real-time updates on public transport, events, and urban changes.
          </ThemedText>
        </View>
      </ThemedView>

      <TouchableOpacity
        style={[styles.getStartedButton, { backgroundColor: theme.primary }]}
        onPress={() => {
          // Navigation to map would be handled by router
        }}
      >
        <ThemedText style={{ color: '#ffffff', fontWeight: '600', fontSize: 16 }}>
          Explore the Map
        </ThemedText>
        <Ionicons name="arrow-forward" size={20} color="#ffffff" />
      </TouchableOpacity>

      <ThemedView style={styles.footerContainer}>
        <ThemedText style={{ color: theme.icon, fontSize: 12 }}>
          Powered by Mapbox • Built for Urban Exploration
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  logoImage: {
    height: 100,
    width: 300,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  featureContainer: {
    gap: 8,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    gap: 8,
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 24,
  },
  featureCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  getStartedButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
    marginBottom: 24,
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});
