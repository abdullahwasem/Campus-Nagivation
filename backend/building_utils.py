# backend/building_utils.py

import cv2
import numpy as np

# === CONFIGURATION ===
FOCAL_LENGTH_MM   = 6.86
SENSOR_HEIGHT_MM  = 5.6
CAMERA_HEIGHT_M   = 1.6

building_heights = {
    "Block E": 6.0,
    "Block C": 7.5,
    "Block A": 9.0,
    "Block D": 7.5,
    "Block F": 13.5,
    "Block B": 6.0
}

building_coordinates = {
    "Block A": {"lat": 31.48222964940498, "lng": 74.3035499304804},
    "Block B": {"lat": 31.481067391919904, "lng": 74.3030048329072},
    "Block C": {"lat": 31.481178398975324, "lng": 74.30288072461302},
    "Block D": {"lat": 31.48107824241253, "lng": 74.30332310850635},
    "Block E": {"lat": 31.481559857421292, "lng": 74.30378519760922},
    "Block F": {"lat": 31.4805443557776, "lng": 74.30417136303642},
}

idx_to_label  = ["Block E", "Block C", "Block A", "Block D", "Block F", "Block B"]

# --- Object size comparison distance estimation ---
def compute_distance_object_size(object_height_px, real_object_height_m, img_height_px, focal_length_mm, sensor_height_mm):
    f_px = (focal_length_mm / sensor_height_mm) * img_height_px
    distance = (real_object_height_m * f_px) / object_height_px
    return distance

# --- Detect reference object (e.g., door) ---
def detect_reference_object(img):
    # For demo: use the tallest contour at the bottom of the image as the reference object
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 25))
    closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    h_img = img.shape[0]
    valid_contours = []
    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        if h > 0.2 * h_img and y + h >= 0.9 * h_img:
            valid_contours.append((x, y, w, h))
    if not valid_contours and contours:
        valid_contours = [max([cv2.boundingRect(c) for c in contours], key=lambda t: t[3])]
    if valid_contours:
        # Return the tallest reference object
        return max(valid_contours, key=lambda t: t[3])  # x, y, w, h
    else:
        return None

def process_image(img, model):
    img_resized = cv2.resize(img, (224, 224))
    img_input = np.expand_dims(img_resized / 255.0, axis=0)
    preds = model.predict(img_input, verbose=0)
    predicted_idx = np.argmax(preds[0])
    confidence = float(preds[0][predicted_idx])
    building_name = idx_to_label[predicted_idx]
    coords = building_coordinates.get(building_name, {"lat": 0.0, "lng": 0.0})

    # --- Use object size comparison for distance estimation ---
    ref = detect_reference_object(img)
    if ref:
        x, y, w, h = ref
        # Assume reference object is a door of 2.0 meters height
        real_object_height_m = 2.0
        distance = compute_distance_object_size(
            object_height_px=h,
            real_object_height_m=real_object_height_m,
            img_height_px=img.shape[0],
            focal_length_mm=FOCAL_LENGTH_MM,
            sensor_height_mm=SENSOR_HEIGHT_MM
        )
    else:
        distance = None

    return {
        "building": building_name,
        "confidence": confidence,
        "distance": distance,
        "coordinates": coords
    }