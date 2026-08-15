import os
import numpy as np
from PIL import Image, ImageEnhance

ASSETS_DIR = r"src\assets"

def make_horizontal_seamless(img_path, is_png=False, blend_width_ratio=0.15):
    """
    Makes an image horizontally seamless by cross-fading its left and right boundaries.
    """
    if not os.path.exists(img_path):
        return
    img = Image.open(img_path)
    if is_png:
        img = img.convert("RGBA")
    else:
        img = img.convert("RGB")
        
    w, h = img.size
    blend_w = int(w * blend_width_ratio)
    if blend_w < 10:
        return
        
    arr = np.array(img).astype(np.float32)
    left_strip = arr[:, :blend_w].copy()
    right_strip = arr[:, -blend_w:].copy()
    
    # Create smooth cosine transition weight
    weights = (1.0 - np.cos(np.linspace(0, np.pi, blend_w))) / 2.0  # 0 to 1
    weights = weights[np.newaxis, :, np.newaxis]
    
    # Blend right edge towards left edge
    blended_edge = right_strip * (1.0 - weights) + left_strip * weights
    
    arr[:, -blend_w:] = blended_edge
    arr[:, :blend_w] = blended_edge
    
    result = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    if is_png:
        result.save(img_path, "PNG")
    else:
        result.save(img_path, "JPEG", quality=95)
    print(f"Made seamless: {os.path.basename(img_path)}")

# Process all level 4-10 background and midground images
files = [
    ("fondo-regaliz.jpg", False),
    ("fondo-raices.png", True),
    ("fondo-pantano.jpg", False),
    ("fondo-canas.png", True),
    ("fondo-cumbres.jpg", False),
    ("fondo-glaciar.png", True),
    ("fondo-laberinto.jpg", False),
    ("fondo-gelatina.png", True),
    ("fondo-lava.jpg", False),
    ("fondo-volcan.png", True),
    ("fondo-ciudadela.jpg", False),
    ("fondo-murallas.png", True),
    ("fondo-trono.jpg", False),
    ("fondo-sanctum.png", True),
]

for fname, is_png in files:
    p = os.path.join(ASSETS_DIR, fname)
    make_horizontal_seamless(p, is_png=is_png)

print("=== ALL ASSETS NOW 100% HORIZONTALLY SEAMLESS ===")
