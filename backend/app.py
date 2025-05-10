# backend/app.py

import os
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import Layer
from building_utils import process_image

class Cast(Layer):
    def call(self, inp):
        return tf.cast(inp, tf.float32)

app = Flask(__name__)
CORS(app)

# Load model once
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'best_model.h5')
model = load_model(MODEL_PATH, custom_objects={"Cast": Cast})

@app.route('/recognize_landmark', methods=['POST'])
def recognize_landmark():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    file = request.files['image']
    file_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    if img is None:
        return jsonify({'error': 'Invalid image'}), 400
    result = process_image(img, model)
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)