import os
import cv2
import numpy as np
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf  # For the model
from werkzeug.utils import secure_filename
import traceback

app = Flask(__name__)

# Set up logging with more details
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Enable CORS for cross-origin requests (needed for mobile apps)
CORS(app, supports_credentials=True, origins=["http://localhost:19006", "http://172.20.10.2:19006", "exp://172.20.10.2:19000"])

# Create a directory for temporary file storage if it doesn't exist
UPLOAD_FOLDER = 'temp_uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load your pre-trained model (adjust the path as needed)
try:
    model_path = '/Users/abdullah/CampusNavigation/backend/model/best_model.h5'
    if os.path.exists(model_path):
        model = tf.keras.models.load_model(model_path)
        logger.info(f"Model loaded successfully from {model_path}")
    else:
        logger.critical(f"Model file not found at {model_path}")
        model = None  # We'll handle this case in the endpoint
except Exception as e:
    logger.critical(f"Failed to load model: {str(e)}")
    logger.critical(traceback.format_exc())
    model = None  # We'll handle this case in the endpoint

# Helper function for landmark recognition
def recognize_landmark(image):
    try:
        # Check if model is loaded
        if model is None:
            logger.error("Model not loaded. Cannot perform recognition.")
            return "Unknown", 0.0
            
        # Ensure image is in correct format (RGB)
        if len(image.shape) == 2:  # Grayscale
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
        elif image.shape[2] == 4:  # RGBA
            image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)
            
        # Log image properties for debugging
        logger.debug(f"Image shape before preprocessing: {image.shape}")
        
        # Preprocess the image for the model
        img = cv2.resize(image, (224, 224))  # Resize to the model's input size
        logger.debug(f"Image shape after resize: {img.shape}")
        
        img = img.astype('float32') / 255.0  # Normalize the image
        img = np.expand_dims(img, axis=0)  # Add batch dimension
        
        logger.debug(f"Image shape after preprocessing: {img.shape}")
        
        # Make prediction
        predictions = model.predict(img)
        logger.debug(f"Raw predictions: {predictions}")
        
        # Get the predicted building name
        building_index = np.argmax(predictions)  # Get the index with highest probability
        confidence = float(predictions[0][building_index])  # Convert to native Python float
        building_name = get_building_name(building_index)
        
        logger.info(f"Recognized building: {building_name} with confidence: {confidence}")
        return building_name, confidence
    except Exception as e:
        logger.error(f"Error in recognize_landmark: {str(e)}")
        logger.error(traceback.format_exc())
        return "Error", 0.0

# Helper function to map index to building name (adjust based on your model)
def get_building_name(index):
    buildings = ['Building A', 'Building B', 'Building C', 'Building D', 'Building E']  # Example building names
    if 0 <= index < len(buildings):
        return buildings[index]
    return "Unknown Building"

@app.route('/recognize_landmark', methods=['POST'])
def recognize_landmark_endpoint():
    logger.info("Received request to recognize landmark.")
    
    # Check if model is loaded
    if model is None:
        return jsonify({'error': 'Model not loaded. Please check server logs.'}), 500
    
    try:
        # Get image from the request
        if 'image' not in request.files:
            logger.warning("No image file in request")
            return jsonify({'error': 'No image file found in request'}), 400
            
        file = request.files['image']
        
        if file.filename == '':
            logger.warning("Empty filename")
            return jsonify({'error': 'No selected file'}), 400
            
        # Log request information
        logger.info(f"Received file: {file.filename}")
        
        # Save the file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        logger.info(f"Saved file to {filepath}")
        
        # Read the image with OpenCV
        img = cv2.imread(filepath)
        
        if img is None:
            logger.error(f"Failed to read image from {filepath}")
            return jsonify({'error': 'Failed to read image file'}), 500
            
        logger.debug(f"Image shape: {img.shape}, Image dtype: {img.dtype}")
        
        # Perform landmark recognition
        building_name, confidence = recognize_landmark(img)
        
        # Clean up - remove the temporary file
        try:
            os.remove(filepath)
            logger.debug(f"Removed temporary file: {filepath}")
        except Exception as e:
            logger.warning(f"Failed to remove temporary file: {str(e)}")
        
        # Return the result
        return jsonify({
            'building': building_name, 
            'confidence': confidence
        })
        
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# Distance estimation endpoint (example: simple proportionality)
@app.route('/estimate_distance', methods=['POST'])
def estimate_distance():
    data = request.get_json()  # Get data from the request (e.g., reference size, object size)
    if 'reference_size' in data and 'object_size' in data:
        reference_size = data['reference_size']
        object_size = data['object_size']
        
        # Example distance estimation (simplified)
        distance_estimate = (reference_size * object_size)
        
        return jsonify({'estimated_distance': distance_estimate})
    
    return jsonify({'error': 'Invalid data for distance estimation'}), 400

# Add a simple health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'model_loaded': model is not None})

if __name__ == '__main__':
    logger.info("Starting Flask server on port 5001")
    app.run(host='0.0.0.0', port=5001, debug=True)