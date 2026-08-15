import os
from PIL import Image, ImageFilter
import collections

ASSETS_DIR = r"src\assets"

def make_clean_transparent(input_path, output_path=None, tolerance=38, feather=1.2):
    """
    Removes white / solid background from sprites by flood-filling from the borders
    and smoothly feathering the edges.
    """
    if output_path is None:
        output_path = input_path

    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # Sample corners to find background color
    corners = [
        pixels[0, 0], pixels[width - 1, 0],
        pixels[0, height - 1], pixels[width - 1, height - 1],
        pixels[width // 2, 0], pixels[0, height // 2], pixels[width - 1, height // 2],
        pixels[width // 2, height - 1]
    ]
    bg_r = sum(c[0] for c in corners) // len(corners)
    bg_g = sum(c[1] for c in corners) // len(corners)
    bg_b = sum(c[2] for c in corners) // len(corners)

    visited = bytearray(width * height)
    queue = collections.deque()

    def is_bg(r, g, b, a):
        if a == 0:
            return True
        dist = ((r - bg_r) ** 2 + (g - bg_g) ** 2 + (b - bg_b) ** 2) ** 0.5
        if bg_r > 210 and bg_g > 210 and bg_b > 210:
            if r > 225 and g > 225 and b > 225:
                return True
        return dist <= tolerance

    # Seed all borders
    for x in range(width):
        for y in (0, height - 1):
            idx = y * width + x
            r, g, b, a = pixels[x, y]
            if is_bg(r, g, b, a):
                visited[idx] = 1
                queue.append((x, y))

    for y in range(height):
        for x in (0, width - 1):
            idx = y * width + x
            if not visited[idx]:
                r, g, b, a = pixels[x, y]
                if is_bg(r, g, b, a):
                    visited[idx] = 1
                    queue.append((x, y))

    # BFS Flood fill
    while queue:
        cx, cy = queue.popleft()
        for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
            if 0 <= nx < width and 0 <= ny < height:
                nidx = ny * width + nx
                if not visited[nidx]:
                    nr, ng, nb, na = pixels[nx, ny]
                    if is_bg(nr, ng, nb, na):
                        visited[nidx] = 1
                        queue.append((nx, ny))

    # Build mask
    mask = Image.new("L", (width, height), 255)
    mask_pixels = mask.load()
    for y in range(height):
        for x in range(width):
            if visited[y * width + x]:
                mask_pixels[x, y] = 0
            else:
                # Also preserve existing alpha
                mask_pixels[x, y] = min(mask_pixels[x, y], pixels[x, y][3])

    if feather > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(feather))

    img.putalpha(mask)
    
    # Auto-crop empty borders
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")
    print(f"[CLEANED TRANSPARENCY] {os.path.basename(output_path)} -> Size: {img.size}")

# Process all sprite assets in src/assets
for filename in sorted(os.listdir(ASSETS_DIR)):
    if filename.endswith(".png") and not filename.startswith("fondo"):
        file_path = os.path.join(ASSETS_DIR, filename)
        make_clean_transparent(file_path, file_path)
