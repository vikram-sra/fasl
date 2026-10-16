"""Turn approved generations into runtime texture maps. Run inside Blender (numpy + bpy):

    /Applications/Blender.app/Contents/MacOS/Blender -b --python assets/src/process.py -- [--ids a,b] [--selftest]

Reads assets/src/selected/<id>.png, writes assets/build/<id>.<map>.png:
  textures: <id>.albedo.png (seamless as per "tile"), <id>.normal.png (OpenGL, tangent space),
            <id>.orm.png (R=ambient occlusion, G=roughness, B=0)
  atlases:  <id>.albedo.png with alpha cut out of the white backdrop
pack.py then converts these to WebP and embeds them.
"""
import json, sys
from pathlib import Path
import bpy, numpy as np

HERE = Path(__file__).resolve().parent
BUILD = HERE.parent / 'build'


def load(path):
    img = bpy.data.images.load(str(path))
    w, h = img.size
    a = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)
    bpy.data.images.remove(img)
    return a  # linear float, bottom-up rows; orientation is irrelevant for tiling


def save(a, path):
    h, w = a.shape[:2]
    img = bpy.data.images.new('out', w, h, alpha=True)
    img.pixels[:] = np.clip(a, 0, 1).astype(np.float32).ravel()
    img.filepath_raw = str(path)
    img.file_format = 'PNG'
    img.save()
    bpy.data.images.remove(img)


def resize(a, size):
    h, w = a.shape[:2]
    if (w, h) == size:
        return a
    ys = (np.arange(size[1]) + .5) * h / size[1] - .5
    xs = (np.arange(size[0]) + .5) * w / size[0] - .5
    y0, x0 = np.clip(np.floor(ys).astype(int), 0, h - 2), np.clip(np.floor(xs).astype(int), 0, w - 2)
    fy, fx = (ys - y0)[:, None, None], (xs - x0)[None, :, None]
    return (a[y0][:, x0] * (1 - fy) * (1 - fx) + a[y0][:, x0 + 1] * (1 - fy) * fx
            + a[y0 + 1][:, x0] * fy * (1 - fx) + a[y0 + 1][:, x0 + 1] * fy * fx)


def smooth(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def make_tileable(a, axes):
    """Cross-fade with a half-shifted copy so opposite edges meet (per axis)."""
    h, w = a.shape[:2]
    out = a
    if 'x' in axes:
        wt = smooth(1 - np.abs(2 * (np.arange(w) + .5) / w - 1) * 1.0)[None, :, None]
        out = out * wt + np.roll(out, w // 2, axis=1) * (1 - wt)
    if 'y' in axes:
        wt = smooth(1 - np.abs(2 * (np.arange(h) + .5) / h - 1) * 1.0)[:, None, None]
        out = out * wt + np.roll(out, h // 2, axis=0) * (1 - wt)
    return out


def blur(a, r):
    """Separable box blur x3 (~gaussian), wrapping."""
    for axis in (0, 1):
        for _ in range(3):
            k = 2 * r + 1
            acc = np.zeros_like(a)
            for d in range(-r, r + 1):
                acc += np.roll(a, d, axis=axis)
            a = acc / k
    return a


def luminance(rgb):
    return rgb[..., 0] * .2126 + rgb[..., 1] * .7152 + rgb[..., 2] * .0722


def maps(albedo, rough, strength):
    lum = luminance(albedo[..., :3])
    lum = (lum - lum.mean()) / (lum.std() + 1e-6)
    height = blur(lum[..., None], 1)[..., 0] * .6 + blur(lum[..., None], 6)[..., 0] * .4
    gx = (np.roll(height, -1, axis=1) - np.roll(height, 1, axis=1)) * .5
    gy = (np.roll(height, -1, axis=0) - np.roll(height, 1, axis=0)) * .5
    s = strength * .25
    n = np.stack([-gx * s, -gy * s, np.ones_like(gx)], -1)  # +Y up in Blender's bottom-up rows = OpenGL
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    normal = np.concatenate([n * .5 + .5, np.ones_like(gx)[..., None]], -1)
    local = height - blur(height[..., None], 8)[..., 0]
    ao = np.clip(1 + local * .18, .55, 1)
    t = smooth((lum + 1.6) / 3.2)  # brighter -> rougher
    rg = rough[0] + (rough[1] - rough[0]) * t
    orm = np.stack([ao, rg, np.zeros_like(ao), np.ones_like(ao)], -1)
    return normal, orm


def cut_out_white(a):
    rgb = a[..., :3]
    d = (1 - rgb).max(-1)
    alpha = smooth((d - .07) / .13)
    a_ = np.maximum(alpha, 1e-3)[..., None]
    clean = np.clip((rgb - (1 - a_)) / a_, 0, 1)
    return np.concatenate([clean, alpha[..., None]], -1)


def process(item, src):
    a = load(src)
    size = item.get('size', 1024)
    h, w = a.shape[:2]
    target = (size, int(round(size * h / w)))
    a = resize(a, target)
    BUILD.mkdir(parents=True, exist_ok=True)
    if item['kind'] == 'atlas':
        save(cut_out_white(a), BUILD / ('%s.albedo.png' % item['id']))
        return
    a = make_tileable(a, item.get('tile', 'xy'))
    a[..., 3] = 1
    normal, orm = maps(a, item.get('roughness', [.6, .9]), item.get('normalStrength', 2.0))
    save(a, BUILD / ('%s.albedo.png' % item['id']))
    save(normal, BUILD / ('%s.normal.png' % item['id']))
    save(orm, BUILD / ('%s.orm.png' % item['id']))


def selftest():
    """Synthetic noise texture + synthetic white-backdrop leaf; proves the pipeline without an API key."""
    sel = HERE / 'selected'
    sel.mkdir(exist_ok=True)
    rng = np.random.default_rng(1)
    n = blur(rng.random((512, 512, 1), dtype=np.float32), 3)
    n = (n - n.min()) / (n.max() - n.min())
    tex = np.concatenate([n * .5 + .25, n * .35 + .2, n * .2 + .1, np.ones_like(n)], -1)
    tex[:, :, 0] += np.linspace(0, .15, 512)[None, :]  # a gradient so seams would show
    save(tex, sel / 'tex-selftest.png')
    leaf = np.ones((512, 512, 4), np.float32)
    yy, xx = np.mgrid[0:512, 0:512]
    mask = (np.abs(xx - 256) < 40 * np.sin(np.pi * yy / 512) + 1) & (yy > 20) & (yy < 490)
    leaf[mask, 0], leaf[mask, 1], leaf[mask, 2] = .25, .5, .15
    save(leaf, sel / 'atlas-selftest.png')
    return [{'id': 'tex-selftest', 'kind': 'texture', 'size': 512, 'tile': 'xy'},
            {'id': 'atlas-selftest', 'kind': 'atlas', 'size': 512}]


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    items = json.loads((HERE / 'prompts.json').read_text())['items']
    if '--selftest' in argv:
        items = selftest()
    elif '--ids' in argv:
        want = set(argv[argv.index('--ids') + 1].split(','))
        items = [i for i in items if i['id'] in want]
    items = [i for i in items if i['kind'] in ('texture', 'atlas')]
    done = 0
    for it in items:
        src = HERE / 'selected' / ('%s.png' % it['id'])
        if not src.exists():
            continue
        process(it, src)
        done += 1
        print('processed', it['id'])
    print('done: %d item(s) -> %s' % (done, BUILD))


main()
