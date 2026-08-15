import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

os.makedirs('src/assets', exist_ok=True)

W, H = 1376, 768

def create_gradient(w, h, stops):
    """Generates a vertical gradient with multiple color stops"""
    arr = np.zeros((h, w, 3), dtype=np.float32)
    for y in range(h):
        pos = y / (h - 1)
        for i in range(len(stops) - 1):
            p0, c0 = stops[i]
            p1, c1 = stops[i+1]
            if p0 <= pos <= p1:
                t = (pos - p0) / (p1 - p0)
                # smoothstep interpolation
                t = t * t * (3 - 2 * t)
                r = c0[0] * (1 - t) + c1[0] * t
                g = c0[1] * (1 - t) + c1[1] * t
                b = c0[2] * (1 - t) + c1[2] * t
                arr[y, :] = [r, g, b]
                break
    return arr

def add_perlin_hills(canvas_arr, y_base, amplitude, freq, color, top_color=None, num_layers=3):
    """Draws organic rolling hills with 3D depth, specular rim, and volumetric shading"""
    h, w, _ = canvas_arr.shape
    x_coords = np.linspace(0, freq * math.pi * 2, w)
    
    # Generate multi-frequency organic curve
    curve = np.zeros(w)
    for i in range(1, num_layers + 1):
        phase = i * 1.7
        curve += (np.sin(x_coords * i + phase) + 0.5 * np.cos(x_coords * i * 0.7 - phase)) / (i ** 0.8)
    
    curve = (curve / np.max(np.abs(curve))) * amplitude + y_base
    
    for x in range(w):
        top_y = int(np.clip(curve[x], 0, h - 1))
        for y in range(top_y, h):
            depth = (y - top_y) / max(1, h - top_y)
            # Specular frosting on top edge
            if y - top_y < 12 and top_color is not None:
                frost_t = (y - top_y) / 12.0
                c = [top_color[i] * (1 - frost_t) + color[i] * frost_t for i in range(3)]
            else:
                # 3D Depth gradient
                shade = 1.0 - 0.35 * (1.0 - math.exp(-depth * 3.0))
                c = [color[i] * shade for i in range(3)]
            canvas_arr[y, x] = c
    return canvas_arr

def add_3d_stalactites(canvas_arr, y_base, length_max, count, color, rim_col=(255, 255, 255)):
    """Draws 3D hanging stalactites from the ceiling with subsurface scattering"""
    h, w, _ = canvas_arr.shape
    xs = np.linspace(30, w - 30, count)
    for cx in xs:
        cx = int(cx + np.random.uniform(-20, 20))
        st_len = int(np.random.uniform(length_max * 0.5, length_max))
        rw = int(np.random.uniform(25, 55))
        for y in range(0, st_len):
            cur_w = int(rw * (1.0 - (y / st_len) ** 0.7))
            if cur_w <= 0: break
            for x in range(max(0, cx - cur_w), min(w, cx + cur_w)):
                dist = abs(x - cx) / max(1, cur_w)
                normal_z = math.sqrt(max(0, 1.0 - dist * dist))
                shade = 0.4 + 0.6 * normal_z
                spec = math.pow(normal_z, 16) * 0.4
                c = [
                    np.clip(color[0] * shade + 255 * spec + rim_col[0] * (1 - normal_z) * 0.3, 0, 255),
                    np.clip(color[1] * shade + 255 * spec + rim_col[1] * (1 - normal_z) * 0.3, 0, 255),
                    np.clip(color[2] * shade + 255 * spec + rim_col[2] * (1 - normal_z) * 0.3, 0, 255)
                ]
                canvas_arr[y, x] = c
    return canvas_arr

def add_god_rays(img, color=(255, 240, 200), intensity=0.35, count=6):
    """Draws volumetric light shafts"""
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    w, h = img.size
    for i in range(count):
        src_x = w // 2 + int((i - count/2) * 120)
        dest_x = int(src_x + (i - count/2) * 280)
        alpha = int(255 * intensity * np.random.uniform(0.6, 1.0))
        col = (color[0], color[1], color[2], alpha)
        d.polygon([(src_x - 15, 0), (src_x + 15, 0), (dest_x + 90, h), (dest_x - 90, h)], fill=col)
    overlay = overlay.filter(ImageFilter.GaussianBlur(24))
    img.paste(overlay, (0, 0), overlay)
    return img

# ----------------------------------------------------------------------
# GENERATE LEVEL 5 TO 10 BACKGROUNDS & MIDGROUNDS
# ----------------------------------------------------------------------

def generate_level5_pantano():
    print("Rendering 3D Level 5 Pantano...")
    # fondo-pantano.jpg
    sky = create_gradient(W, H, [
        (0.0, (15, 23, 42)),
        (0.4, (20, 83, 45)),
        (0.75, (22, 101, 52)),
        (1.0, (6, 78, 59))
    ])
    sky = add_perlin_hills(sky, 340, 100, 2.5, (20, 83, 45), (74, 222, 128), num_layers=4)
    sky = add_perlin_hills(sky, 480, 110, 3.5, (22, 101, 52), (134, 239, 172), num_layers=5)
    
    img = Image.fromarray(np.clip(sky, 0, 255).astype(np.uint8), 'RGB')
    img = img.filter(ImageFilter.GaussianBlur(1.0))
    img = add_god_rays(img, (134, 239, 172), 0.25, count=5)
    img.save('src/assets/fondo-pantano.jpg', 'JPEG', quality=95)
    
    # fondo-canas.png (Transparent Midground with 3D Sugar Canes & Bubbles)
    mid = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(mid)
    for x in range(40, W + 100, 130):
        # 3D Sugar Cane Bamboo
        for y in range(0, H, 80):
            d.rounded_rectangle([x - 16, y, x + 16, y + 74], radius=10, fill=(34, 197, 94, 220), outline=(187, 247, 208, 255), width=3)
        # 3D Soda Bubbles
        by = (x * 47) % (H - 240) + 120
        d.ellipse([x - 28, by - 28, x + 28, by + 28], fill=(6, 182, 212, 180), outline=(255, 255, 255, 240), width=4)
    mid = mid.filter(ImageFilter.GaussianBlur(0.8))
    mid.save('src/assets/fondo-canas.png', 'PNG')

def generate_level6_glaciar():
    print("Rendering 3D Level 6 Glaciar...")
    # fondo-cumbres.jpg
    sky = create_gradient(W, H, [
        (0.0, (15, 23, 42)),
        (0.35, (30, 27, 75)),
        (0.65, (56, 189, 248)),
        (1.0, (224, 242, 254))
    ])
    sky = add_perlin_hills(sky, 300, 130, 2.0, (56, 189, 248), (255, 255, 255), num_layers=4)
    sky = add_perlin_hills(sky, 450, 120, 3.2, (186, 230, 253), (255, 255, 255), num_layers=5)
    sky = add_3d_stalactites(sky, 0, 260, 24, (125, 211, 252), (255, 255, 255))
    
    img = Image.fromarray(np.clip(sky, 0, 255).astype(np.uint8), 'RGB')
    img = img.filter(ImageFilter.GaussianBlur(1.0))
    img = add_god_rays(img, (224, 242, 254), 0.3, count=6)
    img.save('src/assets/fondo-cumbres.jpg', 'JPEG', quality=95)
    
    # fondo-glaciar.png (Transparent Midground Crystals)
    mid = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(mid)
    for x in range(60, W, 160):
        # Spire from floor
        d.polygon([(x - 45, H), (x, H - 340), (x + 45, H)], fill=(224, 242, 254, 230), outline=(255, 255, 255, 255))
        d.polygon([(x, H), (x, H - 340), (x + 45, H)], fill=(186, 230, 253, 230))
        # Icicle from ceiling
        d.polygon([(x + 50, 0), (x + 75, 220), (x + 100, 0)], fill=(224, 242, 254, 230), outline=(255, 255, 255, 255))
    mid = mid.filter(ImageFilter.GaussianBlur(0.8))
    mid.save('src/assets/fondo-glaciar.png', 'PNG')

def generate_level7_laberinto():
    print("Rendering 3D Level 7 Laberinto...")
    # fondo-laberinto.jpg
    sky = create_gradient(W, H, [
        (0.0, (24, 10, 35)),
        (0.4, (88, 28, 135)),
        (0.7, (190, 24, 93)),
        (1.0, (244, 114, 182))
    ])
    sky = add_perlin_hills(sky, 340, 110, 2.8, (190, 24, 93), (251, 207, 232), num_layers=4)
    sky = add_perlin_hills(sky, 480, 120, 3.8, (219, 39, 119), (253, 242, 248), num_layers=5)
    
    img = Image.fromarray(np.clip(sky, 0, 255).astype(np.uint8), 'RGB')
    img = img.filter(ImageFilter.GaussianBlur(1.0))
    img = add_god_rays(img, (244, 114, 182), 0.35, count=6)
    img.save('src/assets/fondo-laberinto.jpg', 'JPEG', quality=95)
    
    # fondo-gelatina.png (Transparent Midground Jelly Arches)
    mid = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(mid)
    for x in range(90, W, 220):
        d.rounded_rectangle([x - 30, H - 380, x + 30, H], radius=24, fill=(217, 70, 239, 220), outline=(253, 244, 255, 255), width=3)
        d.ellipse([x - 70, H - 410, x + 70, H - 310], fill=(236, 72, 153, 220), outline=(255, 255, 255, 255), width=3)
    mid = mid.filter(ImageFilter.GaussianBlur(0.8))
    mid.save('src/assets/fondo-gelatina.png', 'PNG')

def generate_level8_lava():
    print("Rendering 3D Level 8 Lava...")
    # fondo-lava.jpg
    sky = create_gradient(W, H, [
        (0.0, (24, 10, 10)),
        (0.35, (69, 10, 10)),
        (0.65, (194, 65, 12)),
        (1.0, (251, 146, 60))
    ])
    sky = add_perlin_hills(sky, 320, 130, 2.2, (124, 45, 18), (254, 215, 170), num_layers=4)
    sky = add_perlin_hills(sky, 460, 120, 3.4, (154, 52, 18), (255, 237, 213), num_layers=5)
    sky = add_3d_stalactites(sky, 0, 250, 22, (69, 10, 10), (251, 146, 60))
    
    img = Image.fromarray(np.clip(sky, 0, 255).astype(np.uint8), 'RGB')
    img = img.filter(ImageFilter.GaussianBlur(1.0))
    img = add_god_rays(img, (251, 146, 60), 0.4, count=6)
    img.save('src/assets/fondo-lava.jpg', 'JPEG', quality=95)
    
    # fondo-volcan.png (Transparent Midground Caramel Columns)
    mid = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(mid)
    for x in range(70, W, 180):
        d.rounded_rectangle([x - 35, H - 360, x + 35, H], radius=24, fill=(124, 45, 18, 240), outline=(251, 146, 60, 255), width=4)
        d.polygon([(x - 25, 0), (x, 210), (x + 25, 0)], fill=(69, 10, 10, 240), outline=(251, 146, 60, 255), width=3)
    mid = mid.filter(ImageFilter.GaussianBlur(0.8))
    mid.save('src/assets/fondo-volcan.png', 'PNG')

def generate_level9_ciudadela():
    print("Rendering 3D Level 9 Ciudadela...")
    # fondo-ciudadela.jpg
    sky = create_gradient(W, H, [
        (0.0, (15, 10, 20)),
        (0.4, (35, 15, 30)),
        (0.7, (88, 28, 135)),
        (1.0, (159, 18, 57))
    ])
    sky = add_perlin_hills(sky, 340, 110, 2.5, (39, 39, 42), (244, 63, 94), num_layers=4)
    sky = add_perlin_hills(sky, 480, 120, 3.6, (24, 24, 27), (251, 113, 133), num_layers=5)
    
    img = Image.fromarray(np.clip(sky, 0, 255).astype(np.uint8), 'RGB')
    # Blood Sugar Moon
    d_m = ImageDraw.Draw(img)
    d_m.ellipse([W - 320, 70, W - 140, 250], fill=(225, 29, 72), outline=(255, 228, 230), width=6)
    img = img.filter(ImageFilter.GaussianBlur(1.0))
    img = add_god_rays(img, (225, 29, 72), 0.35, count=6)
    img.save('src/assets/fondo-ciudadela.jpg', 'JPEG', quality=95)
    
    # fondo-murallas.png (Transparent Midground Battlements)
    mid = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(mid)
    for x in range(60, W, 170):
        d.rounded_rectangle([x - 35, H - 340, x + 35, H], radius=18, fill=(24, 24, 27, 240), outline=(225, 29, 72, 255), width=3)
        d.polygon([(x - 40, H - 340), (x, H - 420), (x + 40, H - 340)], fill=(39, 39, 42, 240), outline=(251, 113, 133, 255), width=3)
    mid = mid.filter(ImageFilter.GaussianBlur(0.8))
    mid.save('src/assets/fondo-murallas.png', 'PNG')

def generate_level10_trono():
    print("Rendering 3D Level 10 Trono...")
    # fondo-trono.jpg
    sky = create_gradient(W, H, [
        (0.0, (20, 10, 30)),
        (0.4, (88, 28, 135)),
        (0.7, (217, 119, 6)),
        (1.0, (250, 204, 21))
    ])
    sky = add_perlin_hills(sky, 340, 110, 2.5, (120, 53, 15), (254, 240, 138), num_layers=4)
    sky = add_perlin_hills(sky, 470, 120, 3.5, (180, 83, 9), (255, 255, 255), num_layers=5)
    
    img = Image.fromarray(np.clip(sky, 0, 255).astype(np.uint8), 'RGB')
    # Cosmic Stained Glass Rosette
    d_r = ImageDraw.Draw(img)
    cx, cy = W // 2, 220
    d_r.ellipse([cx - 150, cy - 150, cx + 150, cy + 150], fill=(217, 119, 6), outline=(254, 240, 138), width=8)
    for a in range(0, 360, 30):
        rad = math.radians(a)
        ex = cx + int(140 * math.cos(rad))
        ey = cy + int(140 * math.sin(rad))
        d_r.line([(cx, cy), (ex, ey)], fill=(254, 240, 138), width=3)
    img = img.filter(ImageFilter.GaussianBlur(1.0))
    img = add_god_rays(img, (250, 204, 21), 0.45, count=7)
    img.save('src/assets/fondo-trono.jpg', 'JPEG', quality=95)
    
    # fondo-sanctum.png (Transparent Midground Golden Cathedral Columns)
    mid = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(mid)
    for x in range(100, W, 240):
        d.rounded_rectangle([x - 30, H - 380, x + 30, H], radius=20, fill=(217, 119, 6, 230), outline=(254, 240, 138, 255), width=4)
        d.polygon([(x - 45, 180), (x + 45, 180), (x, 260)], fill=(250, 204, 21, 230), outline=(255, 255, 255, 255), width=3)
    mid = mid.filter(ImageFilter.GaussianBlur(0.8))
    mid.save('src/assets/fondo-sanctum.png', 'PNG')

if __name__ == '__main__':
    generate_level5_pantano()
    generate_level6_glaciar()
    generate_level7_laberinto()
    generate_level8_lava()
    generate_level9_ciudadela()
    generate_level10_trono()
    print("=== ALL 3D PAINTERLY BACKGROUNDS & MIDGROUNDS CREATED SUCCESSFULLY ===")
