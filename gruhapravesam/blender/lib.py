"""Procedural building blocks for the Gruhapravesam scenes (Blender 4.3, Eevee)."""

import math
import random

import bmesh
import bpy
from mathutils import Euler, Matrix, Vector

FPS = 30


# ----------------------------------------------------------------- basics

def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def link(ob):
    bpy.context.scene.collection.objects.link(ob)
    return ob


def smooth(ob):
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


def empty(name, loc=(0, 0, 0), parent=None, rot=(0, 0, 0)):
    ob = link(bpy.data.objects.new(name, None))
    ob.empty_display_size = 0.05
    ob.location = loc
    ob.rotation_euler = rot
    if parent is not None:
        ob.parent = parent
    return ob


def parent_keep(child, parent):
    bpy.context.view_layer.update()
    mw = child.matrix_world.copy()
    child.parent = parent
    child.matrix_parent_inverse = parent.matrix_world.inverted()
    child.matrix_world = mw


def mesh_from_bm(name, bm, mats=(), smooth_shade=True):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    ob = link(bpy.data.objects.new(name, me))
    if smooth_shade:
        smooth(ob)
    return ob


def assign(ob, mat):
    ob.data.materials.clear()
    ob.data.materials.append(mat)
    return ob


def uv_sphere(name, loc, scale, mat, seg=24, rings=14, rot=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1.0)
    ob = mesh_from_bm(name, bm, [mat])
    ob.location = loc
    ob.scale = scale
    ob.rotation_euler = rot
    return ob


def box(name, loc, size, mat, bevel=0.0, rot=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    ob = mesh_from_bm(name, bm, [mat], smooth_shade=False)
    ob.location = loc
    ob.scale = size
    ob.rotation_euler = rot
    if bevel > 0:
        bpy.context.view_layer.update()
        apply_scale(ob)
        mod = ob.modifiers.new("bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 2
        mod.limit_method = "ANGLE"
    return ob


def apply_scale(ob):
    me = ob.data
    s = ob.scale.copy()
    for v in me.vertices:
        v.co = Vector((v.co.x * s.x, v.co.y * s.y, v.co.z * s.z))
    ob.scale = (1, 1, 1)


def cylinder(name, loc, r, depth, mat, seg=32, rot=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r, depth=depth)
    ob = mesh_from_bm(name, bm, [mat], smooth_shade=False)
    ob.location = loc
    ob.rotation_euler = rot
    return ob


def lathe(name, prof, mat, seg=48, loc=(0, 0, 0), smooth_shade=True):
    """Revolve a list of (radius, z) points around Z, traced bottom to top on the outside."""
    bm = bmesh.new()
    rings = []
    for r, z in prof:
        r = max(r, 0.0004)
        rings.append([bm.verts.new((r * math.cos(2 * math.pi * i / seg), r * math.sin(2 * math.pi * i / seg), z))
                      for i in range(seg)])
    for a, b in zip(rings, rings[1:]):
        for i in range(seg):
            j = (i + 1) % seg
            bm.faces.new((a[i], a[j], b[j], b[i]))
    ob = mesh_from_bm(name, bm, [mat], smooth_shade)
    ob.location = loc
    return ob


def curve_tube(name, pts, radius, mat, radii=None, res=12):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 4
    cu.resolution_u = res
    cu.use_fill_caps = True
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(len(pts) - 1)
    for i, p in enumerate(pts):
        bp = sp.bezier_points[i]
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = "AUTO"
        if radii:
            bp.radius = radii[i]
    cu.materials.append(mat)
    return link(bpy.data.objects.new(name, cu))


# ----------------------------------------------------------------- animation

def key(ob, path, frame, value=None, index=-1):
    if value is not None:
        attr = getattr(ob, path)
        if index >= 0:
            attr[index] = value
        else:
            setattr(ob, path, value)
    ob.keyframe_insert(path, frame=frame, index=index)


def fcurve(idblock, path, index):
    return idblock.animation_data.action.fcurves.find(path, index=index)


def add_noise(idblock, path, index, strength, scale, phase=None, depth=1):
    """Organic jitter on top of whatever keys exist. Creates a key if needed."""
    if idblock.animation_data is None or idblock.animation_data.action is None \
            or fcurve(idblock, path, index) is None:
        idblock.keyframe_insert(path, frame=1, index=index)
    fc = fcurve(idblock, path, index)
    mod = fc.modifiers.new("NOISE")
    mod.strength = strength
    mod.scale = scale
    mod.depth = depth
    mod.phase = phase if phase is not None else random.uniform(0, 100)
    return mod


def ease(t):
    t = min(max(t, 0.0), 1.0)
    return t * t * (3 - 2 * t)


def keys_linear(idblock):
    if idblock.animation_data and idblock.animation_data.action:
        for fc in idblock.animation_data.action.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = "LINEAR"


# ----------------------------------------------------------------- materials

def principled(name, color, rough=0.5, metal=0.0, sss=0.0, sheen=0.0, coat=0.0, emit=None, estr=0.0,
               spec=0.5, trans=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["Specular IOR Level"].default_value = spec
    if sss:
        b.inputs["Subsurface Weight"].default_value = sss
        b.inputs["Subsurface Radius"].default_value = (0.6, 0.3, 0.2)
        b.inputs["Subsurface Scale"].default_value = 0.03
    if sheen:
        b.inputs["Sheen Weight"].default_value = sheen
    if coat:
        b.inputs["Coat Weight"].default_value = coat
    if trans:
        b.inputs["Transmission Weight"].default_value = trans
    if emit is not None:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = estr
    return m


def _nodes(m):
    nt = m.node_tree
    return nt, nt.nodes, nt.links, nt.nodes["Principled BSDF"]


def noise_color(m, c1, c2, scale=6.0, detail=6.0, bump=0.0, bump_scale=60.0, coord="Object", rough_var=0.0):
    nt, N, L, b = _nodes(m)
    tc = N.new("ShaderNodeTexCoord")
    noi = N.new("ShaderNodeTexNoise")
    noi.inputs["Scale"].default_value = scale
    noi.inputs["Detail"].default_value = detail
    L.new(tc.outputs[coord], noi.inputs["Vector"])
    ramp = N.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.3
    ramp.color_ramp.elements[1].position = 0.7
    ramp.color_ramp.elements[0].color = (*c1, 1)
    ramp.color_ramp.elements[1].color = (*c2, 1)
    L.new(noi.outputs["Fac"], ramp.inputs["Fac"])
    L.new(ramp.outputs["Color"], b.inputs["Base Color"])
    if rough_var:
        mr = N.new("ShaderNodeMapRange")
        mr.inputs["To Min"].default_value = b.inputs["Roughness"].default_value - rough_var
        mr.inputs["To Max"].default_value = b.inputs["Roughness"].default_value + rough_var
        L.new(noi.outputs["Fac"], mr.inputs["Value"])
        L.new(mr.outputs["Result"], b.inputs["Roughness"])
    if bump:
        n2 = N.new("ShaderNodeTexNoise")
        n2.inputs["Scale"].default_value = bump_scale
        n2.inputs["Detail"].default_value = 8
        L.new(tc.outputs[coord], n2.inputs["Vector"])
        bn = N.new("ShaderNodeBump")
        bn.inputs["Strength"].default_value = bump
        bn.inputs["Distance"].default_value = 0.002
        L.new(n2.outputs["Fac"], bn.inputs["Height"])
        L.new(bn.outputs["Normal"], b.inputs["Normal"])
    return m


def wood(name, dark=(0.09, 0.035, 0.012), light=(0.30, 0.13, 0.05), scale=2.5, rough=0.42, stretch=(1, 1, 8)):
    m = principled(name, light, rough, coat=0.25)
    nt, N, L, b = _nodes(m)
    tc = N.new("ShaderNodeTexCoord")
    mp = N.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = stretch
    L.new(tc.outputs["Object"], mp.inputs["Vector"])
    wv = N.new("ShaderNodeTexWave")
    wv.wave_type = "RINGS"
    wv.inputs["Scale"].default_value = scale
    wv.inputs["Distortion"].default_value = 8
    wv.inputs["Detail"].default_value = 4
    wv.inputs["Detail Scale"].default_value = 1.5
    L.new(mp.outputs["Vector"], wv.inputs["Vector"])
    ramp = N.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (*dark, 1)
    ramp.color_ramp.elements[1].color = (*light, 1)
    L.new(wv.outputs["Fac"], ramp.inputs["Fac"])
    L.new(ramp.outputs["Color"], b.inputs["Base Color"])
    bn = N.new("ShaderNodeBump")
    bn.inputs["Strength"].default_value = 0.15
    bn.inputs["Distance"].default_value = 0.002
    L.new(wv.outputs["Fac"], bn.inputs["Height"])
    L.new(bn.outputs["Normal"], b.inputs["Normal"])
    return m


def brass(name="Brass"):
    if name in bpy.data.materials:
        return bpy.data.materials[name]
    m = principled(name, (0.80, 0.55, 0.20), rough=0.26, metal=1.0)
    return noise_color(m, (0.62, 0.40, 0.12), (0.86, 0.62, 0.25), scale=14, bump=0.08, bump_scale=120, rough_var=0.08)


def copper(name="Copper"):
    if name in bpy.data.materials:
        return bpy.data.materials[name]
    m = principled(name, (0.85, 0.45, 0.28), rough=0.3, metal=1.0)
    return noise_color(m, (0.70, 0.32, 0.18), (0.95, 0.55, 0.36), scale=10, bump=0.12, bump_scale=140, rough_var=0.1)


def gold(name="Gold"):
    if name in bpy.data.materials:
        return bpy.data.materials[name]
    return principled(name, (0.95, 0.70, 0.30), rough=0.22, metal=1.0)


def flame_mat():
    if "Flame" in bpy.data.materials:
        return bpy.data.materials["Flame"]
    m = bpy.data.materials.new("Flame")
    m.use_nodes = True
    nt = m.node_tree
    N, L = nt.nodes, nt.links
    for n in list(N):
        N.remove(n)
    out = N.new("ShaderNodeOutputMaterial")
    em = N.new("ShaderNodeEmission")
    em.inputs["Strength"].default_value = 7.0
    lw = N.new("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = 0.35
    ramp = N.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (1.0, 0.80, 0.42, 1)
    ramp.color_ramp.elements[1].color = (1.0, 0.28, 0.03, 1)
    ramp.color_ramp.elements[1].position = 0.6
    L.new(lw.outputs["Facing"], ramp.inputs["Fac"])
    L.new(ramp.outputs["Color"], em.inputs["Color"])
    L.new(em.outputs["Emission"], out.inputs["Surface"])
    return m


def flower_mats():
    if "Marigold" not in bpy.data.materials:
        mg = principled("Marigold", (1.0, 0.42, 0.02), rough=0.55, sss=0.25, sheen=0.4)
        noise_color(mg, (0.95, 0.30, 0.01), (1.0, 0.55, 0.05), scale=30, bump=0.5, bump_scale=200)
        jm = principled("Jasmine", (0.95, 0.94, 0.88), rough=0.45, sss=0.4, sheen=0.3)
        noise_color(jm, (0.90, 0.92, 0.80), (0.98, 0.97, 0.93), scale=40)
        principled("Leaf", (0.06, 0.25, 0.04), rough=0.45, sss=0.15, sheen=0.1)
    return bpy.data.materials["Marigold"], bpy.data.materials["Jasmine"], bpy.data.materials["Leaf"]


def image_mat(name, path, rough=0.5, emit=0.0):
    m = principled(name, (1, 1, 1), rough)
    nt, N, L, b = _nodes(m)
    tex = N.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(path)
    L.new(tex.outputs["Color"], b.inputs["Base Color"])
    L.new(tex.outputs["Alpha"], b.inputs["Alpha"])
    if emit:
        L.new(tex.outputs["Color"], b.inputs["Emission Color"])
        b.inputs["Emission Strength"].default_value = emit
    m.surface_render_method = "DITHERED"
    return m


# ----------------------------------------------------------------- props

LAMP_PROFILE = [
    (0.0, 0.0), (0.11, 0.0), (0.116, 0.008), (0.112, 0.018), (0.09, 0.024), (0.06, 0.034), (0.035, 0.05),
    (0.024, 0.07), (0.036, 0.086), (0.038, 0.094), (0.022, 0.108), (0.016, 0.18), (0.028, 0.196),
    (0.03, 0.203), (0.017, 0.22), (0.015, 0.30), (0.03, 0.315), (0.032, 0.322), (0.02, 0.334),
    (0.03, 0.338), (0.07, 0.347), (0.092, 0.360), (0.096, 0.369), (0.088, 0.372), (0.07, 0.366),
    (0.02, 0.360), (0.012, 0.362), (0.012, 0.42), (0.026, 0.438), (0.028, 0.446), (0.013, 0.462),
    (0.010, 0.50), (0.022, 0.515), (0.024, 0.53), (0.012, 0.555), (0.0, 0.575),
]

FLAME_PROFILE = [(0.0, 0.0), (0.55, 0.1), (0.95, 0.3), (1.0, 0.42), (0.8, 0.62), (0.42, 0.84), (0.12, 0.96), (0.0, 1.0)]


def flame(name, loc, size=1.0, energy=6.0, parent=None, seed=None, light=True):
    rnd = random.Random(seed if seed is not None else name)
    ob = lathe(name, [(r * 0.010 * size, z * 0.045 * size) for r, z in FLAME_PROFILE], flame_mat(), seg=16)
    ob.location = loc
    ob.visible_shadow = False
    if parent is not None:
        ob.parent = parent
    key(ob, "scale", 1)
    key(ob, "rotation_euler", 1)
    add_noise(ob, "scale", 2, 0.45, 4.0, rnd.uniform(0, 99))
    add_noise(ob, "scale", 0, 0.18, 3.0, rnd.uniform(0, 99))
    add_noise(ob, "scale", 1, 0.18, 3.0, rnd.uniform(0, 99))
    add_noise(ob, "rotation_euler", 0, 0.22, 6.0, rnd.uniform(0, 99))
    add_noise(ob, "rotation_euler", 1, 0.22, 6.0, rnd.uniform(0, 99))
    lt = None
    if light:
        ld = bpy.data.lights.new(name + "_L", "POINT")
        ld.energy = energy
        ld.color = (1.0, 0.62, 0.28)
        ld.shadow_soft_size = 0.02 * size
        ld.use_shadow = False
        lt = link(bpy.data.objects.new(name + "_L", ld))
        lt.location = (loc[0], loc[1], loc[2] + 0.03 * size)
        if parent is not None:
            lt.parent = parent
        ld.keyframe_insert("energy", frame=1)
        fc = ld.animation_data.action.fcurves.find("energy")
        mod = fc.modifiers.new("NOISE")
        mod.strength = energy * 0.45
        mod.scale = 3.5
        mod.phase = rnd.uniform(0, 99)
    return ob, lt


def brass_lamp(name, loc, scale=1.0, wicks=5, energy=5.0, mat=None):
    root = empty(name, loc)
    root.scale = (scale, scale, scale)
    body = lathe(name + "_body", LAMP_PROFILE, mat or brass(), seg=56)
    body.parent = root
    for i in range(wicks):
        a = 2 * math.pi * i / wicks + 0.3
        flame(f"{name}_flame{i}", (0.083 * math.cos(a), 0.083 * math.sin(a), 0.372), size=1.0,
              energy=energy, parent=root, light=(i % 2 == 0))
    return root


def diya(name, loc, scale=1.0, energy=3.0):
    clay = bpy.data.materials.get("Clay") or noise_color(
        principled("Clay", (0.45, 0.17, 0.07), rough=0.8), (0.35, 0.12, 0.05), (0.55, 0.22, 0.09), scale=20)
    root = empty(name, loc)
    root.scale = (scale, scale, scale)
    prof = [(0.0, 0.0), (0.03, 0.0), (0.05, 0.012), (0.058, 0.03), (0.052, 0.032), (0.03, 0.02), (0.0, 0.018)]
    b = lathe(name + "_bowl", prof, clay, seg=32)
    b.parent = root
    b.scale = (1.0, 0.8, 1.0)
    flame(name + "_flame", (0.045, 0, 0.03), size=0.8, energy=energy, parent=root)
    return root


def beads(name, pts, kinds, jitter=0.18, seed=1):
    """One mesh of marigold (0) / jasmine (1) / leaf bud (2) beads at the given points."""
    mg, jm, lf = flower_mats()
    rnd = random.Random(seed)
    bm = bmesh.new()
    for p, k in zip(pts, kinds):
        if k == 0:
            r, sub, j = 0.026, 2, jitter
        else:
            r, sub, j = 0.012, 1, 0.05
        before = len(bm.faces)
        res = bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=r, matrix=Matrix.Translation(p))
        for v in res["verts"]:
            d = v.co - Vector(p)
            if k == 1:
                d.z *= 1.6
            v.co = Vector(p) + d * (1 + rnd.uniform(-j, j))
        bm.faces.ensure_lookup_table()
        for fi in range(before, len(bm.faces)):
            bm.faces[fi].material_index = k
    return mesh_from_bm(name, bm, [mg, jm, lf])


def garland_strand(name, top, length, pattern=(0, 0, 0, 0, 1, 1, 1), step=0.042, parent=None, seed=1):
    n = int(length / step)
    pts, kinds = [], []
    for i in range(n):
        k = pattern[i % len(pattern)]
        z = -i * step
        if k == 1:
            for a in range(3):
                ang = 2 * math.pi * a / 3 + i
                pts.append((0.011 * math.cos(ang), 0.011 * math.sin(ang), z))
                kinds.append(1)
        else:
            pts.append((0, 0, z))
            kinds.append(0)
    piv = empty(name + "_pivot", top, parent=parent)
    ob = beads(name, pts, kinds, seed=seed)
    ob.parent = piv
    return piv, ob


def swag(name, p0, p1, sag, pattern=(0, 0, 0, 1, 1), step=0.045, seed=3):
    p0, p1 = Vector(p0), Vector(p1)
    mid = (p0 + p1) / 2
    piv = empty(name + "_pivot", mid)
    span = (p1 - p0).length
    n = max(4, int(span * 1.25 / step))
    pts, kinds = [], []
    for i in range(n):
        t = i / (n - 1)
        p = p0.lerp(p1, t)
        p.z -= sag * 4 * t * (1 - t)
        k = pattern[i % len(pattern)]
        if k == 1:
            for a in range(3):
                ang = 2 * math.pi * a / 3 + i
                pts.append(tuple(p - mid + Vector((0.011 * math.cos(ang), 0.011 * math.sin(ang), 0))))
                kinds.append(1)
        else:
            pts.append(tuple(p - mid))
            kinds.append(0)
    ob = beads(name, pts, kinds, seed=seed)
    ob.parent = piv
    return piv, ob


def leaf_mesh(name, length, width, droop, mat, curl=0.04, nu=14, nv=6, tip=1.0):
    """Leaf lying along +X from the origin, blade in XY, drooping toward -Z."""
    bm = bmesh.new()
    grid = []
    for i in range(nu + 1):
        u = i / nu
        w = width * (math.sin(math.pi * min(u * 1.05, 1.0)) ** 0.7) * (1 - 0.15 * u)
        row = []
        for j in range(nv + 1):
            v = -1 + 2 * j / nv
            x = u * length
            y = v * w * 0.5
            z = -droop * u * u - curl * abs(v) * w * 4 * (0.3 + u)
            row.append(bm.verts.new((x, y, z)))
        grid.append(row)
    for i in range(nu):
        for j in range(nv):
            bm.faces.new((grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]))
    ob = mesh_from_bm(name, bm, [mat])
    return ob


def mango_leaf_mat():
    if "MangoLeaf" not in bpy.data.materials:
        m = principled("MangoLeaf", (0.05, 0.22, 0.04), rough=0.35, sss=0.2, sheen=0.1)
        noise_color(m, (0.03, 0.16, 0.02), (0.10, 0.32, 0.05), scale=5)
    return bpy.data.materials["MangoLeaf"]


def banana_leaf_mat():
    if "BananaLeaf" not in bpy.data.materials:
        m = principled("BananaLeaf", (0.12, 0.38, 0.06), rough=0.5, sss=0.25, sheen=0.1)
        nt, N, L, b = _nodes(m)
        tc = N.new("ShaderNodeTexCoord")
        wv = N.new("ShaderNodeTexWave")
        wv.bands_direction = "Y"
        wv.inputs["Scale"].default_value = 60
        wv.inputs["Distortion"].default_value = 1.2
        L.new(tc.outputs["Generated"], wv.inputs["Vector"])
        ramp = N.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].color = (0.08, 0.30, 0.04, 1)
        ramp.color_ramp.elements[1].color = (0.17, 0.45, 0.08, 1)
        L.new(wv.outputs["Fac"], ramp.inputs["Fac"])
        L.new(ramp.outputs["Color"], b.inputs["Base Color"])
    return bpy.data.materials["BananaLeaf"]


def banana_plant(name, loc, height=2.1, seed=0, rot=0.0):
    rnd = random.Random(seed)
    root = empty(name, loc, rot=(0, 0, rot))
    stem_mat = bpy.data.materials.get("BananaStem") or noise_color(
        principled("BananaStem", (0.35, 0.45, 0.15), rough=0.5), (0.30, 0.40, 0.12), (0.50, 0.52, 0.22), scale=3)
    stem = lathe(name + "_stem", [(0.09, 0), (0.085, height * 0.3), (0.07, height * 0.7), (0.055, height * 0.82),
                                   (0.0, height * 0.84)], stem_mat, seg=20)
    stem.parent = root
    for i in range(7):
        ang = i * 2.4 + rnd.uniform(-0.2, 0.2)
        piv = empty(f"{name}_lp{i}", (0, 0, height * (0.72 + 0.03 * i % 0.1)), parent=root,
                    rot=(0, -rnd.uniform(0.55, 1.05), ang))
        lf = leaf_mesh(f"{name}_leaf{i}", rnd.uniform(1.0, 1.35), rnd.uniform(0.34, 0.42), rnd.uniform(0.35, 0.6),
                       banana_leaf_mat(), curl=0.01, nu=18, nv=6)
        lf.parent = piv
        key(piv, "rotation_euler", 1)
        add_noise(piv, "rotation_euler", 1, 0.06, 40, rnd.uniform(0, 99))
        add_noise(piv, "rotation_euler", 2, 0.05, 50, rnd.uniform(0, 99))
    return root


def clay_pot(name, loc, scale=1.0):
    m = bpy.data.materials.get("Terracotta") or noise_color(
        principled("Terracotta", (0.48, 0.20, 0.09), rough=0.75), (0.40, 0.16, 0.07), (0.58, 0.26, 0.12), scale=8,
        bump=0.2, bump_scale=60)
    prof = [(0.0, 0.0), (0.16, 0.0), (0.22, 0.12), (0.25, 0.25), (0.24, 0.34), (0.27, 0.36), (0.27, 0.39),
            (0.22, 0.38), (0.0, 0.36)]
    ob = lathe(name, [(r * scale, z * scale) for r, z in prof], m, seg=40)
    ob.location = loc
    return ob


def kalasham(name, loc, scale=1.0, leaf_seed=4):
    mg, jm, _ = flower_mats()
    root = empty(name, loc)
    root.scale = (scale, scale, scale)
    prof = [(0.0, 0.0), (0.06, 0.0), (0.075, 0.006), (0.10, 0.025), (0.138, 0.075), (0.150, 0.125),
            (0.140, 0.175), (0.105, 0.215), (0.064, 0.240), (0.055, 0.252), (0.062, 0.268), (0.078, 0.280),
            (0.080, 0.288), (0.068, 0.290), (0.05, 0.284)]
    pot = lathe(name + "_pot", prof, copper(), seg=64)
    pot.parent = root
    band = bpy.data.materials.get("Kumkum") or principled("Kumkum", (0.55, 0.02, 0.02), rough=0.6)
    turmeric = bpy.data.materials.get("Turmeric") or principled("Turmeric", (0.85, 0.55, 0.04), rough=0.7)
    for i, (z, m) in enumerate(((0.12, turmeric), (0.135, band))):
        r = 0.151 if i == 0 else 0.149
        dot = uv_sphere(f"{name}_dot{i}", (0, -r, z), (0.018, 0.004, 0.018), m)
        dot.parent = root
    coco_m = bpy.data.materials.get("Coconut") or noise_color(
        principled("Coconut", (0.36, 0.22, 0.10), rough=0.85), (0.25, 0.14, 0.06), (0.48, 0.30, 0.14), scale=25,
        bump=0.6, bump_scale=90, coord="Object")
    coco = uv_sphere(name + "_coconut", (0, 0, 0.345), (0.072, 0.072, 0.09), coco_m)
    coco.parent = root
    tuft = curve_tube(name + "_tuft", [(0, 0, 0.43), (0.005, 0.0, 0.455), (0.0, 0.01, 0.47)], 0.012, coco_m,
                      radii=[1.0, 0.6, 0.1])
    tuft.parent = root
    rnd = random.Random(leaf_seed)
    for i in range(7):
        ang = 2 * math.pi * i / 7
        piv = empty(f"{name}_lp{i}", (0.05 * math.cos(ang), 0.05 * math.sin(ang), 0.285), parent=root,
                    rot=(0, -0.35, ang))
        lf = leaf_mesh(f"{name}_leaf{i}", 0.2, 0.06, 0.07, mango_leaf_mat(), curl=0.015)
        lf.parent = piv
        key(piv, "rotation_euler", 1)
        add_noise(piv, "rotation_euler", 1, 0.03, 30, rnd.uniform(0, 99))
    return root


def scatter_flowers(name, center, radius, count, seed=7, z=0.0, jas_ratio=0.45, ring=None):
    rnd = random.Random(seed)
    pts, kinds = [], []
    for _ in range(count):
        a = rnd.uniform(0, 2 * math.pi)
        if ring:
            d = rnd.uniform(ring[0], ring[1])
        else:
            d = radius * math.sqrt(rnd.random())
        x, y = center[0] + d * math.cos(a), center[1] + d * math.sin(a)
        if rnd.random() < jas_ratio:
            pts.append((x, y, z + 0.011))
            kinds.append(1)
        else:
            pts.append((x, y, z + 0.018))
            kinds.append(0)
    return beads(name, pts, kinds, seed=seed)


def falling_petals(name, count, box_min, box_max, f0, f1, seed=11):
    mg, jm, _ = flower_mats()
    rnd = random.Random(seed)
    obs = []
    for i in range(count):
        m = mg if rnd.random() < 0.7 else jm
        p = uv_sphere(f"{name}{i}", (0, 0, 0), (0.014, 0.010, 0.003), m, seg=10, rings=6)
        x = rnd.uniform(box_min[0], box_max[0])
        y = rnd.uniform(box_min[1], box_max[1])
        z0 = box_max[2] + rnd.uniform(0, box_max[2] - box_min[2])
        speed = rnd.uniform(0.12, 0.22) / FPS
        for f in range(f0, f1 + 1, 3):
            t = f - f0
            z = z0 - speed * t
            p.location = (x + 0.04 * math.sin(t * 0.07 + i), y + 0.03 * math.cos(t * 0.05 + i), z)
            p.rotation_euler = (t * 0.05 + i, t * 0.03, t * 0.04 + i)
            p.keyframe_insert("location", frame=f)
            p.keyframe_insert("rotation_euler", frame=f)
        obs.append(p)
    return obs


# ----------------------------------------------------------------- metaball animal

def _mb(name, res):
    mb = bpy.data.metaballs.new(name)
    mb.resolution = res
    mb.render_resolution = res
    mb.threshold = 0.6
    ob = link(bpy.data.objects.new(name, mb))
    return ob, mb


VIS = 0.575  # visible radius of a lone element relative to its field radius at threshold 0.6, stiffness 2


def mball(mb, co, v, stiff=2.0):
    e = mb.elements.new(type="BALL")
    e.co = co
    e.radius = v / VIS
    e.stiffness = stiff
    return e


def mell(mb, co, ext, rot=(0, 0, 0), stiff=2.0):
    e = mb.elements.new(type="ELLIPSOID")
    e.co = co
    r = max(ext)
    e.radius = r / VIS
    e.size_x, e.size_y, e.size_z = ext[0] / r, ext[1] / r, ext[2] / r
    e.rotation = Euler(rot).to_quaternion()
    e.stiffness = stiff
    return e


def mchain(mb, p0, p1, r0, r1, n=None):
    p0, p1 = Vector(p0), Vector(p1)
    n = max(3, int((p1 - p0).length / (min(r0, r1) * 0.45)) + 1)
    for i in range(n):
        t = i / (n - 1)
        mball(mb, p0.lerp(p1, t), r0 + (r1 - r0) * t)


def to_mesh(ob, mat):
    bpy.context.view_layer.update()
    for o in bpy.context.view_layer.objects:
        o.select_set(False)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.convert(target="MESH")
    new = bpy.context.view_layer.objects.active
    assign(new, mat)
    smooth(new)
    return new


def coat_mat(name, base=(0.86, 0.84, 0.80), shade=(0.66, 0.65, 0.64)):
    m = principled(name, base, rough=0.62, sss=0.12, sheen=0.5)
    return noise_color(m, shade, base, scale=2.2, detail=3, bump=0.25, bump_scale=420)


class Cattle:
    """Zebu cow or calf built from metaballs, rigged with empties. Faces +X, origin on the ground."""

    def __init__(self, name, calf=False, res=0.018):
        self.name = name
        self.calf = calf
        S = 0.58 if calf else 1.0
        self.S = S
        coat = coat_mat(name + "_coat", (0.90, 0.87, 0.82) if calf else (0.87, 0.85, 0.81),
                        (0.80, 0.76, 0.70) if calf else (0.62, 0.62, 0.62))
        dark = principled(name + "_dark", (0.06, 0.05, 0.05), rough=0.35, coat=0.3)
        hoof = principled(name + "_hoof", (0.10, 0.09, 0.08), rough=0.45)
        horn = principled(name + "_horn", (0.22, 0.18, 0.14), rough=0.5)
        nose = principled(name + "_nose", (0.20, 0.12, 0.12), rough=0.3, coat=0.5)
        pinkear = principled(name + "_ear", (0.85, 0.74, 0.70), rough=0.6, sss=0.3)
        eye = principled(name + "_eye", (0.02, 0.015, 0.012), rough=0.05, coat=1.0)

        L = 1.12 if calf else 1.0   # leg length factor relative to body
        H = 1.0                     # head factor
        if calf:
            H = 1.25
        s = lambda *p: tuple(c * S for c in p)

        self.root = empty(name, (0, 0, 0))
        self.body_piv = empty(name + "_bodyP", s(0, 0, 0.98 * L), parent=self.root)

        # torso family
        bo, bmb = _mb(name + "Body", res)
        z0 = 0.98 * L * S
        mell(bmb, s(0.0, 0, 0), (0.56 * S, 0.19 * S, 0.23 * S))
        mball(bmb, s(0.40, 0, 0.02), 0.22 * S)
        mball(bmb, s(-0.46, 0, 0.05), 0.21 * S)
        mell(bmb, s(0.02, 0, -0.10), (0.40 * S, 0.19 * S, 0.17 * S))
        if not calf:
            mell(bmb, s(0.38, 0, 0.27), (0.15 * S, 0.09 * S, 0.14 * S), rot=(0, 0.3, 0))
            mell(bmb, s(0.60, 0, -0.22), (0.18 * S, 0.035 * S, 0.22 * S), rot=(0, 0.5, 0))
        else:
            mball(bmb, s(0.38, 0, 0.14), 0.09 * S)
        for y in (-0.12, 0.12):
            mball(bmb, s(-0.54, y, 0.10), 0.12 * S)
            mell(bmb, s(-0.54, y, -0.12), (0.12 * S, 0.08 * S, 0.19 * S))
            mell(bmb, s(0.40, y, -0.10), (0.09 * S, 0.07 * S, 0.17 * S))
        bo.location = (0, 0, 0)
        body = to_mesh(bo, coat)
        body.parent = self.body_piv
        body.location = (0, 0, 0)
        self.body = body
        # breathing on the torso only
        key(body, "scale", 1)
        sc_fc_phase = random.uniform(0, 10)
        for f in range(1, 400, 4):
            b = 1 + 0.012 * math.sin(2 * math.pi * f / (FPS * 3.6) + sc_fc_phase)
            body.scale = (1.0, b, b)
            body.keyframe_insert("scale", frame=f)

        # tail
        tail_piv = empty(name + "_tailP", s(-0.74, 0, 0.12), parent=self.body_piv)
        to, tmb = _mb(name + "Tail", res * 0.7)
        mchain(tmb, s(-0.74, 0, 0.12), s(-0.80, 0, -0.45), 0.035 * S, 0.02 * S, 9)
        mball(tmb, s(-0.80, 0, -0.52), 0.045 * S)
        tail = to_mesh(to, coat)
        tail.location = (0, 0, z0)
        parent_keep(tail, tail_piv)
        tuft = uv_sphere(name + "_tuft", s(-0.80, 0, z0 / S - 0.56), (0.035 * S, 0.035 * S, 0.08 * S), dark)
        parent_keep(tuft, tail_piv)
        key(tail_piv, "rotation_euler", 1)
        add_noise(tail_piv, "rotation_euler", 0, 0.35, 25)
        add_noise(tail_piv, "rotation_euler", 2, 0.25, 30)
        self.tail_piv = tail_piv

        # head and neck
        neck_pos = s(0.50, 0, 0.06)
        self.neck = empty(name + "_neckP", neck_pos, parent=self.body_piv)
        ho, hmb = _mb(name + "Head", res * 0.8)
        hx = 0.0 if not calf else -0.05
        mchain(hmb, s(0.50, 0, 0.04), s(0.84 + hx, 0, 0.24), 0.16 * S, 0.095 * S * H, 4)
        poll = Vector(s(0.95 + hx, 0, 0.34)) 
        muzzle = Vector(s(1.18 + hx, 0, 0.0 if not calf else 0.06))
        if calf:
            poll = Vector(s(0.90, 0, 0.30))
            muzzle = Vector(s(1.12, 0, 0.0))
        k = S * H
        mell(hmb, poll.lerp(muzzle, 0.18), (0.088 * k, 0.098 * k, 0.095 * k))
        mell(hmb, poll.lerp(muzzle, 0.42), (0.075 * k, 0.07 * k, 0.08 * k))
        mell(hmb, poll.lerp(muzzle, 0.66), (0.068 * k, 0.064 * k, 0.07 * k))
        mell(hmb, poll.lerp(muzzle, 0.9), (0.072 * k, 0.082 * k, 0.064 * k))
        head = to_mesh(ho, coat)
        head.location = (0, 0, z0)
        parent_keep(head, self.neck)
        self.head = head
        hdir = (muzzle - poll).normalized()
        side = Vector((0, 1, 0))
        # nose pad
        fwd = hdir.cross(side).normalized()
        if fwd.x < 0:
            fwd = -fwd
        npad = uv_sphere(name + "_nose", tuple(poll.lerp(muzzle, 0.96) + fwd * 0.05 * S * H + Vector((0, 0, z0))),
                         (0.03 * S * H, 0.068 * S * H, 0.045 * S * H), nose,
                         rot=fwd.to_track_quat("X", "Z").to_euler())
        parent_keep(npad, self.neck)
        # eyes with blink pivots
        self.eyes = []
        ep = poll.lerp(muzzle, 0.22)
        for sgn in (-1, 1):
            loc = ep + Vector((0.02 * S, sgn * 0.085 * S * H, -0.01 * S)) + Vector((0, 0, z0))
            e = uv_sphere(f"{name}_eye{sgn}", tuple(loc), (0.024 * S * H, 0.016 * S * H, 0.02 * S * H), eye,
                          seg=16, rings=10)
            parent_keep(e, self.neck)
            self.eyes.append(e)
        # ears
        self.ears = []
        for sgn in (-1, 1):
            base = poll + Vector((-0.04 * S, sgn * 0.07 * S * H, -0.03 * S)) + Vector((0, 0, z0))
            ep_ = empty(f"{name}_earP{sgn}", tuple(base), parent=None,
                        rot=(sgn * (-0.25 if not calf else -0.15), 0.2, 0))
            parent_keep(ep_, self.neck)
            ear = uv_sphere(f"{name}_ear{sgn}", (0, sgn * 0.10 * S * H, 0),
                            (0.05 * S * H, 0.095 * S * H, 0.018 * S * H), pinkear if calf else coat)
            ear.parent = ep_
            self.ears.append(ep_)
            key(ep_, "rotation_euler", 1)
            add_noise(ep_, "rotation_euler", 0, 0.25, 18)
            add_noise(ep_, "rotation_euler", 2, 0.2, 22)
        # horns and forehead mark (cow only)
        if not calf:
            for sgn in (-1, 1):
                hb = poll + Vector((-0.03 * S, sgn * 0.05 * S, 0.04 * S)) + Vector((0, 0, z0))
                hn = curve_tube(f"{name}_horn{sgn}", [tuple(hb), tuple(hb + Vector((-0.02, sgn * 0.03, 0.05))),
                                                      tuple(hb + Vector((-0.045, sgn * 0.04, 0.10)))],
                                0.026, horn, radii=[1.0, 0.75, 0.3])
                parent_keep(hn, self.neck)
            fore = poll.lerp(muzzle, 0.18) + hdir.cross(side) * -0.0 + Vector((0, 0, z0))
            normal = hdir.cross(side).normalized()
            if normal.x < 0:
                normal = -normal
            mark_y = principled(name + "_turmeric", (0.95, 0.58, 0.03), rough=0.7)
            mark_r = principled(name + "_kumkum", (0.75, 0.02, 0.03), rough=0.6)
            m1 = uv_sphere(name + "_markY", tuple(fore + normal * 0.095 * S), (0.022, 0.022, 0.008), mark_y,
                           rot=normal.to_track_quat("Z", "Y").to_euler())
            m2 = uv_sphere(name + "_markR", tuple(fore + normal * 0.101 * S), (0.01, 0.01, 0.005), mark_r,
                           rot=normal.to_track_quat("Z", "Y").to_euler())
            parent_keep(m1, self.neck)
            parent_keep(m2, self.neck)
        # neck garland
        self._garland(z0, calf)

        # legs: hip pivot -> upper segment -> knee pivot -> lower segment + hoof
        self.legs = {}
        Lz = 0.98 * L
        for key_, x, y in (("FL", 0.40, 0.12), ("FR", 0.40, -0.12), ("HL", -0.54, 0.12), ("HR", -0.54, -0.12)):
            hind = key_[0] == "H"
            hip = empty(f"{name}_hip{key_}", s(x, y, -0.12), parent=self.body_piv)
            knee_z = 0.44 * L
            kx = x + (-0.10 if hind else 0.0)
            uo, umb = _mb(f"{name}Up{key_}", res * 0.7)
            top = Vector((x, y, Lz - 0.12)) * S
            kn = Vector((kx, y, knee_z)) * S
            mchain(umb, top, kn, (0.10 if hind else 0.085) * S, 0.05 * S, 6)
            up = to_mesh(uo, coat)
            parent_keep(up, hip)
            knee = empty(f"{name}_knee{key_}", tuple(kn), parent=None)
            parent_keep(knee, hip)
            lo, lmb = _mb(f"{name}Lo{key_}", res * 0.6)
            ft = Vector((kx + (0.04 if hind else 0.0), y, 0.07 * L)) * S
            mchain(lmb, kn, ft, 0.045 * S, 0.035 * S, 6)
            mball(lmb, ft, 0.042 * S)
            lo_ = to_mesh(lo, coat)
            parent_keep(lo_, knee)
            hf = lathe(f"{name}_hoof{key_}", [(0.045 * S, 0.0), (0.047 * S, 0.02 * S), (0.038 * S, 0.06 * S),
                                               (0.0, 0.065 * S)], hoof, seg=20)
            hf.location = (ft.x, ft.y, 0.0)
            parent_keep(hf, knee)
            self.legs[key_] = (hip, knee)
        self.Lz = Lz

    def _garland(self, z0, calf):
        S = self.S
        mg, jm, _ = flower_mats()
        c = Vector((0.66 * S, 0, z0 + 0.13 * S))
        pts, kinds = [], []
        n = 64 if not calf else 44
        for i in range(n):
            a = 2 * math.pi * i / n
            r = 0.19 * S if not calf else 0.14 * S
            local = Vector((math.cos(a) * 0.35 * r, math.sin(a) * r, math.cos(a) * r * 0.9 - r * 0.15))
            p = c + local
            if i % 3 == 2:
                pts.append(tuple(p))
                kinds.append(0)
            else:
                pts.append(tuple(p))
                kinds.append(1)
        g = beads(self.name + "_garland", pts, kinds, seed=21 if calf else 22)
        g.scale = (1, 1, 1)
        parent_keep(g, self.neck)

    # ---- animation helpers -------------------------------------------------

    def blink(self, frames):
        for e in self.eyes:
            base = e.scale.copy()
            key(e, "scale", 1, base)
            for f in frames:
                key(e, "scale", f - 2, base)
                key(e, "scale", f, (base.x, base.y, base.z * 0.08))
                key(e, "scale", f + 3, base)

    def head_pose(self, frame, yaw=0.0, pitch=0.0, roll=0.0):
        key(self.neck, "rotation_euler", frame, (roll, pitch, yaw))

    def head_idle(self, amount=0.03):
        add_noise(self.neck, "rotation_euler", 2, amount, 45)
        add_noise(self.neck, "rotation_euler", 1, amount * 0.6, 55)

    def place(self, loc, yaw):
        self.root.location = loc
        self.root.rotation_euler = (0, 0, yaw)

    def walk(self, f0, f1, p0, p1, yaw, cycle=24):
        """Walk from p0 to p1 between f0 and f1 with a diagonal-pair gait, then stand."""
        p0, p1 = Vector(p0), Vector(p1)
        phase_off = {"FL": 0.0, "HR": 0.0, "FR": 0.5, "HL": 0.5}
        total = f1 - f0
        for f in range(f0 - 1, f1 + 2):
            t = (f - f0) / total
            tt = ease(t) if 0 <= t <= 1 else (0 if t < 0 else 1)
            # move with constant velocity in the middle, eased at ends
            pos = p0.lerp(p1, tt)
            self.root.location = pos
            self.root.rotation_euler = (0, 0, yaw)
            self.root.keyframe_insert("location", frame=f)
            self.root.keyframe_insert("rotation_euler", frame=f)
            moving = 0 < t < 1
            amp = math.sin(math.pi * min(max(t, 0), 1)) if moving else 0.0
            amp = min(1.0, amp * 1.6)
            for k, (hip, knee) in self.legs.items():
                ph = ((f - f0) / cycle + phase_off[k]) % 1.0
                if ph < 0.4:
                    s = ph / 0.4
                    swing = -math.cos(math.pi * s)          # back to front
                    flex = math.sin(math.pi * s)
                else:
                    s = (ph - 0.4) / 0.6
                    swing = math.cos(math.pi * s)           # front to back while planted
                    flex = 0.0
                hip.rotation_euler = (0, -0.28 * swing * amp, 0)
                bend = 0.75 * flex * amp
                knee.rotation_euler = (0, (-bend if k[0] == "H" else bend), 0)
                hip.keyframe_insert("rotation_euler", frame=f)
                knee.keyframe_insert("rotation_euler", frame=f)
            bob = 0.012 * self.S * abs(math.sin(2 * math.pi * (f - f0) / cycle)) * amp
            self.body_piv.location.z = self.Lz * self.S + bob
            self.body_piv.keyframe_insert("location", index=2, frame=f)
        for ob in [self.root, self.body_piv] + [o for pair in self.legs.values() for o in pair]:
            keys_linear(ob)

    def stand(self, frame=1):
        for hip, knee in self.legs.values():
            key(hip, "rotation_euler", frame, (0, 0, 0))
            key(knee, "rotation_euler", frame, (0, 0, 0))

    def shift_weight(self, f0, f1, leg="FL", lift=0.15):
        hip, knee = self.legs[leg]
        key(hip, "rotation_euler", f0, (0, 0, 0))
        key(knee, "rotation_euler", f0, (0, 0, 0))
        mid = (f0 + f1) // 2
        key(hip, "rotation_euler", mid, (0, -0.12, 0))
        key(knee, "rotation_euler", mid, (0, lift * (1 if leg[0] == "F" else -1), 0))
        key(hip, "rotation_euler", f1, (0, -0.05, 0))
        key(knee, "rotation_euler", f1, (0, 0, 0))


# ----------------------------------------------------------------- scene setup

def setup_render(res_x, res_y, samples=12):
    s = bpy.context.scene
    s.render.engine = "BLENDER_EEVEE_NEXT"
    s.render.resolution_x = res_x
    s.render.resolution_y = res_y
    s.render.resolution_percentage = 100
    s.render.fps = FPS
    s.eevee.taa_render_samples = samples
    for attr, val in (("use_shadows", True), ("shadow_ray_count", 1), ("shadow_step_count", 2),
                      ("shadow_resolution_scale", 0.5), ("use_raytracing", False), ("use_gtao", False)):
        if hasattr(s.eevee, attr):
            setattr(s.eevee, attr, val)
    s.view_settings.view_transform = "AgX"
    try:
        s.view_settings.look = "AgX - Medium High Contrast"
    except TypeError:
        pass
    s.render.image_settings.file_format = "PNG"
    s.render.image_settings.color_mode = "RGB"
    s.render.image_settings.compression = 15
    s.render.use_overwrite = False
    s.render.use_placeholder = True
    return s


def world(color=(0.05, 0.04, 0.035), strength=1.0, sky_top=None):
    w = bpy.data.worlds.new("World")
    bpy.context.scene.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    if sky_top is None:
        bg.inputs["Color"].default_value = (*color, 1)
    else:
        N, L = w.node_tree.nodes, w.node_tree.links
        tc = N.new("ShaderNodeTexCoord")
        sep = N.new("ShaderNodeSeparateXYZ")
        L.new(tc.outputs["Generated"], sep.inputs["Vector"])
        ramp = N.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].color = (*color, 1)
        ramp.color_ramp.elements[1].color = (*sky_top, 1)
        L.new(sep.outputs["Z"], ramp.inputs["Fac"])
        L.new(ramp.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = strength
    return w


def sun(rot, energy=3.0, color=(1.0, 0.86, 0.68), angle=0.03):
    ld = bpy.data.lights.new("Sun", "SUN")
    ld.energy = energy
    ld.color = color
    ld.angle = angle
    ob = link(bpy.data.objects.new("Sun", ld))
    ob.rotation_euler = rot
    return ob


def area(name, loc, rot, energy, size=1.0, color=(1.0, 0.85, 0.7), shape="SQUARE", size_y=None):
    ld = bpy.data.lights.new(name, "AREA")
    ld.energy = energy
    ld.size = size
    ld.shape = shape
    if size_y:
        ld.shape = "RECTANGLE"
        ld.size_y = size_y
    ld.color = color
    ob = link(bpy.data.objects.new(name, ld))
    ob.location = loc
    ob.rotation_euler = rot
    return ob


def point(name, loc, energy, color=(1.0, 0.7, 0.4), radius=0.05):
    ld = bpy.data.lights.new(name, "POINT")
    ld.energy = energy
    ld.color = color
    ld.shadow_soft_size = radius
    ob = link(bpy.data.objects.new(name, ld))
    ob.location = loc
    return ob


def camera(lens=35.0, fstop=None, focus=None):
    cd = bpy.data.cameras.new("Cam")
    cd.lens = lens
    cd.sensor_fit = "VERTICAL"
    cd.sensor_height = 24
    cd.clip_start = 0.02
    cd.clip_end = 200
    cam = link(bpy.data.objects.new("Cam", cd))
    bpy.context.scene.camera = cam
    target = empty("CamTarget", (0, 0, 0))
    tr = cam.constraints.new("TRACK_TO")
    tr.target = target
    tr.track_axis = "TRACK_NEGATIVE_Z"
    tr.up_axis = "UP_Y"
    if fstop:
        cd.dof.use_dof = True
        cd.dof.aperture_fstop = fstop
        if focus is not None:
            cd.dof.focus_object = focus
    return cam, target


def path_keys(ob, pts, ease_all=True):
    """pts: list of (frame, (x,y,z)). Bezier keys with eased in/out."""
    for f, p in pts:
        ob.location = p
        ob.keyframe_insert("location", frame=f)
    if ob.animation_data and ob.animation_data.action:
        for fc in ob.animation_data.action.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = "BEZIER"
                kp.easing = "AUTO"
