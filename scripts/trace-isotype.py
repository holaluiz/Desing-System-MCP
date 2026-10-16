"""Trace the LABCaramelo C-dot icon, statically extracted from the supplied EXE.

The extracted PNG is retained as source; regeneration never executes the EXE.
"""
from collections import deque
from pathlib import Path
import json
import math

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
source = Image.open(ROOT / 'artifacts/brand/isotipo-original-lab.png').convert('RGBA')
rgba = np.asarray(source)
# Select the Ink glyph, excluding both the orange tile and transparent corners.
mask = (rgba[:, :, :3].max(axis=2) < 90) & (rgba[:, :, 3] > 127)
height, width = mask.shape
labels = np.zeros(mask.shape, dtype=np.int32)
components = []
for y, x in zip(*np.where(mask)):
    if labels[y, x]:
        continue
    label = len(components) + 1
    labels[y, x] = label
    queue = deque([(int(x), int(y))])
    points = []
    while queue:
        px, py = queue.popleft()
        points.append((px, py))
        for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
            if 0 <= nx < width and 0 <= ny < height and mask[ny, nx] and not labels[ny, nx]:
                labels[ny, nx] = label
                queue.append((nx, ny))
    components.append(points)


def simplify(points, epsilon=.7):
    if len(points) < 3:
        return points
    a, b = np.array(points[0]), np.array(points[-1])
    candidates = np.asarray(points[1:-1])
    if not len(candidates):
        return points
    vector = b - a
    if np.dot(vector, vector):
        projection = np.clip(((candidates - a) @ vector) / np.dot(vector, vector), 0, 1)
        distance = np.linalg.norm(candidates - a - projection[:, None] * vector, axis=1)
    else:
        distance = np.linalg.norm(candidates - a, axis=1)
    index = int(np.argmax(distance)) + 1
    if distance[index - 1] <= epsilon:
        return [points[0], points[-1]]
    return simplify(points[:index + 1], epsilon)[:-1] + simplify(points[index:], epsilon)


def outer_contour(points):
    edges = {}
    pixels = set(points)
    for x, y in points:
        if (x, y - 1) not in pixels:
            edges[(x, y)] = (x + 1, y)
        if (x + 1, y) not in pixels:
            edges[(x + 1, y)] = (x + 1, y + 1)
        if (x, y + 1) not in pixels:
            edges[(x + 1, y + 1)] = (x, y + 1)
        if (x - 1, y) not in pixels:
            edges[(x, y + 1)] = (x, y)
    loops = []
    while edges:
        start = next(iter(edges))
        p = start
        loop = []
        while p in edges:
            loop.append(p)
            p = edges.pop(p)
            if p == start:
                break
        loops.append(loop)
    outline = max(loops, key=len)
    # Average the pixel stair steps before fitting smooth vector curves.
    outline = [tuple(np.mean([outline[(i + k) % len(outline)] for k in range(-4, 5)], axis=0)) for i in range(len(outline))]
    middle = len(outline) // 2
    return simplify(outline[:middle + 1])[:-1] + simplify(outline[middle:] + [outline[0]])[:-1]


large = [p for p in components if len(p) >= 100]
# Keep the original square proportions and negative space. Trace the dot too.
left, top, right, bottom = 0, 0, width, height


def fmt(number):
    return str(round(float(number), 1)).removesuffix('.0')


def path_for(points):
    contour = [(x - left, y - top) for x, y in outer_contour(points)]
    n = len(contour)
    tangent = []
    for i, current in enumerate(contour):
        prev, following = contour[(i - 1) % n], contour[(i + 1) % n]
        # Bound handles by the shorter segment to avoid loops at uneven spacing.
        dx, dy = following[0] - prev[0], following[1] - prev[1]
        length = math.hypot(dx, dy)
        handle = min(math.dist(prev, current), math.dist(current, following)) / 3
        tangent.append((dx / length * handle, dy / length * handle) if length else (0, 0))
    commands = [f'M{fmt(contour[0][0])} {fmt(contour[0][1])}']
    for i in range(n):
        j = (i + 1) % n
        p, q = contour[i], contour[j]
        c1 = (p[0] + tangent[i][0], p[1] + tangent[i][1])
        c2 = (q[0] - tangent[j][0], q[1] - tangent[j][1])
        commands.append('C' + ' '.join(fmt(v) for pair in (c1, c2, q) for v in pair))
    return ''.join(commands) + 'Z'


paths = [path_for(component) for component in sorted(large, key=len, reverse=True)]
dots = []
data = {'viewBox': f'0 0 {width} {height}', 'paths': paths, 'dots': dots, 'tileRadius': 64, 'source': 'artifacts/brand/isotipo-original-lab.png'}
destination = ROOT / 'src' / 'brand'
destination.mkdir(parents=True, exist_ok=True)
(destination / 'isotype-geometry.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
assets = ROOT / 'src' / 'assets' / 'brand'
assets.mkdir(parents=True, exist_ok=True)
stops = ['#FF701A', '#FF3D8D', '#7657FF', '#25BFFF', '#FFD52A']
gradient = '<defs><linearGradient id="caramelo-isotype-spectrum" x1="0%" y1="15%" x2="100%" y2="85%">' + ''.join(f'<stop offset="{offset}%" stop-color="{color}"/>' for offset, color in zip([0, 24, 48, 72, 100], stops)) + '</linearGradient></defs>'
shapes = ''.join(f'<path d="{p}"/>' for p in paths) + ''.join(f'<circle cx="{dot["cx"]}" cy="{dot["cy"]}" r="{dot["r"]}"/>' for dot in dots)
for variant, fill in [('caramel', '#101014'), ('spectrum', 'url(#caramelo-isotype-spectrum)'), ('ink', '#101014'), ('cream', '#FFF4E8')]:
    tile = '<rect width="256" height="256" rx="64" fill="#FF701A"/>' if variant == 'caramel' else ''
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{data["viewBox"]}" role="img" aria-labelledby="caramelo-isotype-title"><title id="caramelo-isotype-title">Um Cara Caramelo</title>{gradient if variant == "spectrum" else ""}{tile}<g fill="{fill}">{shapes}</g></svg>'
    filename = 'isotipo.svg' if variant == 'caramel' else f'isotipo-{variant}.svg'
    (assets / filename).write_text(svg + '\n', encoding='utf-8')
    if variant == 'caramel':
        (ROOT / 'isotipo.svg').write_text(svg + '\n', encoding='utf-8')
print(json.dumps({'viewBox': data['viewBox'], 'paths': len(paths), 'dots': len(dots), 'bytes': sum(map(len, paths)), 'source': [width, height]}))
