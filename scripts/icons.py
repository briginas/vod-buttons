"""Rasterize our simple geometric icon with supersampling; no external dependencies."""
from pathlib import Path
import struct
import zlib

root = Path(__file__).resolve().parents[1]
target = root / 'extension/icons'
target.mkdir(exist_ok=True)
polygons = [ [(51,32),(19,64),(51,96),(51,77),(38,64),(51,51)],
             [(77,32),(109,64),(77,96),(77,77),(90,64),(77,51)] ]

def inside(x, y, points):
    result = False
    previous = points[-1]
    for current in points:
        ax, ay = previous
        bx, by = current
        if (ay > y) != (by > y) and x < (bx-ax)*(y-ay)/(by-ay)+ax:
            result = not result
        previous = current
    return result

def color(x, y):
    x, y = (x-12.8)/.8, (y-12.8)/.8
    if not (4 <= x <= 124 and 4 <= y <= 124):
        return (0,0,0,0)
    cx, cy = min(96,max(32,x)), min(96,max(32,y))
    if (x-cx)**2 + (y-cy)**2 > 28**2:
        return (0,0,0,0)
    return (255,255,255,255) if any(inside(x,y,p) for p in polygons) else (117,64,188,255)

def chunk(kind, data):
    return struct.pack('!I',len(data))+kind+data+struct.pack('!I',zlib.crc32(kind+data)&0xffffffff)

for size in [16,32,48,128]:
    rows = bytearray()
    for y in range(size):
        rows.append(0)
        for x in range(size):
            samples = [color((x+(sx+.5)/4)*128/size, (y+(sy+.5)/4)*128/size) for sy in range(4) for sx in range(4)]
            alpha = sum(c[3] for c in samples)
            rgb = [round(sum(c[i]*c[3] for c in samples)/alpha) if alpha else 0 for i in range(3)]
            rows.extend(rgb+[round(alpha/16)])
    png = b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',size,size,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(rows))+chunk(b'IEND',b'')
    (target / f'{size}.png').write_bytes(png)
print('Generated four PNG icons from the geometry in assets/icon.svg')
