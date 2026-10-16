"""Plant textures and spikelet meshes, built in Blender (bpy + numpy). Run headless:

    /Applications/Blender.app/Contents/MacOS/Blender -b --python assets/src/plants.py

Writes to assets/build/:
  tex-leaf-rice / tex-leaf-wheat  .albedo/.normal/.orm  (256x1024; u across the blade, v base->tip; neutral grey-green so the
                                                        runtime stage colour can tint it)
  tex-husk                        .albedo/.normal/.orm  (256x256; u around, v along the spikelet)
  mesh-rice-spikelet / mesh-wheat-spikelet .json        (f32 positions/normals/uvs + u16 indices, base64; ~unit-sphere sized,
                                                        long axis +Y, tip at +Y, so the runtime's ellipsoid scaling still applies)

Everything is procedural and original; no third-party imagery.
"""
import base64, json
from pathlib import Path
import bpy, bmesh, numpy as np

BUILD = Path(__file__).resolve().parent.parent / 'build'
BUILD.mkdir(exist_ok=True)
rng = np.random.default_rng(20261016)


def save(a, path):
    h, w = a.shape[:2]
    img = bpy.data.images.new('o', w, h, alpha=True)
    img.pixels[:] = np.clip(a, 0, 1).astype(np.float32).ravel()
    img.filepath_raw = str(path)
    img.file_format = 'PNG'
    img.save()
    bpy.data.images.remove(img)


def blur_axis(a, r, axis):
    if r < 1:
        return a
    acc = np.zeros_like(a)
    for d in range(-r, r + 1):
        acc += np.roll(a, d, axis=axis)
    return acc / (2 * r + 1)


def smooth(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def normal_from_height(h, strength, wrap=(True, True)):
    gx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * .5
    gy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * .5
    n = np.stack([-gx * strength, -gy * strength, np.ones_like(h)], -1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    return np.concatenate([n * .5 + .5, np.ones_like(h)[..., None]], -1)


def write_maps(name, rgb, height, rough, ao, nstrength):
    one = np.ones(rgb.shape[:2], np.float32)
    save(np.concatenate([rgb, one[..., None]], -1), BUILD / ('%s.albedo.png' % name))
    save(normal_from_height(height, nstrength), BUILD / ('%s.normal.png' % name))
    save(np.stack([ao, rough, np.zeros_like(one), one], -1), BUILD / ('%s.orm.png' % name))


def leaf(name, veins, bloom, rib_width, tint):
    W, H = 256, 1024
    u = ((np.arange(W) + .5) / W)[None, :]
    v = ((np.arange(H) + .5) / H)[:, None]
    fib = rng.random((H, W)).astype(np.float32)
    fib = blur_axis(blur_axis(fib, 40, 0), 1, 1)
    fib = (fib - fib.mean()) / (fib.std() + 1e-6)
    cell = rng.random((H // 8, W // 8)).astype(np.float32)  # low-frequency mottling, tiled up
    cell = np.kron(cell, np.ones((8, 8), np.float32))
    cell = blur_axis(blur_axis(cell, 10, 0), 10, 1)
    cell = (cell - cell.mean()) / (cell.std() + 1e-6)
    rib = np.exp(-((u - .5) / rib_width) ** 2)
    groove = (1 - np.abs(np.sin(np.pi * u * veins))) ** 10
    edge = smooth(np.minimum(u, 1 - u) / .06)
    lum = .86 + .035 * fib + .02 * cell - .05 * groove + .10 * rib + bloom * .05
    lum = lum * (.80 + .20 * edge) * (1 - .10 * smooth((v - .82) / .18))
    lum = np.broadcast_to(lum, (H, W)).astype(np.float32)
    t = np.array(tint, np.float32)
    rgb = lum[..., None] * t
    rgb = rgb + (rib[..., None] * np.array([.05, .05, .02], np.float32))  # paler midrib
    height = (.55 * rib - .12 * groove + .03 * fib).astype(np.float32)
    height = np.broadcast_to(height, (H, W)).astype(np.float32)
    rough = np.clip(.62 - bloom * .12 - .06 * rib + 0 * lum, .3, 1).astype(np.float32)
    ao = np.clip(1 - .35 * groove + 0 * lum, .6, 1).astype(np.float32)
    write_maps(name, rgb, height, np.broadcast_to(rough, (H, W)), np.broadcast_to(ao, (H, W)), 3.0)


def husk(name):
    S = 256
    u = ((np.arange(S) + .5) / S)[None, :]
    v = ((np.arange(S) + .5) / S)[:, None]
    ridge = (1 - np.abs(np.sin(np.pi * u * 5))) ** 6
    fine = blur_axis(rng.random((S, S)).astype(np.float32), 3, 0)
    fine = (fine - fine.mean()) / (fine.std() + 1e-6)
    speck = (rng.random((S, S)) > .985).astype(np.float32) * (v > .5)
    lum = .90 + .05 * ridge + .03 * fine - .10 * speck
    lum = lum * (1 - .22 * smooth((v - .86) / .14)) * (1 + .05 * (1 - smooth(v / .12)))
    lum = np.broadcast_to(lum, (S, S)).astype(np.float32)
    rgb = lum[..., None] * np.array([1.0, .98, .92], np.float32)
    height = np.broadcast_to((.4 * ridge + .05 * fine).astype(np.float32), (S, S)).astype(np.float32)
    write_maps(name, rgb, height, np.full((S, S), .55, np.float32), np.broadcast_to(np.clip(1 - .3 * ridge, .6, 1), (S, S)).astype(np.float32), 3.0)


def spikelet(name, slender, plump, tip, keel, rings=14, segs=10):
    """Husk-like body along +Y built in Blender with bmesh; semi-axes ~1 so runtime ellipsoid scaling applies."""
    bm = bmesh.new()
    verts = []
    for i in range(rings + 1):
        t = i / rings
        y = -1 + 2 * t + tip * smooth((t - .85) / .15) * .0 + tip * t ** 6
        r = np.sin(np.pi * min(1, t ** plump)) ** slender
        row = []
        for j in range(segs):
            a = 2 * np.pi * j / segs
            rr = r * (1 + .07 * np.cos(5 * a * 1.0) + keel * max(0, np.cos(a)) ** 4)
            vv = bm.verts.new((rr * np.cos(a), y, rr * np.sin(a)))
            row.append(vv)
        verts.append(row)
    bm.verts.ensure_lookup_table()
    faces = []
    for i in range(rings):
        for j in range(segs):
            a, b = verts[i][j], verts[i][(j + 1) % segs]
            c, d = verts[i + 1][(j + 1) % segs], verts[i + 1][j]
            faces.append(bm.faces.new((a, b, c, d)))
    for f in faces:
        f.smooth = True
    uv = bm.loops.layers.uv.new('uv')
    for i in range(rings):
        for j in range(segs):
            f = faces[i * segs + j]
            coords = [(j / segs, i / rings), ((j + 1) / segs, i / rings), ((j + 1) / segs, (i + 1) / rings), (j / segs, (i + 1) / rings)]
            for loop, c in zip(f.loops, coords):
                loop[uv].uv = c
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.calc_loop_triangles()
    # Per-corner export (seam-split UVs, smooth normals from Blender), triangulated.
    uvl = me.uv_layers['uv'].data
    normals = np.array([c.vector[:] for c in me.corner_normals], np.float32)
    pos, nor, uvs, idx = [], [], [], []
    for tri in me.loop_triangles:
        for li in tri.loops:
            vi = me.loops[li].vertex_index
            pos.append(me.vertices[vi].co[:])
            nor.append(normals[li])
            uvs.append(uvl[li].uv[:])
            idx.append(len(idx))
    pos, nor, uvs = np.array(pos, np.float32), np.array(nor, np.float32), np.array(uvs, np.float32)
    # weld identical corners to keep the index buffer small
    key = np.round(np.concatenate([pos, nor, uvs], 1), 5)
    uniq, inv = np.unique(key, axis=0, return_inverse=True)
    pos, nor, uvs = uniq[:, 0:3].astype(np.float32), uniq[:, 3:6].astype(np.float32), uniq[:, 6:8].astype(np.float32)
    idx = inv.astype(np.uint16)
    enc = lambda a: base64.b64encode(a.tobytes()).decode()
    (BUILD / ('%s.json' % name)).write_text(json.dumps({'p': enc(pos), 'n': enc(nor), 'uv': enc(uvs), 'i': enc(idx), 'verts': int(len(pos)), 'tris': int(len(idx) // 3)}))
    print(name, len(pos), 'verts', len(idx) // 3, 'tris')


leaf('tex-leaf-rice', veins=26, bloom=0.0, rib_width=.022, tint=(.97, 1.0, .90))
leaf('tex-leaf-wheat', veins=18, bloom=1.0, rib_width=.03, tint=(.93, 1.0, .98))
husk('tex-husk')
spikelet('mesh-rice-spikelet', slender=.72, plump=.78, tip=.10, keel=.12)
spikelet('mesh-wheat-spikelet', slender=.58, plump=.90, tip=.04, keel=.18)
print('plants ok')
