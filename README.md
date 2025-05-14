# Campus-Nagivation
Campus Navigation System
A cross-platform campus navigation app that uses image-based building recognition and distance estimation. The backend uses deep learning and computer vision to detect university blocks and estimate the distance from the user to the building using object size comparison. The frontend displays the detected building and distance on a map.
Features
Upload or capture a photo of a campus building.
Backend detects the building and estimates distance using object size comparison (no GPS required).
Frontend displays the detected block and distance on a map, with clear UI.
Modern, minimal UI with only essential navigation.
Directory Structure
Apply to CameraScreen...
md
Backend Setup
Install Python 3.8+ and pip.
Create and activate a virtual environment:
Apply to CameraScreen...
activate
Install dependencies:
Apply to CameraScreen...
txt
Place your trained model at:
Apply to CameraScreen...
h5
Run the backend server:
Apply to CameraScreen...
py
If port 5001 is in use, change the port in app.py to 5002.
Frontend Setup
Install Node.js and npm.
Install dependencies:
Apply to CameraScreen...
install
Start the Expo development server:
Apply to CameraScreen...
start
Scan the QR code with Expo Go (iOS/Android) or run in a simulator.
API Usage
Endpoint
Apply to CameraScreen...
recognize_landmark
(Change port if needed)
Request
multipart/form-data
Key: image
Value: (image file)
Response
Apply to CameraScreen...
}
How Distance is Calculated
The backend uses object size comparison:
Detects a reference object (e.g., door) in the image.
Uses its pixel height and known real-world height to estimate distance.
No GPS or phone location is used for this calculation.
Troubleshooting
Port already in use:
Change the port in backend/app.py or free up the port.
Model not loaded:
Ensure best_model.h5 is in backend/model/ and is a valid Keras model.
Frontend pin overlaps building:
The frontend enforces a minimum display distance for visibility.
API returns error:
Check backend logs for details.
Customization
Reference object:
Update building_utils.py to detect a specific object (e.g., signboard, door) for more accurate distance.
Map pin direction:
Change the bearing in MapView.tsx to place the user pin in a different direction from the building.
Contributors
[Your Name]
[Collaborators]
