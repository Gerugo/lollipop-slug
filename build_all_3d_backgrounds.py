import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

os.makedirs('src/assets', exist_ok=True)
W, H = 1920, 1080

def make_seamless_horizontal(img_pil, blend_width=180):
    """Blends the left and right edges using cosine weighting for perfect horizontal tiling"""
    arr = np.array(img_pil).astype(np.float32)
    h, w = arr.shape[:2]
    
    left_strip = arr[:, :blend_width].copy()
    right_strip = arr[:, -blend_width:].copy()
    
    t = np.linspace(0, 1, blend_width)
    weight = (1.0 - np.cos(t * math.pi)) * 0.5  # Cosine smooth curve from 0 to 1
    
    if len(arr.shape) == 3:
        weight = weight.reshape(1, blend_width, 1)
    else:
        weight = weight.reshape(1, blend_width)
        
    blended = left_strip * (1.0 - weight) + right_strip * weight
    arr[:, :blend_width] = blended
    arr[:, -blend_width:] = blended
    
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

def create_gradient_2d(w, h, stops, vertical_exp=1.0):
    arr = np.zeros((h, w, 3), dtype=np.float32)
    for y in range(h):
        pos = (y / (h - 1)) ** vertical_exp
        for i in range(len(stops) - 1):
            p0, c0 = stops[i]
            p1, c1 = stops[i+1]
            if p0 <= pos <= p1 or (i == len(stops)-2 and pos >= p1):
                t = max(0.0, min(1.0, (pos - p0) / max(1e-5, (p1 - p0))))
                t = t * t * (3.0 - 2.0 * t) # smoothstep
                r = c0[0] * (1 - t) + c1[0] * t
                g = c0[1] * (1 - t) + c1[1] * t
                b = c0[2] * (1 - t) + c1[2] * t
                arr[y, :] = [r, g, b]
                break
    return arr

def add_smooth_hills(arr, y_base, amp, freq, color, rim_col=None, num_octaves=4, seed=42):
    np.random.seed(seed)
    h, w, _ = arr.shape
    x_vals = np.linspace(0, freq * math.pi * 2, w)
    curve = np.zeros(w)
    for o in range(1, num_octaves + 1):
        phase = (o * 2.399) + seed
        curve += (np.sin(x_vals * o + phase) + 0.4 * np.cos(x_vals * o * 0.7 - phase)) / (o ** 0.85)
    
    curve = (curve / np.max(np.abs(curve))) * amp + y_base
    
    for x in range(w):
        top_y = int(np.clip(curve[x], 0, h - 1))
        for y in range(top_y, h):
            d_norm = (y - top_y) / max(1, h - top_y)
            if rim_col and (y - top_y) < 16:
                rt = (y - top_y) / 16.0
                c = [rim_col[i] * (1 - rt) + color[i] * rt for i in range(3)]
            else:
                shade = 1.0 - 0.45 * (1.0 - math.exp(-d_norm * 3.5))
                c = [color[i] * shade for i in range(3)]
            arr[y, x] = c
    return arr

def add_god_rays(img, color=(255, 240, 200), intensity=0.35, count=7):
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    w, h = img.size
    for i in range(count):
        src_x = w // 2 + int((i - count/2) * 180)
        dest_x = int(src_x + (i - count/2) * 420)
        alpha = int(255 * intensity * np.random.uniform(0.6, 1.0))
        col = (color[0], color[1], color[2], alpha)
        d.polygon([(src_x - 30, 0), (src_x + 30, 0), (dest_x + 140, h), (dest_x - 140, h)], fill=col)
    overlay = overlay.filter(ImageFilter.GaussianBlur(36))
    img.paste(overlay, (0, 0), overlay)
    return img

# ==============================================================================
# LEVEL 5: EL PANTANO DE GASEOSA (Soda Swamp - Toxic Emerald & Bioluminescent Teal)
# ==============================================================================
def render_level5():
    print("Generating Level 5 HD Assets...")
    # 1. Sky: fondo-pantano.jpg
    sky = create_gradient_2d(W, H, [
        (0.0, (4, 47, 46)),      # Dark teal
        (0.35, (6, 78, 59)),     # Emerald
        (0.65, (13, 148, 136)),  # Fizzy cyan
        (1.0, (2, 44, 34))       # Deep swamp floor
    ])
    sky = add_smooth_hills(sky, 460, 140, 3.0, (6, 78, 59), (94, 234, 212), num_octaves=4, seed=51)
    sky = add_smooth_hills(sky, 620, 160, 4.2, (4, 47, 46), (52, 211, 153), num_octaves=5, seed=52)
    
    img = Image.fromarray(np.clip(sky, 0, 255).astype(np.uint8), 'RGB')
    # Add giant glowing gummy mushroom silhouettes in the distance
    d = ImageDraw.Draw(img)
    for mx in range(120, W, 320):
        mh = int(320 + math.sin(mx) * 80)
        # Cap
        d.ellipse([mx - 110, H - mh - 90, mx + 110, H - mh + 50], fill=(13, 148, 136), outline=(94, 234, 212))
        # Stem
        d.rectangle([mx - 28, H - mh, mx + 28, H - 180], fill=(6, 78, 59))
        
    img = img.filter(ImageFilter.GaussianBlur(1.2))
    img = add_god_rays(img, (94, 234, 212), 0.28, count=6)
    img = make_seamless_horizontal(img)
    img.save('src/assets/fondo-pantano.jpg', 'JPEG', quality=95)

    # 2. Midground: fondo-canas.png
    mid = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d_m = ImageDraw.Draw(mid)
    for x in range(60, W + 120, 160):
        # 3D Sugar Reeds
        for y in range(180, H, 110):
            d_m.rounded_rectangle([x - 22, y, x + 22, y + 98], radius=14, fill=(16, 185, 129, 230), outline=(209, 250, 229, 255), width=4)
        # Bioluminescent Soda Bubbles
        by = (x * 71) % (H - 380) + 240
        d_m.ellipse([x - 42, by - 42, x + 42, by + 42], fill=(6, 182, 212, 190), outline=(255, 255, 255, 240), width=5)
        # Glow highlight
        d_m.ellipse([x - 20, by - 24, x - 6, by - 10], fill=(255, 255, 255, 220))
    mid = mid.filter(ImageFilter.GaussianBlur(1.0))
    mid = make_seamless_horizontal(mid)
    mid.save('src/assets/fondo-canas.png', 'PNG')

# ==============================================================================
# LEVEL 6: CUMBRES DE CARAMELO HELADO (Frozen Peaks & Crystal Glacier)
# ==============================================================================
def render_level6():
    print("Generating Level 6 HD Assets...")
    # 1. Sky: fondo-cumbres.jpg
    sky = create_gradient_2d(W, H, [
        (0.0, (15, 23, 42)),     # Midnight arctic navy
        (0.3, (30, 41, 59)),     # Twilight violet
        (0.65, (2, 132, 199)),   # Aurora cyan
        (1.0, (224, 242, 254))   # Ice white haze
    ])
    sky = add_smooth_hills(sky, 420, 180, 2.5, (2, 132, 199), (255, 255, 255), num_octaves=4, seed=61)
    sky = add_smooth_hills(sky, 600, 160, 3.8, (125, 211, 252), (255, 255, 255), num_octaves=5, seed=62)
    
    img = Image.fromarray(np.clip(sky, 0, 255).astype(np.uint8), 'RGB')
    # Aurora Ribbon in the sky
    d = ImageDraw.Draw(img)
    for ax in range(0, W, 10):
        ay = int(220 + math.sin(ax * 0.006) * 70 + math.cos(ax * 0.015) * 35)
        d.line([(ax, ay - 60), (ax, ay + 60)], fill=(56, 189, 248), width=12)
        d.line([(ax, ay - 25), (ax, ay + 25)], fill=(192, 132, 252), width=6)
        
    img = img.filter(ImageFilter.GaussianBlur(1.5))
    img = add_god_rays(img, (224, 242, 254), 0.32, count=7)
    img = make_seamless_horizontal(img)
    img.save('src/assets/fondo-cumbres.jpg', 'JPEG', quality=95)

    # 2. Midground: fondo-glaciar.png
    mid = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d_m = ImageDraw.Draw(mid)
    for x in range(80, W, 210):
        # 3D Crystal Spires from floor
        sh = int(420 + math.sin(x) * 120)
        d_m.polygon([(x - 65, H), (x, H - sh), (x + 65, H)], fill=(186, 230, 253, 235), outline=(255, 255, 255, 255))
        d_m.polygon([(x, H), (x, H - sh), (x + 65, H)], fill=(125, 211, 252, 235))
        # Hanging icicles from ceiling
        ih = int(260 + math.cos(x) * 70)
        d_m.polygon([(x + 70, 0), (x + 100, ih), (x + 130, 0)], fill=(224, 242, 254, 230), outline=(255, 255, 255, 255))
    mid = mid.filter(ImageFilter.GaussianBlur(1.0))
    mid = make_seamless_horizontal(mid)
    mid.save('src/assets/fondo-glaciar.png', 'PNG')

# ==============================================================================
# LEVEL 7: EL LABERINTO DE GOMINOLA ELÁSTICA (Neon Gummy Labyrinth Cavern)
# ==============================================================================
def render_level7():
    print("Generating Level 7 HD Assets...")
    # 1. Sky: fondo-laberinto.jpg
    sky = create_gradient_2d(W, H, [
        (0.0, (46, 16, 101)),    # Dark violet void
        (0.35, (131, 24, 67)),   # Crimson ruby
        (0.7, (190, 18, 60)),    # Neon magenta gummy
        (1.0, (251, 113, 133))   # Glowing pink syrup floor
    ])
    sky = add_smooth_hills(sky, 440, 140, 3.2, (190, 18, 60), (254, 205, 211), num_octaves=4, seed=71)
    sky = add_smooth_hills(sky, 620, 150, 4.5, (131, 24, 67), (253, 164, 175), num_octaves=5, seed=72)
    
    img = Image.fromarray(np.clip(sky, 0, 255).astype(np.uint8), 'RGB')
    # Translucent gummy ribs in cavern ceiling
    d = ImageDraw.Draw(img)
    for rx in range(100, W, 280):
        d.arc([rx - 160, -80, rx + 160, 420], start=0, end=180, fill=(244, 63, 94), width=18)
    img = img.filter(ImageFilter.GaussianBlur(1.3))
    img = add_god_rays(img, (251, 113, 133), 0.35, count=6)
    img = make_seamless_horizontal(img)
    img.save('src/assets/fondo-laberinto.jpg', 'JPEG', quality=95)

    # 2. Midground: fondo-gelatina.png
    mid = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d_m = ImageDraw.Draw(mid)
    for x in range(110, W, 260):
        # 3D Gummy Pillar Arch
        d_m.rounded_rectangle([x - 45, H - 480, x + 45, H], radius=32, fill=(217, 70, 239, 230), outline=(253, 244, 255, 255), width=5)
        d_m.ellipse([x - 90, H - 520, x + 90, H - 390], fill=(236, 72, 153, 230), outline=(255, 255, 255, 255), width=5)
        # Sugar crystal drops
        d_m.ellipse([x - 14, H - 360, x + 14, H - 320], fill=(255, 255, 255, 220))
    mid = mid.filter(ImageFilter.GaussianBlur(1.0))
    mid = make_seamless_horizontal(mid)
    mid.save('src/assets/fondo-gelatina.png', 'PNG')

# ==============================================================================
# LEVEL 8: EL RÍO DE LAVA DE CARAMELO (Molten Caramel Caldera)
# ==============================================================================
def render_level8():
    print("Generating Level 8 HD Assets...")
    # 1. Sky: fondo-lava.jpg
    sky = create_gradient_2d(W, H, [
        (0.0, (28, 25, 23)),     # Ash black
        (0.35, (69, 26, 3)),     # Deep magma brown
        (0.65, (194, 65, 12)),   # Fiery burnt caramel
        (1.0, (251, 146, 60))    # Boiling amber horizon
    ])
    sky = add_smooth_hills(sky, 420, 160, 2.6, (124, 45, 18), (254, 215, 170), num_octaves=4, seed=81)
    sky = add_smooth_hills(sky, 590, 170, 3.8, (154, 52, 18), (255, 237, 213), num_octaves=5, seed=82)
    
    img = Image.fromarray(np.clip(sky, 0, 255).astype(np.uint8), 'RGB')
    # Volcano silhouette erupting caramel geyser
    d = ImageDraw.Draw(img)
    for vx in range(240, W, 580):
        d.polygon([(vx - 190, H - 180), (vx - 40, H - 460), (vx + 40, H - 460), (vx + 190, H - 180)], fill=(41, 37, 36))
        # Lava spout
        d.ellipse([vx - 35, H - 540, vx + 35, H - 440], fill=(251, 146, 60))
        d.line([(vx, H - 460), (vx, H - 580)], fill=(254, 240, 138), width=8)
        
    img = img.filter(ImageFilter.GaussianBlur(1.2))
    img = add_god_rays(img, (251, 146, 60), 0.42, count=7)
    img = make_seamless_horizontal(img)
    img.save('src/assets/fondo-lava.jpg', 'JPEG', quality=95)

    # 2. Midground: fondo-volcan.png
    mid = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d_m = ImageDraw.Draw(mid)
    for x in range(90, W, 220):
        # Basalt Dark Chocolate Hexagonal Columns
        ch = int(460 + math.sin(x * 1.5) * 140)
        d_m.rounded_rectangle([x - 50, H - ch, x + 50, H], radius=28, fill=(41, 37, 36, 245), outline=(251, 146, 60, 255), width=5)
        # Molten caramel fissures
        d_m.line([(x - 20, H - ch + 40), (x + 10, H - ch + 160), (x - 15, H - ch + 280)], fill=(254, 240, 138, 255), width=4)
    mid = mid.filter(ImageFilter.GaussianBlur(1.0))
    mid = make_seamless_horizontal(mid)
    mid.save('src/assets/fondo-volcan.png', 'PNG')

# ==============================================================================
# LEVEL 9: LA CIUDADELA DE CARAMELO PROHIBIDO (Gothic Citadel & Blood Moon)
# ==============================================================================
def render_level9():
    print("Generating Level 9 HD Assets...")
    # 1. Sky: fondo-ciudadela.jpg
    sky = create_gradient_2d(W, H, [
        (0.0, (9, 9, 11)),       # Obsidian pitch black
        (0.35, (24, 24, 27)),    # Dark charcoal
        (0.7, (76, 5, 25)),      # Blood crimson gothic sky
        (1.0, (136, 19, 55))     # Royal crimson mist
    ])
    sky = add_smooth_hills(sky, 460, 130, 2.8, (39, 39, 42), (244, 63, 94), num_octaves=4, seed=91)
    sky = add_smooth_hills(sky, 620, 140, 4.0, (24, 24, 27), (251, 113, 133), num_octaves=5, seed=92)
    
    img = Image.fromarray(np.clip(sky, 0, 255).astype(np.uint8), 'RGB')
    # Blood Moon & Castle Spires
    d = ImageDraw.Draw(img)
    # Crimson Moon
    cx_moon, cy_moon = W - 420, 240
    d.ellipse([cx_moon - 130, cy_moon - 130, cx_moon + 130, cy_moon + 130], fill=(225, 29, 72), outline=(255, 228, 230), width=8)
    # Distant gothic spires
    for sx in range(160, W, 340):
        d.polygon([(sx - 50, H - 240), (sx, H - 560), (sx + 50, H - 240)], fill=(24, 24, 27))
        d.rectangle([sx - 35, H - 240, sx + 35, H - 160], fill=(24, 24, 27))
        
    img = img.filter(ImageFilter.GaussianBlur(1.2))
    img = add_god_rays(img, (225, 29, 72), 0.36, count=6)
    img = make_seamless_horizontal(img)
    img.save('src/assets/fondo-ciudadela.jpg', 'JPEG', quality=95)

    # 2. Midground: fondo-murallas.png
    mid = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d_m = ImageDraw.Draw(mid)
    for x in range(70, W, 200):
        # 3D Gothic Fortress Battlements
        bh = int(450 + math.cos(x) * 80)
        d_m.rounded_rectangle([x - 48, H - bh, x + 48, H], radius=22, fill=(24, 24, 27, 245), outline=(225, 29, 72, 255), width=4)
        # Crenellations & Spikes
        d_m.polygon([(x - 55, H - bh), (x, H - bh - 90), (x + 55, H - bh)], fill=(39, 39, 42, 245), outline=(251, 113, 133, 255), width=4)
        # Glowing blood rune
        d_m.ellipse([x - 12, H - bh + 60, x + 12, H - bh + 84], fill=(225, 29, 72, 240))
    mid = mid.filter(ImageFilter.GaussianBlur(1.0))
    mid = make_seamless_horizontal(mid)
    mid.save('src/assets/fondo-murallas.png', 'PNG')

# ==============================================================================
# LEVEL 10: EL TRONO DEL REY AMARGO (Cosmic Void Throne & Imperial Gold Sanctum)
# ==============================================================================
def render_level10():
    print("Generating Level 10 HD Assets...")
    # 1. Sky: fondo-trono.jpg
    sky = create_gradient_2d(W, H, [
        (0.0, (9, 9, 11)),       # Deep cosmic black
        (0.3, (59, 7, 100)),     # Royal emperor purple
        (0.65, (180, 83, 9)),    # Imperial dark gold caramel
        (1.0, (250, 204, 21))    # Radiant solar gold horizon
    ])
    sky = add_smooth_hills(sky, 440, 140, 2.6, (120, 53, 15), (254, 240, 138), num_octaves=4, seed=101)
    sky = add_smooth_hills(sky, 610, 150, 3.8, (180, 83, 9), (255, 255, 255), num_octaves=5, seed=102)
    
    img = Image.fromarray(np.clip(sky, 0, 255).astype(np.uint8), 'RGB')
    # Cosmic Stained Glass Rosette Window & Starlight
    d = ImageDraw.Draw(img)
    cx, cy = W // 2, 280
    d.ellipse([cx - 200, cy - 200, cx + 200, cy + 200], fill=(217, 119, 6), outline=(254, 240, 138), width=12)
    for a in range(0, 360, 24):
        rad = math.radians(a)
        ex = cx + int(190 * math.cos(rad))
        ey = cy + int(190 * math.sin(rad))
        d.line([(cx, cy), (ex, ey)], fill=(254, 240, 138), width=4)
        
    img = img.filter(ImageFilter.GaussianBlur(1.2))
    img = add_god_rays(img, (250, 204, 21), 0.48, count=8)
    img = make_seamless_horizontal(img)
    img.save('src/assets/fondo-trono.jpg', 'JPEG', quality=95)

    # 2. Midground: fondo-sanctum.png
    mid = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d_m = ImageDraw.Draw(mid)
    for x in range(120, W, 280):
        # 3D Imperial Gold Cathedral Column
        d_m.rounded_rectangle([x - 42, H - 510, x + 42, H], radius=26, fill=(217, 119, 6, 240), outline=(254, 240, 138, 255), width=6)
        # Imperial Capital Arch
        d_m.polygon([(x - 65, 220), (x + 65, 220), (x, 340)], fill=(250, 204, 21, 240), outline=(255, 255, 255, 255), width=5)
        # Floating Amber Orbs
        oy = H - 320
        d_m.ellipse([x - 22, oy - 22, x + 22, oy + 22], fill=(254, 240, 138, 255), outline=(255, 255, 255, 255), width=3)
    mid = mid.filter(ImageFilter.GaussianBlur(1.0))
    mid = make_seamless_horizontal(mid)
    mid.save('src/assets/fondo-sanctum.png', 'PNG')

if __name__ == '__main__':
    render_level5()
    render_level6()
    render_level7()
    render_level8()
    render_level9()
    render_level10()
    print("ALL 12 LEVEL 5-10 3D BACKGROUNDS SUCCESSFULLY GENERATED AND BLENDED!")
