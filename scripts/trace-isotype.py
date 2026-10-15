"""Trace the supplied ink mark into compact SVG paths without embedding the PNG."""
from collections import deque
from pathlib import Path
import json
import math

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
gray = Image.open(ROOT / 'isotipo.png').convert('L')
# Closing joins the ink's small print pits while preserving its outer silhouette.
ink = gray.point(lambda p: 255 if p < 130 else 0).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
mask = np.asarray(ink) > 0
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


def simplify(points, epsilon=1.5):
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
    middle = len(outline) // 2
    return simplify(outline[:middle + 1])[:-1] + simplify(outline[middle:] + [outline[0]])[:-1]


large = [p for p in components if len(p) >= 1500]
small = [p for p in components if 60 <= len(p) < 1500]
all_points = [point for component in large + small for point in component]
left, top = min(p[0] for p in all_points) - 14, min(p[1] for p in all_points) - 14
right, bottom = max(p[0] for p in all_points) + 15, max(p[1] for p in all_points) + 15


def fmt(number):
    return str(round(float(number), 1)).removesuffix('.0')


def path_for(points):
    contour = [(x - left, y - top) for x, y in outer_contour(points)]
    n = len(contour)
    tangent = []
    for i, current in enumerate(contour):
        prev, following = contour[(i - 1) % n], contour[(i + 1) % n]
        a = (current[0] - prev[0], current[1] - prev[1])
        b = (following[0] - current[0], following[1] - current[1])
        lengths = math.hypot(*a) * math.hypot(*b)
        sharp = lengths and (a[0] * b[0] + a[1] * b[1]) / lengths < .35
        tangent.append((0, 0) if sharp else ((following[0] - prev[0]) * .13, (following[1] - prev[1]) * .13))
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
for points in sorted(small, key=len, reverse=True):
    xs, ys = zip(*points)
    dots.append({'cx': round(sum(xs) / len(xs) - left, 1), 'cy': round(sum(ys) / len(ys) - top, 1), 'r': round(math.sqrt(len(points) / math.pi), 1)})

data = {'viewBox': f'0 0 {right - left} {bottom - top}', 'paths': paths, 'dots': dots, 'source': 'isotipo.png'}
destination = ROOT / 'src' / 'brand'
destination.mkdir(parents=True, exist_ok=True)
(destination / 'isotype-geometry.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
assets = ROOT / 'src' / 'assets' / 'brand'
assets.mkdir(parents=True, exist_ok=True)
stops = ['#FF701A', '#FF3D8D', '#7657FF', '#25BFFF', '#FFD52A']
gradient = '<defs><linearGradient id="caramelo-isotype-spectrum" x1="0%" y1="15%" x2="100%" y2="85%">' + ''.join(f'<stop offset="{offset}%" stop-color="{color}"/>' for offset, color in zip([0, 24, 48, 72, 100], stops)) + '</linearGradient></defs>'
shapes = ''.join(f'<path d="{p}"/>' for p in paths) + ''.join(f'<circle cx="{dot["cx"]}" cy="{dot["cy"]}" r="{dot["r"]}"/>' for dot in dots)
for variant, fill in [('spectrum', 'url(#caramelo-isotype-spectrum)'), ('ink', '#101014'), ('cream', '#FFF4E8')]:
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{data["viewBox"]}" role="img" aria-labelledby="caramelo-isotype-title"><title id="caramelo-isotype-title">Um Cara Caramelo</title>{gradient if variant == "spectrum" else ""}<g fill="{fill}">{shapes}</g></svg>'
    filename = 'isotipo.svg' if variant == 'spectrum' else f'isotipo-{variant}.svg'
    (assets / filename).write_text(svg + '\n', encoding='utf-8')
    if variant == 'spectrum':
        (ROOT / 'isotipo.svg').write_text(svg + '\n', encoding='utf-8')
print(json.dumps({'viewBox': data['viewBox'], 'paths': len(paths), 'dots': len(dots), 'bytes': sum(map(len, paths)), 'source': [width, height]}))
