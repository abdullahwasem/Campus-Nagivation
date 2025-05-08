import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Camera, CameraType, CameraView } from 'expo-camera';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import MapView from '../../components/MapView';
import PhotoPreview from '../../components/PhotoPreview';

type BuildingName = 'Building A' | 'Building B' | 'Building C' | 'Building D' | 'Building E'| 'Building F';

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState<CameraType>('back');
  const [photoUri, setPhotoUri] = useState<any>(null);
  const [isPreview, setIsPreview] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const [mapData, setMapData] = useState<{ building: string | null; distance: number | null }>({
    building: null,
    distance: null,
  });
  const [flashMode, setFlashMode] = useState('off');

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <MaterialIcons name="camera" size={80} color="#5B37B7" />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <MaterialIcons name="no-photography" size={80} color="#E53935" />
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Function to pick image from gallery
  const handleUploadImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      if (result.assets && result.assets.length > 0) {
        const uploadedImage = {
          uri: result.assets[0].uri,
          base: result.assets[0].base64,
        };
        setPhotoUri(uploadedImage);
        setIsPreview(true);
      } else {
        console.log('No image selected or result.assets is empty');
      }
    }
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      const options = {
        quality: 1,
        base64: true,
        exif: false,
      };
      try {
        const photo = await cameraRef.current.takePictureAsync(options);
        if (photo.uri) {
          setPhotoUri(photo);
          setIsPreview(true);
        } else {
          console.log('No valid URI found in photo data.');
        }
      } catch (error) {
        console.error('Error capturing photo:', error);
      }
    }
  };

  const toggleCameraType = () => {
    setType(type === 'back' ? 'front' : 'back');
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === 'off' ? 'on' : 'off');
  };

  const handleRetake = () => {
    setIsPreview(false);
    setPhotoUri(null);
  };

  // Interface for response from backend
  interface LandmarkRecognitionResponse {
    building: string;
    confidence: number;
  }

  // Type guard to check if building name is valid
  const isBuildingName = (building: string): building is BuildingName => {
    return ['Building A', 'Building B', 'Building C', 'Building D', 'Building E'].includes(building);
  };

  const handleGoForward = async () => {
    if (photoUri) {
      try {
        const formData = new FormData();
        const fileInfo = await FileSystem.getInfoAsync(photoUri.uri);
        console.log('File info:', fileInfo);

        const fileObject = {
          uri: photoUri.uri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        };

        formData.append('image', fileObject as any);
        const backendUrl = 'http://172.20.10.2:5001/recognize_landmark';

        const responseFromBackend = await axios.post<LandmarkRecognitionResponse>(backendUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          },
          timeout: 10000,
        });

        console.log('Response received:', responseFromBackend.status);
        console.log('Response data:', responseFromBackend.data);

        if (responseFromBackend && responseFromBackend.data) {
          const { building, confidence } = responseFromBackend.data;

          // Type assertion to BuildingName
          const dynamicData = {
            building: building as BuildingName,
            distance: confidence,
          };

          setMapData(dynamicData);

          console.log('Recognition result:', building, confidence);
        } else {
          console.error('No valid response received from backend');
          alert('Error processing the image, no valid response');
        }
      } catch (error: any) {
        console.error('Error sending image to backend:', error);
        console.error('Error details:', error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
        alert(`Error processing the image: ${error.message}`);
      }
    } else {
      alert('No photo available');
    }
  };

  if (photoUri) {
    return (
      <PhotoPreview
        photo={photoUri}
        handleRetakePhoto={handleRetake}
        handleGoForward={handleGoForward}
      />
    );
  }

  if (mapData.building && mapData.distance !== null) {
    return <MapView building={mapData.building} distance={mapData.distance} />;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identify Building</Text>
        <TouchableOpacity onPress={toggleFlash}>
          <Ionicons 
            name={flashMode === 'on' ? 'flash' : 'flash-off'} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
      
      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={type} ref={cameraRef}>
          {/* Overlay */}
          <View style={styles.overlay}>
            <View style={styles.targetFrame} />
          </View>
          
          {/* Info Tip */}
          <View style={styles.tipContainer}>
            <View style={styles.tipBubble}>
              <Text style={styles.tipText}>Point camera at a building to identify</Text>
            </View>
          </View>
        </CameraView>
      </View>
      
      {/* Bottom Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={handleUploadImage}>
          <Ionicons name="images" size={28} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
          <View style={styles.captureInner} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
          <Ionicons name="camera-reverse" size={28} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerTab}>
          <Ionicons name="home-outline" size={24} color="#BCBCBC" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerTab}>
          <Ionicons name="camera" size={24} color="#5B37B7" />
          <Text style={styles.activeTabText}>Camera</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerTab}>
          <Ionicons name="map-outline" size={24} color="#BCBCBC" />
          <Text style={styles.tabText}>Map</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerTab}>
          <Ionicons name="information-circle-outline" size={24} color="#BCBCBC" />
          <Text style={styles.tabText}>Info</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8FA',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#5B37B7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 20,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#5B37B7',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tipContainer: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
    alignItems: 'center',
  },
  tipBubble: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  tipText: {
    color: 'white',
    fontSize: 14,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  controlButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#5B37B7',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  footerTab: {
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
    color: '#BCBCBC',
    fontSize: 12,
    marginTop: 4,
  },
});

export default CameraScreen;