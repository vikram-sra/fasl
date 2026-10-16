"""Build runtime maps from the CC0 sets in assets/src/cc0/ (see cc0.json). Run inside Blender:

    /Applications/Blender.app/Contents/MacOS/Blender -b --python assets/src/cc0.py

Writes assets/build/<id>.albedo.png / .normal.png / .orm.png (R=AO, G=roughness) in the same layout
as process.py, so pack.py and the renderer treat generated and CC0 maps identically.
"""
import glob, json
from pathlib import Path
import bpy, numpy as np

HERE = Path(__file__).resolve().parent
BUILD = HERE.parent / 'build'
spec = json.loads((HERE / 'cc0.json').read_text())


def load(path, noncolor=False):
    img = bpy.data.images.load(str(path))
    if noncolor:
        img.colorspace_settings.name = 'Non-Color'
    w, h = img.size
    a = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)
    bpy.data.images.remove(img)
    return a


def save(a, path):
    h, w = a.shape[:2]
    img = bpy.data.images.new('o', w, h, alpha=True)
    img.pixels[:] = np.clip(a, 0, 1).ravel()
    img.filepath_raw = str(path)
    img.file_format = 'PNG'
    img.save()
    bpy.data.images.remove(img)


def resize(a, size):
    h, w = a.shape[:2]
    s = size / max(w, h)
    if s >= 1:
        return a
    nw, nh = max(1, int(w * s)), max(1, int(h * s))
    ys = np.minimum(((np.arange(nh) + .5) / s).astype(int), h - 1)
    xs = np.minimum(((np.arange(nw) + .5) / s).astype(int), w - 1)
    # box filter by averaging the source block each output pixel covers
    k = max(1, int(round(1 / s)))
    out = np.zeros((nh, nw, 4), np.float32)
    for dy in range(k):
        for dx in range(k):
            out += a[np.minimum(ys * 0 + (np.arange(nh) * k + dy), h - 1)][:, np.minimum(np.arange(nw) * k + dx, w - 1)]
    return out / (k * k)


def find(d, key):
    f = glob.glob(str(HERE / 'cc0' / d / ('*_' + key + '.jpg')))
    return f[0] if f else None


def build(m):
    albedo = load(find(m['src'], 'Color'))
    normal = load(find(m['src'], 'NormalGL'), True)
    rough = load(find(m['src'], 'Roughness'), True)[..., 0]
    ao_f = find(m['src'], 'AmbientOcclusion')
    ao = load(ao_f, True)[..., 0] if ao_f else np.ones_like(rough)
    rgb = albedo[..., :3]
    if m.get('swapRB'):
        rgb = rgb[..., ::-1]
    if m.get('killGreen'):
        rgb = np.stack([rgb[..., 0], np.minimum(rgb[..., 1], (rgb[..., 0] + rgb[..., 2]) * .5 * 1.02), rgb[..., 2]], -1)
    if 'tint' in m:
        rgb = rgb * np.array(m['tint'], np.float32)
    if 'desaturate' in m:
        g = rgb.mean(-1, keepdims=True)
        rgb = rgb + (g - rgb) * m['desaturate']
    rgb = rgb * m.get('brighten', 1) * m.get('darken', 1)
    albedo = np.concatenate([np.clip(rgb, 0, 1), np.ones_like(rough)[..., None]], -1)
    rough = np.clip(rough * m.get('roughnessScale', 1), 0, 1)
    orm = np.stack([ao, rough, np.zeros_like(rough), np.ones_like(rough)], -1)
    size = m.get('size', 1024)
    return [resize(x, size) for x in (albedo, normal, orm)]


def soft(y, a, b, f=.04):
    """Weight 1 inside [a,b], easing to 0 over f at each end (0 beyond the image edges stays 1)."""
    lo = np.clip((y - (a - f)) / (2 * f), 0, 1) if a > 0 else np.ones_like(y)
    hi = np.clip(((b + f) - y) / (2 * f), 0, 1) if b < 1 else np.ones_like(y)
    return lo * hi


def compose(c, made):
    size = c['size']
    y = 1 - ((np.arange(size) + .5) / size)[:, None]  # Blender rows are bottom-up
    outs = []
    for k in range(3):
        acc = np.zeros((size, size, 4), np.float32)
        wsum = np.zeros((size, 1, 1), np.float32)
        for mid, bright, top, bottom in c['bands']:
            src = made[mid][k]
            reps = -(-size // src.shape[0])
            tile = np.tile(src, (reps, reps, 1))[:size, :size]
            if k == 0:
                tile = tile.copy()
                tile[..., :3] *= bright
            w = soft(y, top, bottom)[:, :, None]
            acc += tile * w
            wsum += w
        outs.append(acc / np.maximum(wsum, 1e-4))
    if k == 1 or True:
        n = outs[1][..., :3] * 2 - 1
        n /= np.maximum(np.linalg.norm(n, axis=-1, keepdims=True), 1e-4)
        outs[1][..., :3] = n * .5 + .5
    return outs


def write(i, maps):
    for name, a in zip(('albedo', 'normal', 'orm'), maps):
        save(a, BUILD / ('%s.%s.png' % (i, name)))


BUILD.mkdir(parents=True, exist_ok=True)
made = {}
for m in spec['materials']:
    made[m['id']] = build(m)
    write(m['id'], made[m['id']])
    print('material', m['id'], '<-', m['src'])
for c in spec['composed']:
    write(c['id'], compose(c, made))
    print('composed', c['id'])
