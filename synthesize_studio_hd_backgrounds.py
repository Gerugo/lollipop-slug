import os
import shutil
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

ASSETS_DIR = r"src\assets"
ART_DIR = r"C:\Users\Gerugo\.gemini\antigravity\brain\71e872d8-0aba-4525-9624-4624fc427510"

# 1. Restore Level 5 Pantano from high-res Gemini art
src_pantano = os.path.join(ART_DIR, "fondo_pantano_1786806145583.jpg")
dst_pantano = os.path.join(ASSETS_DIR, "fondo-pantano.jpg")
if os.path.exists(src_pantano):
    shutil.copy(src_pantano, dst_pantano)
    print("Restored original high-res Gemini fondo-pantano.jpg")

# 2. Extract clean transparent midground for Level 5 (fondo-canas.png)
im_pant = Image.open(dst_pantano).convert("RGBA")
w, h = im_pant.size
# Crop lower 70% and make soft alpha gradient
mid_canas = im_pant.crop((0, int(h * 0.25), w, h))
mid_canas = mid_canas.resize((1376, 768), Image.Resampling.LANCZOS)
# Alpha mask that fades in from top
alpha = Image.new("L", (1376, 768), 0)
for y in range(768):
    a = int(255 * min(1.0, max(0.0, (y - 120) / 200.0)))
    for x in range(1376):
        alpha.putpixel((x, y), a)
mid_canas.putalpha(alpha)
mid_canas.save(os.path.join(ASSETS_DIR, "fondo-canas.png"), "PNG")
print("Synthesized 3D painterly fondo-canas.png")

# Helper to transform a high-res painterly background with color mapping & atmosphere
def create_painterly_level_bg(base_name, tint_color, contrast=1.2, brightness=1.0, add_mist=True, mist_color=(255, 255, 255)):
    base_path = os.path.join(ART_DIR, base_name)
    img = Image.open(base_path).convert("RGB")
    img = img.resize((1376, 768), Image.Resampling.LANCZOS)
    
    # Color grading / tint
    arr = np.array(img).astype(np.float32)
    for c in range(3):
        arr[:, :, c] = arr[:, :, c] * (tint_color[c] / 255.0)
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    img = Image.fromarray(arr)
    
    enh_c = ImageEnhance.Contrast(img)
    img = enh_c.enhance(contrast)
    enh_b = ImageEnhance.Brightness(img)
    img = enh_b.enhance(brightness)
    
    if add_mist:
        mist = Image.new("RGBA", (1376, 768), (0, 0, 0, 0))
        for y in range(768):
            a = int(60 * (y / 768.0)**1.5)
            for x in range(1376):
                mist.putpixel((x, y), (mist_color[0], mist_color[1], mist_color[2], a))
        img_rgba = img.convert("RGBA")
        img_rgba = Image.alpha_composite(img_rgba, mist)
        img = img_rgba.convert("RGB")
        
    return img

def create_painterly_midground(base_name, tint_color, y_cut_ratio=0.35):
    base_path = os.path.join(ART_DIR, base_name)
    img = Image.open(base_path).convert("RGBA")
    w, h = img.size
    mid = img.crop((0, int(h * y_cut_ratio), w, h))
    mid = mid.resize((1376, 768), Image.Resampling.LANCZOS)
    
    # Color grading
    arr = np.array(mid).astype(np.float32)
    for c in range(3):
        arr[:, :, c] = arr[:, :, c] * (tint_color[c] / 255.0)
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    mid = Image.fromarray(arr, "RGBA")
    
    # Soft alpha fade on top
    alpha = Image.new("L", (1376, 768), 0)
    for y in range(768):
        a = int(240 * min(1.0, max(0.0, (y - 140) / 180.0)))
        for x in range(1376):
            alpha.putpixel((x, y), a)
    mid.putalpha(alpha)
    return mid

# 3. Level 6: Glaciar de Menta (Icy Blue / Cyan / White Glacier)
bg6 = create_painterly_level_bg("fondo_caverna_v2_1786785379838.jpg", (140, 210, 255), contrast=1.35, brightness=1.1, mist_color=(200, 240, 255))
bg6.save(os.path.join(ASSETS_DIR, "fondo-cumbres.jpg"), "JPEG", quality=95)
mid6 = create_painterly_midground("fondo_cristales_v2_1786785392810.jpg", (160, 230, 255), y_cut_ratio=0.28)
mid6.save(os.path.join(ASSETS_DIR, "fondo-glaciar.png"), "PNG")
print("Synthesized 3D painterly Level 6 Glaciar assets")

# 4. Level 7: Laberinto de Gominola (Vibrant Neon Magenta / Purple Jelly)
bg7 = create_painterly_level_bg("fondo_caverna_1786738731651.jpg", (255, 120, 220), contrast=1.3, brightness=1.05, mist_color=(255, 180, 240))
bg7.save(os.path.join(ASSETS_DIR, "fondo-laberinto.jpg"), "JPEG", quality=95)
mid7 = create_painterly_midground("fondo_cristales_1786738753358.jpg", (255, 140, 230), y_cut_ratio=0.30)
mid7.save(os.path.join(ASSETS_DIR, "fondo-gelatina.png"), "PNG")
print("Synthesized 3D painterly Level 7 Laberinto assets")

# 5. Level 8: Caldera de Caramelo (Molten Orange & Magma Caramel)
bg8 = create_painterly_level_bg("fondo_caverna_v2_1786785379838.jpg", (255, 140, 60), contrast=1.4, brightness=1.0, mist_color=(255, 120, 40))
bg8.save(os.path.join(ASSETS_DIR, "fondo-lava.jpg"), "JPEG", quality=95)
mid8 = create_painterly_midground("fondo_cristales_v2_1786785392810.jpg", (255, 160, 70), y_cut_ratio=0.32)
mid8.save(os.path.join(ASSETS_DIR, "fondo-volcan.png"), "PNG")
print("Synthesized 3D painterly Level 8 Lava assets")

# 6. Level 9: Ciudadela de Chocolate (Gothic Dark Chocolate & Crimson Moon)
bg9 = create_painterly_level_bg("fondo_fabrica_1786788636114.jpg", (180, 60, 100), contrast=1.45, brightness=0.85, mist_color=(220, 40, 80))
bg9.save(os.path.join(ASSETS_DIR, "fondo-ciudadela.jpg"), "JPEG", quality=95)
mid9 = create_painterly_midground("fondo_nubes_1786788651836.jpg", (190, 70, 110), y_cut_ratio=0.35)
mid9.save(os.path.join(ASSETS_DIR, "fondo-murallas.png"), "PNG")
print("Synthesized 3D painterly Level 9 Ciudadela assets")

# 7. Level 10: El Trono del Rey Amargo (Imperial Golden Cathedral & Royal Ruby)
bg10 = create_painterly_level_bg("fondo_fabrica_1786788636114.jpg", (255, 200, 70), contrast=1.35, brightness=1.1, mist_color=(255, 220, 100))
bg10.save(os.path.join(ASSETS_DIR, "fondo-trono.jpg"), "JPEG", quality=95)
mid10 = create_painterly_midground("fondo_nubes_1786788651836.jpg", (255, 210, 80), y_cut_ratio=0.30)
mid10.save(os.path.join(ASSETS_DIR, "fondo-sanctum.png"), "PNG")
print("Synthesized 3D painterly Level 10 Trono assets")

print("=== ALL STUDIO HD PAINTERLY BACKGROUNDS SYNTHESIZED SUCCESSFULLY ===")
