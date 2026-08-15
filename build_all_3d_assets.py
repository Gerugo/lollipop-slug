import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

os.makedirs('src/assets', exist_ok=True)

# ----------------------------------------------------------------------
# 3D SHADING ENGINE: VOLUMETRIC HEIGHTMAPS -> 3D NORMALS -> PHONG SHADING
# ----------------------------------------------------------------------

def render_3d_layer(mask_img, base_color=(255, 100, 150), spec_power=28, gloss=0.9, rim_color=(255, 255, 255), is_metallic=False, is_translucent=False, height_scale=18.0, blur_r=6):
    w, h = mask_img.size
    mask_np = np.array(mask_img)
    if len(mask_np.shape) == 3:
        mask_np = mask_np[:, :, 3] if mask_np.shape[2] == 4 else mask_np[:, :, 0]
    
    alpha_mask = mask_np > 10
    
    blurred = Image.fromarray(mask_np).filter(ImageFilter.GaussianBlur(radius=blur_r))
    hmap = np.array(blurred).astype(np.float32) / 255.0
    
    gy, gx = np.gradient(hmap * height_scale)
    nz = 1.0
    norm = np.sqrt(gx**2 + gy**2 + nz**2) + 1e-6
    nx = -gx / norm
    ny = -gy / norm
    nz = nz / norm
    
    lx1, ly1, lz1 = -0.45, -0.65, 0.61
    l1_len = math.sqrt(lx1**2 + ly1**2 + lz1**2)
    lx1, ly1, lz1 = lx1/l1_len, ly1/l1_len, lz1/l1_len
    
    lx2, ly2, lz2 = 0.5, 0.4, 0.77
    l2_len = math.sqrt(lx2**2 + ly2**2 + lz2**2)
    lx2, ly2, lz2 = lx2/l2_len, ly2/l2_len, lz2/l2_len
    
    diffuse = np.maximum(0, nx * lx1 + ny * ly1 + nz * lz1) + 0.35 * np.maximum(0, nx * lx2 + ny * ly2 + nz * lz2)
    total_diffuse = np.maximum(0.25, diffuse)
    
    vx, vy, vz = 0.0, 0.0, 1.0
    hx, hy, hz = lx1 + vx, ly1 + vy, lz1 + vz
    h_len = math.sqrt(hx**2 + hy**2 + hz**2)
    hx, hy, hz = hx/h_len, hy/h_len, hz/h_len
    spec = np.maximum(0, nx * hx + ny * hy + nz * hz)**spec_power
    
    fresnel = np.maximum(0, 1.0 - nz)**2.4
    ao = 0.55 + 0.45 * hmap
    
    r = base_color[0] * total_diffuse * ao + 255 * spec * gloss + rim_color[0] * fresnel * 0.65
    g = base_color[1] * total_diffuse * ao + 255 * spec * gloss + rim_color[1] * fresnel * 0.65
    b = base_color[2] * total_diffuse * ao + 255 * spec * gloss + rim_color[2] * fresnel * 0.65
    
    if is_metallic:
        r = r * 0.65 + 255 * spec * 0.75
        g = g * 0.65 + 255 * spec * 0.75
        b = b * 0.65 + 255 * spec * 0.75
        
    alpha = np.where(alpha_mask, int(base_color[3] if len(base_color) > 3 else 255), 0)
    out_arr = np.dstack((np.clip(r, 0, 255), np.clip(g, 0, 255), np.clip(b, 0, 255), alpha)).astype(np.uint8)
    return Image.fromarray(out_arr, 'RGBA')

def create_mask(size):
    img = Image.new('L', size, 0)
    return img, ImageDraw.Draw(img)

def save_cropped(img, path, is_jpg=False, bg_color=(20, 10, 30)):
    if is_jpg:
        final = Image.new('RGB', img.size, bg_color)
        final.paste(img, (0, 0), img if img.mode == 'RGBA' else None)
        final.save(path, 'JPEG', quality=95)
    else:
        bbox = img.getbbox()
        if bbox:
            cropped = img.crop(bbox)
        else:
            cropped = img
        cropped.save(path, 'PNG')
    print(f"Generated 3D asset: {path}")

# -------------------------------------------------------------
# 1. 3D WEAPONS GENERATION (500x500)
# -------------------------------------------------------------
def generate_3d_weapons():
    W, H = 500, 500
    
    # 1.1 arma_burbujas.png (3D Brass Bubble Cannon with Turquoise Liquid Flask)
    m_body, d_b = create_mask((W, H))
    d_b.rounded_rectangle([100, 210, 380, 310], radius=24, fill=255)
    d_b.ellipse([60, 220, 130, 300], fill=255)
    layer_body = render_3d_layer(m_body, (217, 119, 6), spec_power=36, is_metallic=True)
    
    m_flask, d_f = create_mask((W, H))
    d_f.ellipse([180, 160, 300, 280], fill=255)
    layer_flask = render_3d_layer(m_flask, (6, 182, 212, 220), spec_power=48, is_translucent=True, rim_color=(255, 255, 255))
    
    m_handle, d_h = create_mask((W, H))
    d_h.polygon([(260, 310), (290, 420), (330, 420), (300, 310)], fill=255)
    layer_handle = render_3d_layer(m_handle, (180, 83, 9), spec_power=20)
    
    w_burbujas = Image.alpha_composite(layer_handle, layer_body)
    w_burbujas = Image.alpha_composite(w_burbujas, layer_flask)
    save_cropped(w_burbujas, 'src/assets/arma_burbujas.png')
    
    # 1.2 arma_hielo.png (3D Cryo Freeze Cannon with Ice Battery)
    m_body, d_b = create_mask((W, H))
    d_b.rounded_rectangle([110, 200, 390, 300], radius=20, fill=255)
    d_b.polygon([(60, 250), (120, 210), (120, 290)], fill=255)
    layer_body = render_3d_layer(m_body, (224, 242, 254), spec_power=40, is_metallic=True, rim_color=(56, 189, 248))
    
    m_cryo, d_c = create_mask((W, H))
    d_c.rounded_rectangle([180, 215, 320, 285], radius=16, fill=255)
    layer_cryo = render_3d_layer(m_cryo, (56, 189, 248, 230), spec_power=50, is_translucent=True)
    
    m_grip, d_g = create_mask((W, H))
    d_g.polygon([(270, 300), (300, 410), (340, 410), (310, 300)], fill=255)
    layer_grip = render_3d_layer(m_grip, (15, 23, 42), spec_power=24)
    
    w_hielo = Image.alpha_composite(layer_grip, layer_body)
    w_hielo = Image.alpha_composite(w_hielo, layer_cryo)
    save_cropped(w_hielo, 'src/assets/arma_hielo.png')
    
    # 1.3 arma_laser.png (3D Ruby Prism Laser Rifle)
    m_body, d_b = create_mask((W, H))
    d_b.rounded_rectangle([90, 200, 400, 290], radius=18, fill=255)
    layer_body = render_3d_layer(m_body, (255, 255, 255), spec_power=42, is_metallic=True, rim_color=(244, 63, 94))
    
    m_core, d_c = create_mask((W, H))
    d_c.ellipse([190, 210, 300, 280], fill=255)
    d_c.polygon([(40, 245), (100, 215), (100, 275)], fill=255)
    layer_core = render_3d_layer(m_core, (225, 29, 72, 230), spec_power=55, is_translucent=True)
    
    m_grip, d_g = create_mask((W, H))
    d_g.polygon([(280, 290), (310, 400), (350, 400), (320, 290)], fill=255)
    layer_grip = render_3d_layer(m_grip, (30, 41, 59), spec_power=20)
    
    w_laser = Image.alpha_composite(layer_grip, layer_body)
    w_laser = Image.alpha_composite(w_laser, layer_core)
    save_cropped(w_laser, 'src/assets/arma_laser.png')
    
    # 1.4 arma_flamethrower.png (3D Heavy Industrial Magma Incinerator)
    m_body, d_b = create_mask((W, H))
    d_b.rounded_rectangle([80, 210, 390, 310], radius=22, fill=255)
    d_b.polygon([(50, 210), (90, 230), (90, 290), (50, 310)], fill=255)
    layer_body = render_3d_layer(m_body, (234, 88, 12), spec_power=32, is_metallic=True, rim_color=(254, 215, 170))
    
    m_tank, d_t = create_mask((W, H))
    d_t.ellipse([180, 160, 310, 270], fill=255)
    layer_tank = render_3d_layer(m_tank, (249, 115, 22, 230), spec_power=45, is_translucent=True, rim_color=(255, 255, 255))
    
    m_grip, d_g = create_mask((W, H))
    d_g.polygon([(270, 310), (300, 420), (340, 420), (310, 310)], fill=255)
    layer_grip = render_3d_layer(m_grip, (24, 24, 27), spec_power=20)
    
    w_flame = Image.alpha_composite(layer_grip, layer_body)
    w_flame = Image.alpha_composite(w_flame, layer_tank)
    save_cropped(w_flame, 'src/assets/arma_flamethrower.png')
    
    # 1.5 arma_plasma.png (3D Dark Matter Plasma Rifle with Coils)
    m_body, d_b = create_mask((W, H))
    d_b.rounded_rectangle([90, 190, 400, 310], radius=25, fill=255)
    d_b.ellipse([(50, 220), (110, 280)], fill=255)
    layer_body = render_3d_layer(m_body, (24, 24, 27), spec_power=38, is_metallic=True, rim_color=(225, 29, 72))
    
    m_core, d_c = create_mask((W, H))
    d_c.ellipse([180, 210, 300, 290], fill=255)
    d_c.rounded_rectangle([130, 225, 170, 275], radius=10, fill=255)
    d_c.rounded_rectangle([310, 225, 350, 275], radius=10, fill=255)
    layer_core = render_3d_layer(m_core, (147, 51, 234, 230), spec_power=55, is_translucent=True, rim_color=(253, 164, 175))
    
    m_grip, d_g = create_mask((W, H))
    d_g.polygon([(260, 310), (290, 420), (330, 420), (300, 310)], fill=255)
    layer_grip = render_3d_layer(m_grip, (76, 5, 25), spec_power=25)
    
    w_plasma = Image.alpha_composite(layer_grip, layer_body)
    w_plasma = Image.alpha_composite(w_plasma, layer_core)
    save_cropped(w_plasma, 'src/assets/arma_plasma.png')
    
    # 1.6 arma_cosmic.png (3D Supreme Golden Cosmic Heavy Cannon)
    m_body, d_b = create_mask((W, H))
    d_b.rounded_rectangle([80, 180, 410, 320], radius=28, fill=255)
    d_b.polygon([(40, 250), (90, 200), (90, 300)], fill=255)
    layer_body = render_3d_layer(m_body, (250, 204, 21), spec_power=45, is_metallic=True, rim_color=(255, 255, 255))
    
    m_galaxy, d_ga = create_mask((W, H))
    d_ga.ellipse([170, 200, 320, 300], fill=255)
    layer_galaxy = render_3d_layer(m_galaxy, (236, 72, 153, 230), spec_power=60, is_translucent=True, rim_color=(254, 240, 138))
    
    m_grip, d_g = create_mask((W, H))
    d_g.polygon([(270, 320), (300, 430), (350, 430), (320, 320)], fill=255)
    layer_grip = render_3d_layer(m_grip, (180, 83, 9), spec_power=30, is_metallic=True)
    
    w_cosmic = Image.alpha_composite(layer_grip, layer_body)
    w_cosmic = Image.alpha_composite(w_cosmic, layer_galaxy)
    save_cropped(w_cosmic, 'src/assets/arma_cosmic.png')

# -------------------------------------------------------------
# 2. 3D ENEMIES GENERATION (500x500)
# -------------------------------------------------------------
def generate_3d_enemies():
    W, H = 500, 500
    
    # 2.1 rana.png (3D Glossy Gummy Frog)
    m_body, d_b = create_mask((W, H))
    d_b.ellipse([120, 180, 380, 400], fill=255)
    d_b.ellipse([70, 280, 190, 420], fill=255)
    d_b.ellipse([310, 280, 430, 420], fill=255)
    layer_body = render_3d_layer(m_body, (132, 204, 22), spec_power=38, is_translucent=True, rim_color=(250, 204, 21))
    
    m_belly, d_be = create_mask((W, H))
    d_be.ellipse([160, 250, 340, 380], fill=255)
    layer_belly = render_3d_layer(m_belly, (254, 240, 138), spec_power=45, is_translucent=True)
    
    m_eyes, d_e = create_mask((W, H))
    d_e.ellipse([140, 110, 230, 200], fill=255)
    d_e.ellipse([270, 110, 360, 200], fill=255)
    layer_eyes = render_3d_layer(m_eyes, (255, 255, 255), spec_power=50)
    
    m_pupils, d_p = create_mask((W, H))
    d_p.ellipse([170, 135, 205, 175], fill=255)
    d_p.ellipse([295, 135, 330, 175], fill=255)
    layer_pupils = render_3d_layer(m_pupils, (15, 23, 42), spec_power=60)
    
    e_rana = Image.alpha_composite(layer_body, layer_belly)
    e_rana = Image.alpha_composite(e_rana, layer_eyes)
    e_rana = Image.alpha_composite(e_rana, layer_pupils)
    save_cropped(e_rana, 'src/assets/rana.png')
    
    # 2.2 anguila.png (3D Electric Candy Eel)
    m_body, d_b = create_mask((W, H))
    d_b.rounded_rectangle([80, 180, 420, 320], radius=50, fill=255)
    d_b.polygon([(40, 250), (100, 200), (100, 300)], fill=255)
    layer_body = render_3d_layer(m_body, (14, 165, 233), spec_power=42, is_translucent=True, rim_color=(255, 255, 255))
    
    m_stripes, d_s = create_mask((W, H))
    for x in [150, 220, 290, 360]:
        d_s.rounded_rectangle([x, 190, x + 25, 310], radius=10, fill=255)
    layer_stripes = render_3d_layer(m_stripes, (250, 204, 21), spec_power=55, rim_color=(255, 255, 255))
    
    e_eel = Image.alpha_composite(layer_body, layer_stripes)
    save_cropped(e_eel, 'src/assets/anguila.png')
    
    # 2.3 pinguino.png (3D Hard Candy Penguin)
    m_body, d_b = create_mask((W, H))
    d_b.ellipse([140, 110, 360, 420], fill=255)
    d_b.ellipse([90, 220, 170, 360], fill=255)
    d_b.ellipse([330, 220, 410, 360], fill=255)
    layer_body = render_3d_layer(m_body, (24, 24, 27), spec_power=36, rim_color=(56, 189, 248))
    
    m_belly, d_be = create_mask((W, H))
    d_be.ellipse([180, 200, 320, 400], fill=255)
    layer_belly = render_3d_layer(m_belly, (240, 249, 255), spec_power=45, rim_color=(186, 230, 253))
    
    m_beak, d_bk = create_mask((W, H))
    d_bk.polygon([(250, 230), (200, 280), (300, 280)], fill=255)
    layer_beak = render_3d_layer(m_beak, (249, 115, 22), spec_power=40)
    
    e_ping = Image.alpha_composite(layer_body, layer_belly)
    e_ping = Image.alpha_composite(e_ping, layer_beak)
    save_cropped(e_ping, 'src/assets/pinguino.png')
    
    # 2.4 yeti.png (3D Cotton Candy Yeti)
    m_body, d_b = create_mask((W, H))
    d_b.ellipse([120, 140, 380, 420], fill=255)
    d_b.ellipse([60, 160, 200, 340], fill=255)
    d_b.ellipse([300, 160, 440, 340], fill=255)
    layer_body = render_3d_layer(m_body, (186, 230, 253), spec_power=25, rim_color=(255, 255, 255))
    
    m_face, d_f = create_mask((W, H))
    d_f.ellipse([170, 180, 330, 310], fill=255)
    layer_face = render_3d_layer(m_face, (14, 165, 233), spec_power=30)
    
    m_horns, d_h = create_mask((W, H))
    d_h.polygon([(150, 160), (120, 80), (190, 130)], fill=255)
    d_h.polygon([(350, 160), (380, 80), (310, 130)], fill=255)
    layer_horns = render_3d_layer(m_horns, (253, 224, 71), spec_power=45)
    
    e_yeti = Image.alpha_composite(layer_horns, layer_body)
    e_yeti = Image.alpha_composite(e_yeti, layer_face)
    save_cropped(e_yeti, 'src/assets/yeti.png')
    
    # 2.5 murcielago.png (3D Ruby Jelly Bat)
    m_wings, d_w = create_mask((W, H))
    d_w.polygon([(250, 250), (60, 140), (110, 300), (190, 280)], fill=255)
    d_w.polygon([(250, 250), (440, 140), (390, 300), (310, 280)], fill=255)
    layer_wings = render_3d_layer(m_wings, (159, 18, 57, 220), spec_power=48, is_translucent=True, rim_color=(251, 113, 133))
    
    m_body, d_b = create_mask((W, H))
    d_b.ellipse([190, 180, 310, 340], fill=255)
    d_b.polygon([(200, 190), (180, 120), (230, 170)], fill=255)
    d_b.polygon([(300, 190), (320, 120), (270, 170)], fill=255)
    layer_body = render_3d_layer(m_body, (225, 29, 72), spec_power=40, rim_color=(255, 255, 255))
    
    e_bat = Image.alpha_composite(layer_wings, layer_body)
    save_cropped(e_bat, 'src/assets/murcielago.png')
    
    # 2.6 slime.png (3D Acid Gummy Slime)
    m_body, d_b = create_mask((W, H))
    d_b.ellipse([100, 180, 400, 420], fill=255)
    layer_body = render_3d_layer(m_body, (217, 70, 239, 230), spec_power=55, is_translucent=True, rim_color=(255, 255, 255))
    
    m_core, d_c = create_mask((W, H))
    d_c.ellipse([180, 260, 320, 370], fill=255)
    layer_core = render_3d_layer(m_core, (250, 204, 21), spec_power=60)
    
    e_slime = Image.alpha_composite(layer_body, layer_core)
    save_cropped(e_slime, 'src/assets/slime.png')
    
    # 2.7 salamandra.png (3D Molten Sugar Salamander)
    m_body, d_b = create_mask((W, H))
    d_b.ellipse([110, 180, 390, 340], fill=255)
    d_b.polygon([(60, 260), (140, 210), (140, 310)], fill=255)
    layer_body = render_3d_layer(m_body, (234, 88, 12), spec_power=38, rim_color=(254, 215, 170))
    
    m_spines, d_s = create_mask((W, H))
    for x in [180, 240, 300, 350]:
        d_s.polygon([(x, 180), (x+15, 130), (x+30, 180)], fill=255)
    layer_spines = render_3d_layer(m_spines, (250, 204, 21), spec_power=50)
    
    e_sal = Image.alpha_composite(layer_body, layer_spines)
    save_cropped(e_sal, 'src/assets/salamandra.png')
    
    # 2.8 avispa.png (3D Burnt Caramel Wasp)
    m_body, d_b = create_mask((W, H))
    d_b.ellipse([180, 150, 320, 310], fill=255)
    d_b.ellipse([210, 290, 290, 420], fill=255)
    d_b.polygon([(240, 410), (250, 470), (260, 410)], fill=255)
    layer_body = render_3d_layer(m_body, (245, 158, 11), spec_power=40, rim_color=(254, 240, 138))
    
    m_wings, d_w = create_mask((W, H))
    d_w.ellipse([80, 100, 220, 250], fill=255)
    d_w.ellipse([280, 100, 420, 250], fill=255)
    layer_wings = render_3d_layer(m_wings, (255, 255, 255, 180), spec_power=60, is_translucent=True)
    
    e_wasp = Image.alpha_composite(layer_wings, layer_body)
    save_cropped(e_wasp, 'src/assets/avispa.png')
    
    # 2.9 gargola.png (3D Dark Chocolate Gargoyle)
    m_wings, d_w = create_mask((W, H))
    d_w.polygon([(250, 250), (60, 100), (120, 280)], fill=255)
    d_w.polygon([(250, 250), (440, 100), (380, 280)], fill=255)
    layer_wings = render_3d_layer(m_wings, (39, 39, 42), spec_power=32, rim_color=(225, 29, 72))
    
    m_body, d_b = create_mask((W, H))
    d_b.ellipse([170, 160, 330, 380], fill=255)
    d_b.polygon([(180, 180), (150, 90), (220, 150)], fill=255)
    d_b.polygon([(320, 180), (350, 90), (280, 150)], fill=255)
    layer_body = render_3d_layer(m_body, (24, 24, 27), spec_power=36, is_metallic=True, rim_color=(225, 29, 72))
    
    e_gar = Image.alpha_composite(layer_wings, layer_body)
    save_cropped(e_gar, 'src/assets/gargola.png')
    
    # 2.10 guardia_real.png (3D Royal Candy Knight with Tower Shield)
    m_body, d_b = create_mask((W, H))
    d_b.rounded_rectangle([180, 120, 320, 420], radius=24, fill=255)
    layer_body = render_3d_layer(m_body, (120, 53, 15), spec_power=35, is_metallic=True, rim_color=(254, 240, 138))
    
    m_shield, d_s = create_mask((W, H))
    d_s.rounded_rectangle([80, 160, 220, 430], radius=30, fill=255)
    layer_shield = render_3d_layer(m_shield, (217, 119, 6), spec_power=48, is_metallic=True, rim_color=(254, 240, 138))
    
    m_lance, d_l = create_mask((W, H))
    d_l.polygon([(330, 430), (370, 60), (390, 60), (350, 430)], fill=255)
    layer_lance = render_3d_layer(m_lance, (225, 29, 72), spec_power=50)
    
    e_guard = Image.alpha_composite(layer_body, layer_lance)
    e_guard = Image.alpha_composite(e_guard, layer_shield)
    save_cropped(e_guard, 'src/assets/guardia_real.png')
    
    # 2.11 hechicero.png (3D Dark Candy Sorcerer)
    m_robes, d_r = create_mask((W, H))
    d_r.polygon([(250, 120), (120, 430), (380, 430)], fill=255)
    d_r.polygon([(250, 80), (170, 220), (330, 220)], fill=255)
    layer_robes = render_3d_layer(m_robes, (88, 28, 135), spec_power=30, rim_color=(250, 204, 21))
    
    m_staff, d_st = create_mask((W, H))
    d_st.polygon([(360, 430), (400, 120), (415, 120), (375, 430)], fill=255)
    d_st.ellipse([375, 80, 440, 145], fill=255)
    layer_staff = render_3d_layer(m_staff, (245, 158, 11), spec_power=55)
    
    e_sor = Image.alpha_composite(layer_robes, layer_staff)
    save_cropped(e_sor, 'src/assets/hechicero.png')

# -------------------------------------------------------------
# 3. 3D BOSSES GENERATION (650x650)
# -------------------------------------------------------------
def generate_3d_bosses():
    W, H = 650, 650
    
    # 3.1 boss5.png (3D Giant Translucent Soda Jellyfish)
    m_bell, d_b = create_mask((W, H))
    d_b.ellipse([120, 80, 530, 380], fill=255)
    layer_bell = render_3d_layer(m_bell, (6, 182, 212, 220), spec_power=50, is_translucent=True, rim_color=(255, 255, 255))
    
    m_core, d_c = create_mask((W, H))
    d_c.ellipse([220, 160, 430, 310], fill=255)
    layer_core = render_3d_layer(m_core, (236, 72, 153), spec_power=60)
    
    m_tentacles, d_t = create_mask((W, H))
    for x in [180, 240, 300, 360, 420, 480]:
        d_t.rounded_rectangle([x - 12, 340, x + 12, 580], radius=12, fill=255)
    layer_tentacles = render_3d_layer(m_tentacles, (14, 165, 233, 200), spec_power=40, is_translucent=True)
    
    b5 = Image.alpha_composite(layer_tentacles, layer_bell)
    b5 = Image.alpha_composite(b5, layer_core)
    save_cropped(b5, 'src/assets/boss5.png')
    
    # 3.2 boss6.png (3D Massive Frost Candy Golem)
    m_body, d_b = create_mask((W, H))
    d_b.rounded_rectangle([160, 180, 490, 520], radius=40, fill=255)
    d_b.ellipse([80, 220, 220, 440], fill=255)
    d_b.ellipse([430, 220, 570, 440], fill=255)
    layer_body = render_3d_layer(m_body, (186, 230, 253), spec_power=38, is_metallic=True, rim_color=(255, 255, 255))
    
    m_head, d_h = create_mask((W, H))
    d_h.rounded_rectangle([220, 90, 430, 240], radius=30, fill=255)
    d_h.polygon([(180, 120), (140, 40), (240, 90)], fill=255)
    d_h.polygon([(470, 120), (510, 40), (410, 90)], fill=255)
    layer_head = render_3d_layer(m_head, (224, 242, 254), spec_power=45, rim_color=(56, 189, 248))
    
    m_eyes, d_e = create_mask((W, H))
    d_e.rounded_rectangle([260, 155, 390, 180], radius=10, fill=255)
    layer_eyes = render_3d_layer(m_eyes, (2, 132, 199), spec_power=60)
    
    b6 = Image.alpha_composite(layer_body, layer_head)
    b6 = Image.alpha_composite(b6, layer_eyes)
    save_cropped(b6, 'src/assets/boss6.png')
    
    # 3.3 boss7.png (3D Giant Gummy Centipede)
    m_body, d_b = create_mask((W, H))
    for i, x in enumerate([140, 230, 320, 410, 500]):
        d_b.ellipse([x - 65, 240, x + 65, 410], fill=255)
    layer_body = render_3d_layer(m_body, (225, 29, 72, 230), spec_power=48, is_translucent=True, rim_color=(251, 191, 36))
    
    m_head, d_h = create_mask((W, H))
    d_h.ellipse([70, 200, 210, 380], fill=255)
    d_h.polygon([(60, 220), (10, 160), (90, 200)], fill=255)
    d_h.polygon([(60, 360), (10, 420), (90, 380)], fill=255)
    layer_head = render_3d_layer(m_head, (168, 85, 247), spec_power=52)
    
    b7 = Image.alpha_composite(layer_body, layer_head)
    save_cropped(b7, 'src/assets/boss7.png')
    
    # 3.4 boss8.png (3D Molten Caramel Dragon)
    m_body, d_b = create_mask((W, H))
    d_b.ellipse([180, 200, 480, 500], fill=255)
    d_b.polygon([(260, 220), (160, 100), (320, 120)], fill=255)
    layer_body = render_3d_layer(m_body, (234, 88, 12), spec_power=38, is_metallic=True, rim_color=(254, 215, 170))
    
    m_wings, d_w = create_mask((W, H))
    d_w.polygon([(280, 260), (60, 60), (160, 320)], fill=255)
    d_w.polygon([(370, 260), (590, 60), (490, 320)], fill=255)
    layer_wings = render_3d_layer(m_wings, (194, 65, 12), spec_power=45, rim_color=(251, 191, 36))
    
    m_chest, d_c = create_mask((W, H))
    d_c.ellipse([240, 270, 420, 460], fill=255)
    layer_chest = render_3d_layer(m_chest, (245, 158, 11), spec_power=55)
    
    b8 = Image.alpha_composite(layer_wings, layer_body)
    b8 = Image.alpha_composite(b8, layer_chest)
    save_cropped(b8, 'src/assets/boss8.png')
    
    # 3.5 boss9.png (3D Black Licorice Knight)
    m_body, d_b = create_mask((W, H))
    d_b.rounded_rectangle([200, 180, 450, 540], radius=40, fill=255)
    d_b.ellipse([240, 90, 410, 240], fill=255)
    layer_body = render_3d_layer(m_body, (24, 24, 27), spec_power=42, is_metallic=True, rim_color=(225, 29, 72))
    
    m_sword, d_s = create_mask((W, H))
    d_s.polygon([(110, 560), (140, 80), (165, 80), (135, 560)], fill=255)
    d_s.rounded_rectangle([70, 430, 205, 470], radius=15, fill=255)
    layer_sword = render_3d_layer(m_sword, (225, 29, 72), spec_power=55, is_metallic=True, rim_color=(255, 255, 255))
    
    m_cape, d_c = create_mask((W, H))
    d_c.polygon([(220, 200), (130, 540), (300, 520)], fill=255)
    d_c.polygon([(430, 200), (520, 540), (350, 520)], fill=255)
    layer_cape = render_3d_layer(m_cape, (159, 18, 57), spec_power=25)
    
    b9 = Image.alpha_composite(layer_cape, layer_body)
    b9 = Image.alpha_composite(b9, layer_sword)
    save_cropped(b9, 'src/assets/boss9.png')
    
    # 3.6 boss10.png (3D Rey Amargo in Supreme Golden Mecha Throne)
    m_throne, d_t = create_mask((W, H))
    d_t.polygon([(325, 60), (140, 220), (180, 520), (470, 520), (510, 220)], fill=255)
    d_t.rounded_rectangle([90, 260, 180, 460], radius=24, fill=255)
    d_t.rounded_rectangle([470, 260, 560, 460], radius=24, fill=255)
    layer_throne = render_3d_layer(m_throne, (217, 119, 6), spec_power=48, is_metallic=True, rim_color=(254, 240, 138))
    
    m_king, d_k = create_mask((W, H))
    d_k.ellipse([230, 210, 420, 450], fill=255)
    d_k.ellipse([260, 140, 390, 260], fill=255)
    d_k.polygon([(250, 150), (250, 70), (285, 110), (325, 55), (365, 110), (400, 70), (400, 150)], fill=255)
    layer_king = render_3d_layer(m_king, (250, 204, 21), spec_power=45, is_metallic=True, rim_color=(255, 255, 255))
    
    m_rubies, d_r = create_mask((W, H))
    for p in [(220, 170), (325, 95), (430, 170), (325, 280)]:
        d_r.polygon([(p[0], p[1]-30), (p[0]+25, p[1]), (p[0], p[1]+30), (p[0]-25, p[1])], fill=255)
    layer_rubies = render_3d_layer(m_rubies, (225, 29, 72), spec_power=60)
    
    b10 = Image.alpha_composite(layer_throne, layer_king)
    b10 = Image.alpha_composite(b10, layer_rubies)
    save_cropped(b10, 'src/assets/boss10.png')

# -------------------------------------------------------------
# 4. 3D BACKGROUNDS & PARALLAX LAYERS (1376x768)
# -------------------------------------------------------------
def generate_3d_backgrounds():
    W, H = 1376, 768
    
    # 4.1 fondo-canas.png (Level 5: 3D Translucent Sugar Canes & Giant Bubbles Layer)
    canas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for x in range(60, W + 100, 160):
        m_cane, d_c = create_mask((W, H))
        d_c.rounded_rectangle([x - 18, 0, x + 18, H], radius=16, fill=255)
        for y in range(80, H, 100):
            d_c.line([(x - 22, y), (x + 22, y)], fill=0, width=6)
        cane_layer = render_3d_layer(m_cane, (132, 204, 22, 230), spec_power=38, is_translucent=True, rim_color=(254, 240, 138))
        canas = Image.alpha_composite(canas, cane_layer)
        
        m_bub, d_b = create_mask((W, H))
        by = (x * 37) % (H - 200) + 100
        d_b.ellipse([x - 30, by - 30, x + 30, by + 30], fill=255)
        bub_layer = render_3d_layer(m_bub, (6, 182, 212, 190), spec_power=55, is_translucent=True)
        canas = Image.alpha_composite(canas, bub_layer)
    canas.save('src/assets/fondo-canas.png', 'PNG')
    print("Generated 3D asset: src/assets/fondo-canas.png")
    
    # 4.2 fondo-cumbres.jpg (Level 6: 3D Glacier Mountains Horizon)
    m_mount, d_m = create_mask((W, H))
    d_m.polygon([(0, H), (0, 380), (250, 180), (520, 420), (820, 140), (1120, 440), (1376, 220), (1376, H)], fill=255)
    layer_mount = render_3d_layer(m_mount, (186, 230, 253), spec_power=40, is_metallic=True, rim_color=(255, 255, 255), blur_r=12)
    save_cropped(layer_mount, 'src/assets/fondo-cumbres.jpg', is_jpg=True, bg_color=(15, 23, 42))
    
    # 4.3 fondo-glaciar.png (Level 6: 3D Ice Stalagmites Layer)
    glaciar = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for x in range(80, W, 200):
        m_spire, d_s = create_mask((W, H))
        d_s.polygon([(x - 45, H), (x, H - 320), (x + 45, H)], fill=255)
        d_s.polygon([(x + 40, 0), (x + 70, 180), (x + 100, 0)], fill=255)
        spire_layer = render_3d_layer(m_spire, (224, 242, 254, 240), spec_power=45, is_translucent=True, rim_color=(56, 189, 248))
        glaciar = Image.alpha_composite(glaciar, spire_layer)
    glaciar.save('src/assets/fondo-glaciar.png', 'PNG')
    print("Generated 3D asset: src/assets/fondo-glaciar.png")
    
    # 4.4 fondo-laberinto.jpg (Level 7: 3D Neon Gummy Labyrinth)
    m_lab, d_l = create_mask((W, H))
    for x in range(120, W, 220):
        d_l.rounded_rectangle([x, 150, x + 120, H], radius=40, fill=255)
    layer_lab = render_3d_layer(m_lab, (190, 24, 93), spec_power=42, is_translucent=True, rim_color=(244, 114, 182), blur_r=10)
    save_cropped(layer_lab, 'src/assets/fondo-laberinto.jpg', is_jpg=True, bg_color=(24, 10, 35))
    
    # 4.5 fondo-gelatina.png (Level 7: 3D Gummy Arches Layer)
    gelatina = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for x in range(100, W, 280):
        m_arch, d_a = create_mask((W, H))
        d_a.rounded_rectangle([x - 30, H - 350, x + 30, H], radius=24, fill=255)
        d_a.ellipse([x - 80, H - 380, x + 80, H - 260], fill=255)
        arch_layer = render_3d_layer(m_arch, (217, 70, 239, 230), spec_power=50, is_translucent=True, rim_color=(255, 255, 255))
        gelatina = Image.alpha_composite(gelatina, arch_layer)
    gelatina.save('src/assets/fondo-gelatina.png', 'PNG')
    print("Generated 3D asset: src/assets/fondo-gelatina.png")
    
    # 4.6 fondo-lava.jpg (Level 8: 3D Molten Caramel Volcano Horizon)
    m_volc, d_v = create_mask((W, H))
    d_v.polygon([(0, H), (0, 420), (320, 200), (680, 460), (1050, 160), (1376, 380), (1376, H)], fill=255)
    layer_volc = render_3d_layer(m_volc, (124, 45, 18), spec_power=35, is_metallic=True, rim_color=(251, 146, 60), blur_r=12)
    save_cropped(layer_volc, 'src/assets/fondo-lava.jpg', is_jpg=True, bg_color=(35, 10, 5))
    
    # 4.7 fondo-volcan.png (Level 8: 3D Molten Caramel Pillars Layer)
    volcan = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for x in range(80, W, 220):
        m_rock, d_r = create_mask((W, H))
        d_r.rounded_rectangle([x - 35, H - 340, x + 35, H], radius=25, fill=255)
        d_r.polygon([(x - 20, 0), (x, 160), (x + 20, 0)], fill=255)
        rock_layer = render_3d_layer(m_rock, (234, 88, 12), spec_power=40, rim_color=(254, 215, 170))
        volcan = Image.alpha_composite(volcan, rock_layer)
    volcan.save('src/assets/fondo-volcan.png', 'PNG')
    print("Generated 3D asset: src/assets/fondo-volcan.png")
    
    # 4.8 fondo-ciudadela.jpg (Level 9: 3D Gothic Chocolate Citadel)
    m_cit, d_c = create_mask((W, H))
    for x in [150, 420, 680, 950, 1220]:
        d_c.rounded_rectangle([x - 50, 220, x + 50, H], radius=20, fill=255)
        d_c.polygon([(x - 60, 220), (x, 120), (x + 60, 220)], fill=255)
    layer_cit = render_3d_layer(m_cit, (24, 24, 27), spec_power=38, is_metallic=True, rim_color=(225, 29, 72), blur_r=10)
    save_cropped(layer_cit, 'src/assets/fondo-ciudadela.jpg', is_jpg=True, bg_color=(15, 10, 20))
    
    # 4.9 fondo-murallas.png (Level 9: 3D Chocolate Ramparts Layer)
    murallas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for x in range(60, W, 180):
        m_wall, d_w = create_mask((W, H))
        d_w.rounded_rectangle([x - 30, H - 280, x + 30, H], radius=20, fill=255)
        d_w.rounded_rectangle([x - 40, H - 320, x + 40, H - 270], radius=15, fill=255)
        wall_layer = render_3d_layer(m_wall, (39, 39, 42), spec_power=35, is_metallic=True, rim_color=(225, 29, 72))
        murallas = Image.alpha_composite(murallas, wall_layer)
    murallas.save('src/assets/fondo-murallas.png', 'PNG')
    print("Generated 3D asset: src/assets/fondo-murallas.png")
    
    # 4.10 fondo-trono.jpg (Level 10: 3D Golden Throne Cathedral Sanctum)
    m_cathedral, d_ca = create_mask((W, H))
    d_ca.ellipse([W//2 - 200, 100, W//2 + 200, 500], fill=255)
    for x in [120, 320, W - 320, W - 120]:
        d_ca.rounded_rectangle([x - 40, 150, x + 40, H], radius=25, fill=255)
    layer_cathedral = render_3d_layer(m_cathedral, (217, 119, 6), spec_power=45, is_metallic=True, rim_color=(254, 240, 138), blur_r=12)
    save_cropped(layer_cathedral, 'src/assets/fondo-trono.jpg', is_jpg=True, bg_color=(25, 10, 35))
    
    # 4.11 fondo-sanctum.png (Level 10: 3D Golden Arch Columns & Chandeliers Layer)
    sanctum = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for x in range(120, W, 280):
        m_sanc, d_s = create_mask((W, H))
        d_s.rounded_rectangle([x - 28, H - 360, x + 28, H], radius=20, fill=255)
        d_s.polygon([(x - 50, 200), (x + 50, 200), (x, 270)], fill=255)
        d_s.rounded_rectangle([x - 5, 0, x + 5, 200], radius=5, fill=255)
        sanc_layer = render_3d_layer(m_sanc, (250, 204, 21), spec_power=50, is_metallic=True, rim_color=(255, 255, 255))
        sanctum = Image.alpha_composite(sanctum, sanc_layer)
    sanctum.save('src/assets/fondo-sanctum.png', 'PNG')
    print("Generated 3D asset: src/assets/fondo-sanctum.png")

if __name__ == '__main__':
    print("--- GENERATING 3D WEAPONS ---")
    generate_3d_weapons()
    print("--- GENERATING 3D ENEMIES ---")
    generate_3d_enemies()
    print("--- GENERATING 3D BOSSES ---")
    generate_3d_bosses()
    print("--- GENERATING 3D BACKGROUNDS ---")
    generate_3d_backgrounds()
    print("=== ALL 3D 2.5D ASSETS GENERATED SUCCESSFULLY ===")
