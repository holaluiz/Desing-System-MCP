from pathlib import Path
from PIL import Image, ImageFilter, ImageDraw
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'src/assets/stickers'
OUT.mkdir(parents=True, exist_ok=True)
source = Image.open(ROOT / 'rastro mouse.png').convert('RGBA')
alpha = source.getchannel('A')

def components(mask, with_labels=False):
    pixels = np.asarray(mask).copy()
    height, width = pixels.shape
    labels = np.zeros((height, width), dtype=np.int32)
    regions = []
    label = 0
    for y in range(height):
        for x in range(width):
            if not pixels[y, x] or labels[y, x]:
                continue
            label += 1
            todo = [(x, y)]
            labels[y, x] = label
            xmin = xmax = x
            ymin = ymax = y
            count = 0
            while todo:
                px, py = todo.pop()
                count += 1
                xmin = min(xmin, px)
                xmax = max(xmax, px)
                ymin = min(ymin, py)
                ymax = max(ymax, py)
                for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                    if 0 <= nx < width and 0 <= ny < height and pixels[ny, nx] and not labels[ny, nx]:
                        labels[ny, nx] = label
                        todo.append((nx, ny))
            if count > 100:
                regions.append((count, (xmin, ymin, xmax + 1, ymax + 1), label))
    regions = sorted(regions, reverse=True)
    return (regions, labels) if with_labels else regions

if __name__ == '__main__':
    for radius in (1, 3, 5, 9):
        mask = alpha.point(lambda v: 255 if v > 128 else 0)
        if radius > 1:
            mask = mask.filter(ImageFilter.MinFilter(radius))
        regions = components(mask)
        print(radius, len(regions), regions[:35])
