import os
import math
import numpy as np
from PIL import Image

uploaded_dir = r'C:\Users\Gerugo\.gemini\antigravity\brain\71e872d8-0aba-4525-9624-4624fc427510\.user_uploaded'
dest_dir = r'c:\Users\Gerugo\Desktop\Documentos personales\lollipop-slug\src\assets'

mapping = {
    'media_1786813262435.jpg': ('fondo-ciudadela.jpg', 'JPEG'),
    'media_1786813262431.jpg': ('fondo-murallas.png', 'PNG'),
    'media_1786813262426.jpg': ('fondo-trono.jpg', 'JPEG'),
    'media_1786813262445.jpg': ('fondo-sanctum.png', 'PNG'),
}

def make_seamless_horizontal(img_pil, blend_width=140):
    arr = np.array(img_pil).astype(np.float32)
    h, w = arr.shape[:2]
    
    left_strip = arr[:, :blend_width].copy()
    right_strip = arr[:, -blend_width:].copy()
    
    t = np.linspace(0, 1, blend_width)
    weight = (1.0 - np.cos(t * math.pi)) * 0.5
    
    if len(arr.shape) == 3:
        weight = weight.reshape(1, blend_width, 1)
    else:
        weight = weight.reshape(1, blend_width)
        
    blended = left_strip * (1.0 - weight) + right_strip * weight
    arr[:, :blend_width] = blended
    arr[:, -blend_width:] = blended
    
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

for src_name, (dest_name, fmt) in mapping.items():
    src_path = os.path.join(uploaded_dir, src_name)
    dest_path = os.path.join(dest_dir, dest_name)
    
    img = Image.open(src_path).convert('RGB')
    seamless_img = make_seamless_horizontal(img, blend_width=140)
    
    if fmt == 'JPEG':
        seamless_img.save(dest_path, 'JPEG', quality=95)
    else:
        seamless_img.save(dest_path, 'PNG')
        
    print(f"Processed & saved: {dest_name} ({seamless_img.size})")

print("LEVEL 9 AND LEVEL 10 BACKGROUNDS INSTALLED PERFECTLY!")
