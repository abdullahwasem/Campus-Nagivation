import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  SafeAreaView, 
  Image, 
  StyleSheet, 
  View, 
  Text,
  StatusBar,
  Animated,
  ActivityIndicator
} from 'react-native';
import { CameraCapturedPicture } from 'expo-camera';
import { MaterialIcons, Ionicons, AntDesign, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface PhotoPreviewProps {
  photo: CameraCapturedPicture;
  handleRetakePhoto: () => void;
  handleGoForward: () => void;
}

const PhotoPreviewSection: React.FC<PhotoPreviewProps> = ({
  photo,
  handleRetakePhoto,
  handleGoForward,
}) => {
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const toggleControls = () => {
    setShowControls(!showControls);
  };
  
  const handleAnalyze = () => {
    setLoading(true);
    // Simulate loading then call the actual handler
    setTimeout(() => {
      handleGoForward();
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Full-screen image */}
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={toggleControls} 
        style={styles.imageContainer}
      >
        <Image
          style={styles.previewImage}
          source={{ uri: photo?.uri }}
          onError={() => setImageError(true)}
        />
        
        {imageError && (
          <View style={styles.errorContainer}>
            <FontAwesome5 name="exclamation-triangle" size={40} color="#FF6B6B" />
            <Text style={styles.errorText}>Error loading image</Text>
          </View>
        )}
      </TouchableOpacity>
      
      {/* Controls overlay */}
      {showControls && (
        <>
          {/* Top bar */}
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent']}
            style={styles.topBar}
          >
            <View style={styles.topBarContent}>
              <TouchableOpacity onPress={handleRetakePhoto}>
                <Ionicons name="arrow-back" size={28} color="white" />
              </TouchableOpacity>
              <Text style={styles.titleText}>Preview</Text>
              <TouchableOpacity>
                <MaterialIcons name="more-vert" size={28} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
          
          {/* Bottom bar */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.bottomBar}
          >
            <View style={styles.hintContainer}>
              <MaterialIcons name="info-outline" size={18} color="#FFC107" />
              <Text style={styles.hintText}>
                Tap the image to hide controls
              </Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={handleRetakePhoto}
              >
                <View style={styles.deleteButtonInner}>
                  <MaterialIcons name="delete" size={28} color="white" />
                </View>
                <Text style={styles.buttonLabel}>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.analyzeButton} 
                onPress={handleAnalyze}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <View style={styles.analyzeButtonInner}>
                      <AntDesign name="check" size={32} color="white" />
                    </View>
                    <Text style={styles.buttonLabel}>Analyze</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.editButton}>
                <View style={styles.editButtonInner}>
                  <MaterialIcons name="edit" size={28} color="white" />
                </View>
                <Text style={styles.buttonLabel}>Edit</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </>
      )}
      
      {/* Image info overlay */}
      {showControls && (
        <View style={styles.imageInfoContainer}>
          <View style={styles.imageInfoBadge}>
            <MaterialIcons name="photo-camera" size={14} color="white" />
            <Text style={styles.imageInfoText}>Building Photo</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    paddingTop: 45,
  },
  topBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titleText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 30,
    paddingTop: 30,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  hintText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  deleteButton: {
    alignItems: 'center',
  },
  deleteButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzeButton: {
    alignItems: 'center',
  },
  analyzeButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#5E60CE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  editButton: {
    alignItems: 'center',
  },
  editButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLabel: {
    color: 'white',
    marginTop: 8,
    fontSize: 12,
  },
  imageInfoContainer: {
    position: 'absolute',
    top: 100,
    right: 20,
  },
  imageInfoBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
  },
  imageInfoText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 12,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
});

export default PhotoPreviewSection;