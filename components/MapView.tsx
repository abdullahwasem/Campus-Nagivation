import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import MapView from 'react-native-maps';
import { Marker, Callout } from 'react-native-maps';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Define the valid keys for the buildings
type BuildingName = 'Building A' | 'Building B' | 'Building C' | 'Building D' | 'Building E'| 'Building F';

// Define MapView component that will accept `building` and `distance` as props
interface MapViewProps {
  building: string;  // Accepting string and we will handle the validation internally
  distance: number;
  navigation?: any;
}

const MapViewComponent: React.FC<MapViewProps> = ({ building, distance, navigation }) => {
  // Type guard function to check if building is a valid BuildingName
  const isBuildingName = (building: string): building is BuildingName => {
    return ['Building A', 'Building B', 'Building C', 'Building D', 'Building E', 'Building F'].includes(building);
  };

  // Building data with coordinates and additional info
  const buildingData: Record<BuildingName, { 
    latitude: number; 
    longitude: number;
    info?: string;
    floors?: number;
    facilities?: string[];
  }> = {
    'Building A': { 
      latitude: 31.48222964940498, 
      longitude: 74.3035499304804,
      info: 'Main Academic Building',
      floors: 4,
      facilities: ['Labs', 'Classrooms', 'Faculty Offices']
    },
    'Building B': { 
      latitude: 31.481067391919904, 
      longitude: 74.3030048329072,
      info: 'Engineering Department',
      floors: 3,
      facilities: ['Computer Labs', 'Lecture Halls', 'Study Areas']
    },
    'Building C': { 
      latitude: 31.481178398975324, 
      longitude: 74.30288072461302,
      info: 'Science Complex',
      floors: 5,
      facilities: ['Research Labs', 'Conference Rooms', 'Library']
    },
    'Building D': { 
      latitude: 31.48107824241253, 
      longitude: 74.30332310850635,
      info: 'Student Center',
      floors: 2,
      facilities: ['Cafeteria', 'Study Areas', 'Student Services']
    },
    'Building E': { 
      latitude: 31.481559857421292, 
      longitude: 74.30378519760922,
      info: 'Administration Block',
      floors: 3,
      facilities: ['Offices', 'Meeting Rooms', 'Auditorium']
    },
    'Building F': { 
      latitude: 31.4805443557776, 
      longitude: 74.30417136303642,
      info: 'Sports Complex',
      floors: 2,
      facilities: ['Gym', 'Swimming Pool', 'Courts']
    },
  };

  // Set default coordinates for when the building is not found or valid
  const defaultCoordinates = { latitude: 31.48122964940498, longitude: 74.3032499304804 };
  
  const [region, setRegion] = useState({
    latitude: defaultCoordinates.latitude,
    longitude: defaultCoordinates.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    if (isBuildingName(building)) {
      setRegion({
        latitude: buildingData[building].latitude,
        longitude: buildingData[building].longitude,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      });
      setSelectedBuilding(building);
    }
  }, [building]);

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  const getConfidenceColor = () => {
    if (distance > 0.8) return '#4CAF50'; // High confidence - green
    if (distance > 0.5) return '#FFC107'; // Medium confidence - yellow
    return '#F44336'; // Low confidence - red
  };

  const getConfidenceText = () => {
    if (distance > 0.8) return 'High';
    if (distance > 0.5) return 'Medium';
    return 'Low';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Map View */}
      <MapView 
        style={styles.map} 
        region={region}
        showsUserLocation={true}
        showsCompass={true}
        showsBuildings={true}
        mapType="standard"
      >
        {Object.entries(buildingData).map(([buildingName, data], index) => (
          <Marker
            key={index}
            coordinate={{ latitude: data.latitude, longitude: data.longitude }}
            title={buildingName}
            description={data.info}
            pinColor={buildingName === building ? "#5E60CE" : "gray"}
          >
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{buildingName}</Text>
                <Text style={styles.calloutInfo}>{data.info}</Text>
                <Text style={styles.calloutDetail}>Floors: {data.floors}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.navbarTitle}>Campus Map</Text>
        <TouchableOpacity style={styles.infoButton} onPress={toggleInfo}>
          <MaterialIcons name={showInfo ? "info" : "info-outline"} size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Building Info Card */}
      {showInfo && isBuildingName(building) && (
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View>
              <Text style={styles.buildingTitle}>{building}</Text>
              <Text style={styles.buildingInfo}>{buildingData[building].info}</Text>
            </View>
            <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor() }]}>
              <Text style={styles.confidenceText}>{getConfidenceText()} Confidence</Text>
              <Text style={styles.confidenceValue}>{(distance * 100).toFixed(0)}%</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.facilityContainer}>
            <Text style={styles.facilityTitle}>Facilities:</Text>
            <View style={styles.facilitiesList}>
              {buildingData[building].facilities?.map((facility, index) => (
                <View key={index} style={styles.facilityItem}>
                  <FontAwesome5 
                    name={
                      facility.includes('Lab') ? 'flask' : 
                      facility.includes('Class') ? 'chalkboard-teacher' :
                      facility.includes('Office') ? 'briefcase' :
                      facility.includes('Study') ? 'book-reader' :
                      facility.includes('Cafe') ? 'coffee' :
                      facility.includes('Gym') ? 'dumbbell' :
                      facility.includes('Pool') ? 'swimming-pool' :
                      facility.includes('Court') ? 'basketball-ball' :
                      facility.includes('Library') ? 'book' :
                      facility.includes('Conference') ? 'users' :
                      facility.includes('Meeting') ? 'handshake' :
                      facility.includes('Auditorium') ? 'theater-masks' :
                      'building'
                    } 
                    size={16} 
                    color="#5E60CE" 
                  />
                  <Text style={styles.facilityText}>{facility}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.directionButton}>
              <MaterialIcons name="directions" size={20} color="white" />
              <Text style={styles.buttonText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoButton2}>
              <MaterialIcons name="info-outline" size={20} color="white" />
              <Text style={styles.buttonText}>More Info</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.mapControl}>
          <MaterialIcons name="layers" size={22} color="#5E60CE" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapControl}>
          <MaterialIcons name="my-location" size={22} color="#5E60CE" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapControl}>
          <MaterialIcons name="zoom-out-map" size={22} color="#5E60CE" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  navbar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(94, 96, 206, 0.9)',
    borderRadius: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  navbarTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoButton: {
    padding: 8,
  },
  infoCard: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  buildingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  buildingInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: 'center',
  },
  confidenceText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  confidenceValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },
  facilityContainer: {
    marginBottom: 15,
  },
  facilityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  facilitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  facilityText: {
    marginLeft: 5,
    color: '#333',
    fontSize: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  directionButton: {
    backgroundColor: '#5E60CE',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
  },
  infoButton2: {
    backgroundColor: '#6D6875',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  mapControls: {
    position: 'absolute',
    right: 15,
    top: 130,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapControl: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  calloutContainer: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  calloutInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  calloutDetail: {
    fontSize: 12,
    color: '#5E60CE',
  },});

  export default MapViewComponent;;
