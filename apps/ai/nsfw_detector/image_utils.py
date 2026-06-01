import logging
from io import BytesIO
import numpy as np

from PIL import Image as pil_image

if pil_image is not None:
    _PIL_INTERPOLATION_METHODS = {
        "nearest": pil_image.NEAREST,
        "bilinear": pil_image.BILINEAR,
        "bicubic": pil_image.BICUBIC,
    }
    # These methods were only introduced in version 3.4.0 (2016).
    if hasattr(pil_image, "HAMMING"):
        _PIL_INTERPOLATION_METHODS["hamming"] = pil_image.HAMMING
    if hasattr(pil_image, "BOX"):
        _PIL_INTERPOLATION_METHODS["box"] = pil_image.BOX
    # This method is new in version 1.1.3 (2013).
    if hasattr(pil_image, "LANCZOS"):
        _PIL_INTERPOLATION_METHODS["lanczos"] = pil_image.LANCZOS



# loads an image and performs the transformations 
def load_image(path,image_size=240, dtype="float32"):
    img = pil_image.open(path).convert("RGB")  # Fix RGBA→RGB
    return transform_image(img, image_size, dtype)

def load_image_bytes(image_bytes, image_size=240, dtype="float32"):
    img = pil_image.open(BytesIO(image_bytes)).convert("RGB")
    return transform_image(img, image_size, dtype)

def transform_image(img, image_size=240, dtype="float32"):
    img = img.resize((image_size, image_size))
    
    x = np.asarray(img, dtype=dtype)
    x = x.transpose(2, 0, 1)  # CHW format
    x /= 255.0

    mean = np.array([0.485, 0.456, 0.406], dtype=dtype).reshape(3, 1, 1)
    std  = np.array([0.229, 0.224, 0.225], dtype=dtype).reshape(3, 1, 1)

    x = (x - mean) / std
    return x

def load_images(image_paths, image_size, image_names):
    """
    Function for loading images into numpy arrays for passing to model.predict
    inputs:
        image_paths: list of image paths to load
        image_size: size into which images should be resized
    
    outputs:
        loaded_images: loaded images on which keras model can run predictions
        loaded_image_indexes: paths of images which the function is able to process
    
    """
    loaded_images = []
    loaded_image_paths = []

    for i, img_path in enumerate(image_paths):
        try:
            image = load_image(img_path)
            loaded_images.append(image)
            loaded_image_paths.append(image_names[i])
        except Exception as ex:
            logging.exception(f"Error reading {img_path} {ex}", exc_info=True)

    return np.asarray(loaded_images), loaded_image_paths
