import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

// Define navigation types
type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Map: {
    building?: string;
    distance?: number;
  };
  Info: undefined;
};

type NavigationProp = {
  navigate: (screen: keyof RootStackParamList, params?: any) => void;
};

type HomeScreenProps = {
  navigation: NavigationProp;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Campus Navigator</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#5B37B7" />
        </TouchableOpacity>
      </View>
      
      {/* Main content */}
      <View style={styles.content}>
      <View style={styles.imageContainer}>
  <Ionicons name="map" size={120} color="#5B37B7" />
</View>
        <Text style={styles.title}>Welcome to Campus Navigation</Text>
        <Text style={styles.subtitle}>
          Take a photo of any building on campus to get directions and information
        </Text>
        
        {/* Action buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Camera')}
          >
            <MaterialIcons name="photo-camera" size={32} color="white" />
            <Text style={styles.buttonText}>Capture Building</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('Map')}
          >
            <MaterialIcons name="explore" size={32} color="white" />
            <Text style={styles.buttonText}>Explore Map</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity style={styles.navTab}>
          <Ionicons name="home" size={24} color="#5B37B7" />
          <Text style={styles.activeTabText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navTab}
          onPress={() => navigation.navigate('Camera')}
        >
          <Ionicons name="camera-outline" size={24} color="#9E9E9E" />
          <Text style={styles.tabText}>Camera</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navTab}
          onPress={() => navigation.navigate('Map')}
        >
          <Ionicons name="map-outline" size={24} color="#9E9E9E" />
          <Text style={styles.tabText}>Map</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navTab}
          onPress={() => navigation.navigate('Info')}
        >
          <Ionicons name="information-circle-outline" size={24} color="#9E9E9E" />
          <Text style={styles.tabText}>Info</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5B37B7',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  actionContainer: {
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#5B37B7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  secondaryButton: {
    backgroundColor: '#7B5FC7',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 12,
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  activeTabText: {
    color: '#5B37B7',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  tabText: {
    color: '#9E9E9E',
    fontSize: 12,
    marginTop: 4,
  },
  imageContainer: {
    width: 200,
    height: 200,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F8',
    borderRadius: 100,
  },
});

export default HomeScreen;
