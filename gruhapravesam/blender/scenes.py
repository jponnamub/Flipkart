"""Six animated scenes for the Gruhapravesam invitation.

blender -b -P scenes.py -- --scene 2 --res 720 --out /path/frames [--frames 1-255] [--samples 10]
"""

import argparse
import math
import os
import random
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib  # noqa: E402
from lib import (box, brass, brass_lamp, curve_tube, cylinder, diya, empty, flower_mats, garland_strand,  # noqa: E402
                 kalasham, key, lathe, leaf_mesh, mango_leaf_mat, noise_color, principled, scatter_flowers,
                 swag, uv_sphere, add_noise, ease)

TEX = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tex")

# frames rendered per scene (each but the last carries a 0.5 s tail for the dissolve)
LENGTHS = {1: 165, 2: 255, 3: 165, 4: 225, 5: 225, 6: 180}


# ----------------------------------------------------------------- shared materials and props

def stone_tiles(name, c1=(0.42, 0.38, 0.33), c2=(0.30, 0.27, 0.24), mortar=(0.18, 0.16, 0.14), scale=1.2):
    m = principled(name, c1, rough=0.7)
    nt = m.node_tree
    N, L = nt.nodes, nt.links
    b = N["Principled BSDF"]
    tc = N.new("ShaderNodeTexCoord")
    br = N.new("ShaderNodeTexBrick")
    br.inputs["Color1"].default_value = (*c1, 1)
    br.inputs["Color2"].default_value = (*c2, 1)
    br.inputs["Mortar"].default_value = (*mortar, 1)
    br.inputs["Scale"].default_value = scale
    br.inputs["Mortar Size"].default_value = 0.01
    br.inputs["Brick Width"].default_value = 0.6
    br.inputs["Row Height"].default_value = 0.6
    br.offset = 0.0
    L.new(tc.outputs["Object"], br.inputs["Vector"])
    noi = N.new("ShaderNodeTexNoise")
    noi.inputs["Scale"].default_value = 18
    L.new(tc.outputs["Object"], noi.inputs["Vector"])
    mix = N.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.blend_type = "MULTIPLY"
    mix.inputs["Factor"].default_value = 0.35
    L.new(br.outputs["Color"], mix.inputs["A"])
    L.new(noi.outputs["Color"], mix.inputs["B"])
    L.new(mix.outputs["Result"], b.inputs["Base Color"])
    bn = N.new("ShaderNodeBump")
    bn.inputs["Strength"].default_value = 0.4
    L.new(br.outputs["Fac"], bn.inputs["Height"])
    L.new(bn.outputs["Normal"], b.inputs["Normal"])
    return m


def plaster(name, c1=(0.82, 0.72, 0.56), c2=(0.90, 0.82, 0.66)):
    m = principled(name, c1, rough=0.85)
    return noise_color(m, c1, c2, scale=3, bump=0.15, bump_scale=40)


def plane(name, loc, size, mat, rot=(0, 0, 0)):
    return box(name, loc, (size[0], size[1], 0.002), mat, rot=rot)


def rangoli_plane(loc, size):
    m = lib.image_mat("Rangoli", os.path.join(TEX, "rangoli.png"), rough=0.9)
    import bmesh
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=size / 2)
    uv = bm.loops.layers.uv.new()
    for f in bm.faces:
        for lp in f.loops:
            lp[uv].uv = (lp.vert.co.x / size + 0.5, lp.vert.co.y / size + 0.5)
    ob = lib.mesh_from_bm("Rangoli", bm, [m], smooth_shade=False)
    ob.location = loc
    return ob


def torus(name, R, r, mat, loc=(0, 0, 0), rot=(0, 0, 0), seg=48, rseg=10):
    prof = [(R + r * math.cos(2 * math.pi * i / rseg - math.pi / 2), r * math.sin(2 * math.pi * i / rseg - math.pi / 2))
            for i in range(rseg + 1)]
    ob = lathe(name, prof, mat, seg=seg)
    ob.location = loc
    ob.rotation_euler = rot
    return ob


def toranam(name, x0, x1, y, z, n=21, seed=5):
    """Mango-leaf toranam with a marigold swag, every leaf on its own swaying pivot."""
    rnd = random.Random(seed)
    lm = mango_leaf_mat()
    string_m = principled("Thread", (0.7, 0.55, 0.2), rough=0.6)
    curve_tube(name + "_string", [(x0, y, z), ((x0 + x1) / 2, y, z - 0.03), (x1, y, z)], 0.006, string_m)
    for i in range(n):
        t = i / (n - 1)
        x = x0 + (x1 - x0) * t
        zz = z - 0.03 * 4 * t * (1 - t)
        piv = empty(f"{name}_p{i}", (x, y - 0.01, zz), rot=(math.pi / 2 + rnd.uniform(-0.1, 0.1), math.pi / 2, 0))
        lf = leaf_mesh(f"{name}_leaf{i}", rnd.uniform(0.24, 0.3), 0.075, 0.02, lm, curl=0.02)
        lf.parent = piv
        key(piv, "rotation_euler", 1)
        add_noise(piv, "rotation_euler", 0, 0.16, 26, rnd.uniform(0, 99))
        add_noise(piv, "rotation_euler", 1, 0.08, 34, rnd.uniform(0, 99))
    sp, _ = swag(name + "_swag", (x0, y - 0.03, z - 0.02), (x1, y - 0.03, z - 0.02), 0.22, seed=seed + 1)
    key(sp, "rotation_euler", 1)
    add_noise(sp, "rotation_euler", 0, 0.05, 40, rnd.uniform(0, 99))
    return sp


def sway(ob, amt=0.06, scale=35, seed=None):
    rnd = random.Random(seed)
    key(ob, "rotation_euler", 1)
    add_noise(ob, "rotation_euler", 0, amt, scale, rnd.uniform(0, 99))
    add_noise(ob, "rotation_euler", 1, amt * 0.7, scale * 1.2, rnd.uniform(0, 99))


def hanging_bell(name, top, length, mat, swing=0.12, period=70, phase=0.0):
    piv = empty(name, top)
    n = int(length / 0.03)
    import bmesh
    from mathutils import Matrix
    bm = bmesh.new()
    for i in range(n):
        bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.009, matrix=Matrix.Translation((0, 0, -i * 0.03)))
    chain = lib.mesh_from_bm(name + "_chain", bm, [mat])
    chain.parent = piv
    prof = [(0.0, -0.11), (0.05, -0.11), (0.052, -0.1), (0.045, -0.06), (0.03, -0.02), (0.012, 0.0), (0.0, 0.01)]
    bell = lathe(name + "_bell", prof, mat, seg=40)
    bell.parent = piv
    bell.location = (0, 0, -length)
    clap = uv_sphere(name + "_clap", (0, 0, -length - 0.1), (0.014, 0.014, 0.014), mat)
    clap.parent = piv
    for f in range(1, 400, 3):
        a = swing * math.sin(2 * math.pi * f / period + phase)
        piv.rotation_euler = (a, a * 0.3, 0)
        piv.keyframe_insert("rotation_euler", frame=f)
    return piv


# ----------------------------------------------------------------- Ganesha idol

def ganesha(loc, scale=1.0):
    root = empty("Ganesha", loc)
    root.scale = (scale, scale, scale)
    skin = principled("GSkin", (0.95, 0.70, 0.55), rough=0.38, sss=0.15, coat=0.25)
    noise_color(skin, (0.92, 0.64, 0.50), (0.97, 0.75, 0.60), scale=6)
    silk = principled("GSilk", (0.62, 0.04, 0.06), rough=0.32, sheen=0.6, coat=0.2)
    gold = lib.gold("GGold")
    earm = principled("GEar", (0.96, 0.66, 0.58), rough=0.4, sss=0.25)
    dark = principled("GEye", (0.02, 0.02, 0.02), rough=0.1, coat=1)
    white = principled("GWhite", (0.95, 0.93, 0.88), rough=0.3)
    red = principled("GTilak", (0.75, 0.02, 0.04), rough=0.5)

    ped = lathe("G_pedestal", [(0.0, -0.09), (0.21, -0.09), (0.215, -0.075), (0.19, -0.065), (0.2, -0.05),
                               (0.215, -0.035), (0.205, -0.02), (0.17, -0.012), (0.17, 0.0), (0.0, 0.0)],
                brass("GBrass"), seg=64)
    ped.parent = root
    # prabhavali arch
    pts = [(0.27 * math.cos(a), 0.09, 0.27 + 0.27 * math.sin(a)) for a in [math.pi * i / 10 for i in range(11)]]
    arch = curve_tube("G_arch", pts, 0.018, gold)
    arch.parent = root
    knob = uv_sphere("G_archtop", (0, 0.09, 0.57), (0.03, 0.02, 0.04), gold)
    knob.parent = root

    lo, lmb = lib._mb("GaneshaLegs", 0.008)
    lib.mell(lmb, (0, 0, 0.055), (0.165, 0.10, 0.055))
    for sx in (-1, 1):
        lib.mball(lmb, (sx * 0.07, -0.08, 0.045), 0.032)
    legs = lib.to_mesh(lo, silk)
    legs.parent = root

    bo, bmb = lib._mb("GaneshaBody", 0.008)
    lib.mball(bmb, (0, -0.03, 0.145), 0.094)
    lib.mell(bmb, (0, 0, 0.235), (0.085, 0.068, 0.07))
    for sx in (-1, 1):
        lib.mball(bmb, (sx * 0.072, 0.0, 0.25), 0.042)
    lib.mell(bmb, (0, -0.01, 0.335), (0.074, 0.068, 0.074))
    for sx in (-1, 1):
        lib.mball(bmb, (sx * 0.034, -0.05, 0.312), 0.04)
    lib.mball(bmb, (0, -0.072, 0.30), 0.03)
    # arms
    arms = [
        [(0.08, 0, 0.25), (0.125, -0.03, 0.18), (0.11, -0.08, 0.245)],
        [(-0.08, 0, 0.25), (-0.12, -0.03, 0.17), (-0.07, -0.09, 0.125)],
        [(0.07, 0.03, 0.27), (0.15, 0.04, 0.30), (0.17, 0.03, 0.38)],
        [(-0.07, 0.03, 0.27), (-0.15, 0.04, 0.30), (-0.17, 0.03, 0.38)],
    ]
    for a in arms:
        lib.mchain(bmb, a[0], a[1], 0.03, 0.024)
        lib.mchain(bmb, a[1], a[2], 0.024, 0.019)
        lib.mball(bmb, a[2], 0.023)
    lib.mell(bmb, (0.11, -0.095, 0.27), (0.024, 0.008, 0.03))
    body = lib.to_mesh(bo, skin)
    body.parent = root

    trunk = curve_tube("G_trunk", [(0, -0.075, 0.305), (0.0, -0.105, 0.25), (0.008, -0.118, 0.19),
                                   (0.03, -0.112, 0.145), (0.05, -0.098, 0.138)], 0.028, skin,
                       radii=[1.0, 0.85, 0.7, 0.55, 0.42])
    trunk.parent = root
    for sx in (-1, 1):
        ear = uv_sphere(f"G_ear{sx}", (sx * 0.098, 0.015, 0.33), (0.075, 0.012, 0.085), earm,
                        rot=(0, 0, sx * 0.3))
        ear.parent = root
        sc = uv_sphere(f"G_sclera{sx}", (sx * 0.03, -0.066, 0.348), (0.011, 0.006, 0.009), white)
        sc.parent = root
        ey = uv_sphere(f"G_eye{sx}", (sx * 0.03, -0.071, 0.348), (0.0065, 0.004, 0.0065), dark)
        ey.parent = root
    tusk = curve_tube("G_tusk", [(0.022, -0.085, 0.29), (0.03, -0.1, 0.275), (0.032, -0.105, 0.262)], 0.006, white,
                      radii=[1, 0.7, 0.2])
    tusk.parent = root
    til = uv_sphere("G_tilak", (0, -0.077, 0.372), (0.005, 0.003, 0.014), red)
    til.parent = root
    crown = lathe("G_crown", [(0.0, 0.0), (0.058, 0.0), (0.062, 0.012), (0.052, 0.035), (0.04, 0.06),
                              (0.03, 0.075), (0.034, 0.085), (0.018, 0.1), (0.008, 0.125), (0.0, 0.135)], gold, seg=48)
    crown.location = (0, -0.005, 0.385)
    crown.parent = root
    neck = torus("G_necklace", 0.07, 0.008, gold, loc=(0, -0.005, 0.27), rot=(0.25, 0, 0))
    neck.parent = root
    modak = uv_sphere("G_modak", (-0.055, -0.12, 0.13), (0.022, 0.022, 0.026), principled("Modak", (0.93, 0.85, 0.65), 0.6))
    modak.parent = root
    for sx in (-1, 1):
        it = uv_sphere(f"G_item{sx}", (sx * 0.172, 0.03, 0.41), (0.012, 0.012, 0.03), gold)
        it.parent = root
    # flower garland over the shoulders
    pts, kinds = [], []
    for i in range(46):
        t = i / 45
        a = math.pi * t
        x = 0.085 * math.cos(a)
        z = 0.27 - 0.13 * math.sin(a) ** 1.4
        y = -0.075 - 0.04 * math.sin(a)
        pts.append((x, y, z))
        kinds.append(0 if i % 3 == 0 else 1)
    g = lib.beads("G_garland", pts, kinds, seed=31)
    g.parent = root
    return root


# ----------------------------------------------------------------- Telugu house entrance

def entrance(door_open_frames=(45, 150), door_start=0.0, door_end=math.radians(102)):
    wall_m = plaster("FacadePlaster", (0.80, 0.70, 0.55), (0.90, 0.81, 0.66))
    wood_m = lib.wood("Teak", (0.10, 0.04, 0.015), (0.34, 0.15, 0.06))
    frame_m = lib.wood("TeakFrame", (0.07, 0.03, 0.01), (0.26, 0.11, 0.04), scale=3.5)
    br = brass()
    granite = noise_color(principled("Granite", (0.30, 0.28, 0.26), rough=0.45, coat=0.2),
                          (0.20, 0.19, 0.18), (0.42, 0.40, 0.37), scale=40, bump=0.1, bump_scale=200)
    turmeric = principled("StepTurmeric", (0.92, 0.62, 0.05), rough=0.7)
    kumkum = principled("StepKumkum", (0.72, 0.03, 0.04), rough=0.6)

    ground = box("Ground", (0, -3, -0.05), (14, 12, 0.1), stone_tiles("Courtyard", (0.58, 0.47, 0.36),
                                                                        (0.50, 0.40, 0.30), (0.32, 0.26, 0.2)))
    # facade with door opening x in [-0.8, 0.8], z in [0.45, 2.75]
    Y = 2.0
    box("WallL", (-2.6, Y + 0.15, 2.1), (3.6, 0.3, 4.2), wall_m)
    box("WallR", (2.6, Y + 0.15, 2.1), (3.6, 0.3, 4.2), wall_m)
    box("WallTop", (0, Y + 0.15, 3.6), (1.6, 0.3, 1.2), wall_m)
    box("WallBottom", (0, Y + 0.15, 0.225), (1.6, 0.3, 0.45), wall_m)
    box("Plinth", (0, Y - 0.02, 0.06), (8.0, 0.06, 0.12), principled("PlinthRed", (0.45, 0.08, 0.05), 0.7))
    box("Cornice", (0, Y - 0.05, 4.05), (8.0, 0.2, 0.12), principled("Cornice", (0.75, 0.6, 0.42), 0.7), bevel=0.02)
    # pillars
    for sx in (-1, 1):
        cylinder(f"Pillar{sx}", (sx * 1.95, Y - 0.25, 2.0), 0.13, 4.0, wall_m, seg=32)
        lathe(f"PillarBase{sx}", [(0.0, 0.0), (0.2, 0.0), (0.2, 0.12), (0.16, 0.16), (0.14, 0.22), (0.0, 0.22)],
              granite, loc=(sx * 1.95, Y - 0.25, 0.0), seg=32)
        lathe(f"PillarCap{sx}", [(0.0, 0.0), (0.14, 0.0), (0.2, 0.1), (0.22, 0.16), (0.0, 0.16)], wall_m,
              loc=(sx * 1.95, Y - 0.25, 3.84), seg=32)
    # carved frame
    for sx in (-1, 1):
        box(f"FramePost{sx}", (sx * 0.92, Y - 0.06, 1.6), (0.24, 0.16, 2.35), frame_m, bevel=0.012)
        box(f"FramePostIn{sx}", (sx * 0.92, Y - 0.15, 1.6), (0.12, 0.03, 2.2), wood_m, bevel=0.008)
        for k in range(9):
            uv_sphere(f"FrameStud{sx}_{k}", (sx * 0.92, Y - 0.17, 0.7 + k * 0.24), (0.022, 0.012, 0.022), br)
    box("Lintel", (0, Y - 0.06, 2.88), (2.1, 0.18, 0.26), frame_m, bevel=0.015)
    box("LintelPanel", (0, Y - 0.16, 2.88), (1.7, 0.03, 0.14), wood_m, bevel=0.008)
    for k in range(11):
        uv_sphere(f"LintelStud{k}", (-0.75 + k * 0.15, Y - 0.18, 2.88), (0.02, 0.012, 0.02), br)
    box("Threshold", (0, Y - 0.05, 0.47), (1.9, 0.22, 0.06), frame_m, bevel=0.01)
    # turmeric and kumkum on the threshold
    box("ThreshTurmeric", (0, Y - 0.162, 0.47), (1.6, 0.004, 0.05), turmeric)
    for k in range(7):
        uv_sphere(f"ThreshDot{k}", (-0.6 + k * 0.2, Y - 0.166, 0.47), (0.016, 0.004, 0.016), kumkum)

    # steps
    for i, (yy, h) in enumerate(((1.05, 0.15), (1.35, 0.30), (1.65, 0.45))):
        depth = Y - yy
        box(f"Step{i}", (0, yy + depth / 2, h / 2), (2.4 - i * 0.2, depth, h), granite, bevel=0.01)
        box(f"StepPaint{i}", (0, yy - 0.002, h - 0.04), (2.3 - i * 0.2, 0.004, 0.05), turmeric)
        for k in range(9 - i):
            uv_sphere(f"StepDot{i}_{k}", (-0.9 + i * 0.1 + k * 0.23, yy - 0.005, h - 0.04),
                      (0.014, 0.004, 0.014), kumkum)

    # interior glimpse
    room_m = plaster("RoomPlaster", (0.80, 0.62, 0.42), (0.88, 0.70, 0.50))
    box("RoomFloor", (0, 4.0, 0.42), (3.4, 4.0, 0.06), stone_tiles("RoomFloorTiles", (0.6, 0.5, 0.38), (0.5, 0.42, 0.32),
                                                                     (0.3, 0.25, 0.2), scale=1.6))
    box("RoomBack", (0, 6.0, 1.8), (3.4, 0.1, 3.0), room_m)
    box("RoomL", (-1.7, 4.0, 1.8), (0.1, 4.0, 3.0), room_m)
    box("RoomR", (1.7, 4.0, 1.8), (0.1, 4.0, 3.0), room_m)
    box("RoomCeil", (0, 4.0, 3.3), (3.4, 4.0, 0.1), room_m)
    lib.area("RoomLight", (0, 4.2, 3.1), (0, 0, 0), 120, size=1.6, color=(1.0, 0.72, 0.45))
    brass_lamp("InnerLamp", (0, 5.2, 0.45), scale=1.6, energy=10)
    box("InnerRug", (0, 4.6, 0.455), (1.2, 1.6, 0.01), principled("Rug", (0.5, 0.05, 0.06), 0.9))

    # doors on hinges
    doors = []
    for side, hx in (("L", -0.8), ("R", 0.8)):
        sgn = 1 if side == "L" else -1
        piv = empty(f"Door{side}", (hx, Y - 0.02, 0.5))
        w, h = 0.8, 2.25
        slab = box(f"Door{side}_slab", (sgn * w / 2, 0, h / 2), (w, 0.06, h), wood_m, bevel=0.008)
        slab.parent = piv
        for r, (zc, ph) in enumerate(((0.32, 0.42), (0.92, 0.6), (1.62, 0.62), (2.08, 0.2))):
            pnl = box(f"Door{side}_pnl{r}", (sgn * w / 2, -0.04, zc), (w - 0.2, 0.025, ph), frame_m, bevel=0.012)
            pnl.parent = piv
            if ph > 0.3:
                med = lib.uv_sphere(f"Door{side}_med{r}", (sgn * w / 2, -0.055, zc), (0.11, 0.012, min(0.11, ph * 0.3)),
                                    wood_m, seg=32, rings=12)
                med.parent = piv
                rim = torus(f"Door{side}_rim{r}", 0.13, 0.008, br, loc=(sgn * w / 2, -0.056, zc), rot=(math.pi / 2, 0, 0))
                rim.parent = piv
        for zr in (0.07, 0.6, 1.25, 1.95, 2.2):
            for k in range(5):
                st = uv_sphere(f"Door{side}_stud{zr}_{k}", (sgn * (0.08 + k * 0.16), -0.04, zr), (0.018, 0.014, 0.018), br,
                               seg=12, rings=8)
                st.parent = piv
        knob = uv_sphere(f"Door{side}_knob", (sgn * (w - 0.08), -0.06, 1.15), (0.03, 0.03, 0.03), br)
        knob.parent = piv
        ring = torus(f"Door{side}_ring", 0.05, 0.007, br, loc=(sgn * (w - 0.08), -0.075, 1.09), rot=(math.pi / 2, 0, 0))
        ring.parent = piv
        f0, f1 = door_open_frames
        a0 = door_start * sgn
        a1 = door_end * sgn
        key(piv, "rotation_euler", 1, (0, 0, a0))
        key(piv, "rotation_euler", f0, (0, 0, a0))
        key(piv, "rotation_euler", f1, (0, 0, a1))
        fc = lib.fcurve(piv, "rotation_euler", 2)
        for kp in fc.keyframe_points:
            kp.interpolation = "BEZIER"
        doors.append(piv)

    # decorations
    toranam("Toran", -1.05, 1.05, Y - 0.2, 3.02, n=23)
    for sx in (-1, 1):
        for j, off in enumerate((0.0, 0.07)):
            piv, _ = garland_strand(f"Strand{sx}_{j}", (sx * (0.98 + off), Y - 0.2 - off * 0.3, 3.0), 2.1 - j * 0.35,
                                    pattern=(0, 0, 0, 1, 1) if j == 0 else (1, 1, 1, 0), seed=40 + j + sx)
            sway(piv, 0.035, 45, seed=sx * 10 + j)
    for k, x in enumerate((-0.45, 0.0, 0.45)):
        piv, _ = garland_strand(f"Tassel{k}", (x, Y - 0.24, 2.98), 0.45 if k != 1 else 0.6, pattern=(0, 1, 1), seed=60 + k)
        sway(piv, 0.06, 30, seed=70 + k)
    for sx in (-1, 1):
        lib.banana_plant(f"Banana{sx}", (sx * 1.45, Y - 0.45, 0.0), height=2.5, seed=3 + sx, rot=sx * 0.4)
        lib.clay_pot(f"BananaPot{sx}", (sx * 1.45, Y - 0.45, 0.0), scale=0.9)
        brass_lamp(f"StepLamp{sx}", (sx * 0.62, 1.82, 0.45), scale=0.9, energy=4)
    for k in range(6):
        x = -0.85 + k * 0.34
        diya(f"Diya{k}", (x, 1.12, 0.15), scale=1.0, energy=1.8 if k % 2 == 0 else 0.0)
    kalasham("DoorKalasham", (0.95, 1.5, 0.30), scale=1.1)
    rangoli_plane((0.1, -0.55, 0.004), 2.0)
    scatter_flowers("RangoliFlowers", (0.1, -0.55), 0.0, 90, seed=9, z=0.004, ring=(1.0, 1.08))
    return doors


def cattle_pair():
    cow = lib.Cattle("Cow")
    calf = lib.Cattle("Calf", calf=True)
    return cow, calf


def sky_and_sun():
    lib.world((0.80, 0.62, 0.45), 0.65, sky_top=(0.40, 0.56, 0.82))
    lib.sun((math.radians(58), 0, math.radians(-38)), 4.2, color=(1.0, 0.82, 0.62), angle=0.04)
    lib.area("Fill", (0.5, -5, 3), (math.radians(65), 0, 0), 130, size=4, color=(0.85, 0.88, 1.0))


# ----------------------------------------------------------------- scenes

def scene1():
    lib.world((0.03, 0.022, 0.018), 1.0)
    table = box("Table", (0, 0.2, -0.03), (2.4, 2.0, 0.06), lib.wood("TableWood", (0.05, 0.02, 0.01), (0.2, 0.09, 0.04),
                                                                         scale=1.5, stretch=(1, 6, 1)))
    box("BackWall", (0, 1.0, 1.0), (3, 0.1, 2.2), plaster("ShrineWall", (0.20, 0.11, 0.07), (0.28, 0.16, 0.10)))
    lib.area("Window", (-1.3, 0.1, 1.0), (0, math.radians(-70), 0), 55, size=0.8, color=(1.0, 0.86, 0.7))
    lib.area("Rim", (0.6, 0.9, 0.9), (math.radians(-120), 0, math.radians(20)), 12, size=0.6, color=(1.0, 0.7, 0.45))
    ganesha((0.12, 0.38, 0.09), scale=1.05)
    brass_lamp("Kuthuvilakku", (-0.13, -0.10, 0.0), scale=0.92, energy=4.5)
    scatter_flowers("TableFlowers", (0.0, 0.05), 0.5, 90, seed=12, z=0.0)
    scatter_flowers("PedestalFlowers", (0.12, 0.38), 0.0, 40, seed=13, z=0.0, ring=(0.24, 0.32))
    piv, _ = garland_strand("FrontGarland", (-0.36, -0.42, 0.75), 0.6, pattern=(0, 0, 1, 1, 1), seed=14)
    sway(piv, 0.08, 30, seed=15)
    piv2, _ = garland_strand("FrontGarland2", (0.42, -0.30, 0.78), 0.45, pattern=(1, 1, 0, 0), seed=16)
    sway(piv2, 0.07, 26, seed=17)

    cam, tgt = lib.camera(42, fstop=2.8)
    lib.path_keys(cam, [(1, (-0.02, -1.75, 0.50)), (165, (0.04, -1.38, 0.44))])
    lib.path_keys(tgt, [(1, (-0.06, 0.05, 0.33)), (165, (0.05, 0.3, 0.33))])
    cam.data.dof.focus_distance = 1.62
    cam.data.dof.keyframe_insert("focus_distance", frame=1)
    cam.data.dof.keyframe_insert("focus_distance", frame=35)
    cam.data.dof.focus_distance = 1.68
    cam.data.dof.keyframe_insert("focus_distance", frame=120)


def scene2():
    sky_and_sun()
    entrance(door_open_frames=(40, 150))
    cow, calf = cattle_pair()
    cow.place((-0.45, 0.2, 0.0), math.radians(-48))
    cow.stand()
    cow.blink([70, 148, 212, 248])
    cow.head_pose(1, yaw=0.30, pitch=-0.05)
    cow.head_pose(95, yaw=0.30, pitch=-0.05)
    cow.head_pose(145, yaw=-0.12, pitch=0.05)
    cow.head_pose(200, yaw=-0.20, pitch=0.42)
    cow.head_pose(255, yaw=-0.14, pitch=0.30)
    cow.head_idle(0.03)
    cow.shift_weight(150, 185, "FR", 0.2)
    calf.walk(55, 178, (2.55, -1.35, 0.0), (1.12, -0.92, 0.0), math.radians(162))
    calf.blink([120, 196, 240])
    calf.head_pose(1, yaw=0.0, pitch=0.05)
    calf.head_pose(178, yaw=0.05, pitch=0.05)
    calf.head_pose(215, yaw=0.18, pitch=-0.25)
    calf.head_pose(255, yaw=0.12, pitch=-0.18)
    calf.head_idle(0.04)

    cam, tgt = lib.camera(28, fstop=5.6)
    cam.data.dof.focus_object = cow.neck
    lib.path_keys(cam, [(1, (0.95, -2.7, 0.45)), (90, (0.7, -3.5, 0.95)), (255, (0.45, -4.2, 1.30))])
    lib.path_keys(tgt, [(1, (0.7, -0.5, 0.0)), (90, (0.3, 0.4, 0.85)), (255, (0.2, 1.0, 1.3))])


def scene3():
    lib.world((0.08, 0.06, 0.05), 0.8)
    wall = plaster("InteriorWall", (0.85, 0.76, 0.62), (0.92, 0.84, 0.70))
    teak = lib.wood("InteriorTeak", (0.09, 0.035, 0.012), (0.30, 0.13, 0.05))
    marble = noise_color(principled("Marble", (0.86, 0.82, 0.76), rough=0.18, coat=0.3), (0.78, 0.74, 0.68),
                         (0.93, 0.90, 0.85), scale=4)
    box("Floor", (0, 1.5, -0.03), (6, 7, 0.06), marble)
    box("Back", (0, 3.6, 1.7), (6, 0.1, 3.4), wall)
    box("Wainscot", (0, 3.54, 0.5), (6, 0.04, 1.0), teak)
    box("Ceiling", (0, 1.5, 3.4), (6, 7, 0.1), wall)
    # left wall with a window opening y in [0.6, 2.2], z in [0.9, 2.5]
    box("LeftA", (-2.2, -0.9, 1.7), (0.1, 3.0, 3.4), wall)
    box("LeftB", (-2.2, 2.9, 1.7), (0.1, 1.4, 3.4), wall)
    box("LeftC", (-2.2, 1.4, 0.45), (0.1, 1.6, 0.9), wall)
    box("LeftD", (-2.2, 1.4, 2.95), (0.1, 1.6, 0.9), wall)
    box("RightWall", (2.2, 1.5, 1.7), (0.1, 7, 3.4), wall)
    lib.sun((math.radians(60), 0, math.radians(-75)), 5.0, color=(1.0, 0.84, 0.64), angle=0.03)
    lib.area("Ambient", (0, 0, 3.2), (0, 0, 0), 180, size=3.0, color=(1.0, 0.85, 0.7))
    sheer = principled("Sheer", (0.95, 0.92, 0.85), rough=0.6, trans=0.0, sss=0.3)
    sheer.surface_render_method = "DITHERED"
    sheer.node_tree.nodes["Principled BSDF"].inputs["Alpha"].default_value = 0.55
    import bmesh
    for k, y in enumerate((0.85, 1.95)):
        bm = bmesh.new()
        bmesh.ops.create_grid(bm, x_segments=20, y_segments=30, size=0.5)
        ob = lib.mesh_from_bm(f"Curtain{k}", bm, [sheer])
        ob.location = (-2.1, y, 1.65)
        ob.rotation_euler = (math.pi / 2, 0, math.pi / 2)
        ob.scale = (0.7, 1.7, 1.0)
        wv = ob.modifiers.new("wave", "WAVE")
        wv.use_normal = True
        wv.height = 0.03
        wv.width = 0.35
        wv.speed = 0.012
        wv.narrowness = 1.2
    toranam("InTorana", -1.4, 1.4, 3.45, 2.95, n=25, seed=8)
    for sx in (-1, 1):
        hanging_bell(f"Gantalu{sx}", (sx * 0.72, 1.6, 3.35), 1.05, brass(), swing=0.10, period=80, phase=sx)
        piv, _ = garland_strand(f"WallStrand{sx}", (sx * 0.95, 3.45, 2.95), 1.5, pattern=(0, 0, 1, 1), seed=50 + sx)
        sway(piv, 0.03, 40, seed=sx)
    mural = rangoli_plane((0, 3.548, 1.55), 1.0)
    mural.rotation_euler = (math.pi / 2, 0, 0)
    mural.location = (0, 3.545, 1.55)
    torus("MuralRim", 0.51, 0.02, lib.gold("MuralGold"), loc=(0, 3.54, 1.55), rot=(math.pi / 2, 0, 0), seg=64)
    for sx in (-1, 1):
        box(f"ArchPillar{sx}", (sx * 1.05, 3.45, 1.4), (0.14, 0.14, 2.8), teak, bevel=0.01)
    box("ArchBeam", (0, 3.45, 2.82), (2.3, 0.16, 0.16), teak, bevel=0.01)
    box("Bench", (0, 3.05, 0.25), (1.6, 0.5, 0.06), teak, bevel=0.01)
    for sx in (-1, 1):
        box(f"BenchLeg{sx}", (sx * 0.7, 3.05, 0.11), (0.08, 0.42, 0.22), teak)
    brass_lamp("BenchLamp", (-0.45, 3.05, 0.28), scale=1.0, energy=4)
    kalasham("BenchKalasham", (0.35, 3.05, 0.28), scale=0.9)
    scatter_flowers("BenchFlowers", (0, 3.05), 0.0, 50, seed=19, z=0.28, ring=(0.0, 0.25))
    # brass urli with floating flowers and diyas
    lathe("Urli", [(0.0, 0.0), (0.18, 0.0), (0.34, 0.06), (0.40, 0.14), (0.42, 0.16), (0.38, 0.15), (0.0, 0.12)],
          brass("UrliBrass"), loc=(0, 1.0, 0.0), seg=64)
    water = principled("Water", (0.05, 0.1, 0.1), rough=0.05, coat=1.0)
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, segments=48, radius=0.37)
    wob = lib.mesh_from_bm("UrliWater", bm, [water])
    wob.location = (0, 1.0, 0.13)
    scatter_flowers("UrliFlowers", (0, 1.0), 0.33, 45, seed=21, z=0.12)
    for k in range(3):
        a = 2 * math.pi * k / 3
        d = diya(f"UrliDiya{k}", (0.18 * math.cos(a), 1.0 + 0.18 * math.sin(a), 0.125), scale=0.8, energy=1.5)
        key(d, "location", 1)
        add_noise(d, "location", 2, 0.006, 25)
    lib.falling_petals("Petal", 14, (-1.2, 0.0, 0.3), (1.2, 2.2, 2.6), 1, 165)

    cam, tgt = lib.camera(30, fstop=4.0)
    cam.data.dof.focus_distance = 3.2
    lib.path_keys(cam, [(1, (-0.25, -2.3, 1.30)), (165, (0.22, -1.7, 1.2))])
    lib.path_keys(tgt, [(1, (-0.05, 2.5, 1.55)), (165, (0.05, 2.5, 1.45))])


def scene4():
    lib.world((0.05, 0.035, 0.025), 1.0)
    lib.area("Soft", (0, -1.0, 2.2), (math.radians(25), 0, 0), 60, size=2.0, color=(1.0, 0.82, 0.62))
    floor_m = noise_color(principled("DarkGranite", (0.10, 0.09, 0.085), rough=0.35, coat=0.3), (0.06, 0.055, 0.05),
                          (0.16, 0.14, 0.13), scale=30, bump=0.08, bump_scale=200)
    box("Floor", (0, 0, -0.03), (8, 8, 0.06), floor_m)
    rangoli_plane((0, 0, 0.002), 1.5)
    br = brass("PlateBrass")
    lathe("Plate", [(0.0, 0.0), (0.2, 0.0), (0.24, 0.015), (0.25, 0.022), (0.235, 0.02), (0.0, 0.012)], br, seg=64)
    rice = noise_color(principled("Rice", (0.93, 0.91, 0.85), rough=0.7), (0.85, 0.83, 0.76), (0.98, 0.96, 0.9),
                       scale=80, bump=0.8, bump_scale=400)
    lathe("RiceHeap", [(0.0, 0.012), (0.2, 0.012), (0.17, 0.03), (0.1, 0.045), (0.0, 0.05)], rice, seg=48)
    kalasham("Kalasham", (0, 0, 0.04), scale=1.15, leaf_seed=6)
    scatter_flowers("RingFlowers", (0, 0), 0.0, 220, seed=24, z=0.0, ring=(0.27, 0.42))
    for sx in (-1, 1):
        brass_lamp(f"KLamp{sx}", (sx * 0.45, 0.18, 0.0), scale=0.62, energy=3.5)
    yellow = principled("Banana", (0.85, 0.66, 0.12), rough=0.5)
    noise_color(yellow, (0.75, 0.55, 0.1), (0.92, 0.75, 0.2), scale=12)
    for k in range(4):
        a = -0.4 + k * 0.12
        pts = [(-0.38 + 0.02 * k, -0.30 + 0.0, 0.03), (-0.30 + 0.02 * k, -0.36 + 0.01 * k, 0.045),
               (-0.20 + 0.02 * k, -0.37 + 0.015 * k, 0.03)]
        curve_tube(f"Banana{k}", pts, 0.02, yellow, radii=[0.5, 1.0, 0.45])
    betel = principled("Betel", (0.08, 0.30, 0.05), rough=0.3, coat=0.3)
    for k in range(5):
        lf = leaf_mesh(f"Betel{k}", 0.14, 0.09, 0.0, betel, curl=0.01)
        lf.location = (0.32, -0.32, 0.012 + k * 0.002)
        lf.rotation_euler = (0, 0, 2.2 + k * 0.5)
    # bokeh lamps far away
    em = principled("Bokeh", (0, 0, 0), emit=(1.0, 0.6, 0.25), estr=25)
    rnd = random.Random(3)
    for k in range(16):
        uv_sphere(f"Bokeh{k}", (rnd.uniform(-2.5, 2.5), rnd.uniform(2.5, 4.5), rnd.uniform(0.1, 1.5)),
                  (0.02, 0.02, 0.02), em, seg=8, rings=6)
    lib.area("Key", (-0.9, -0.6, 1.3), (math.radians(50), math.radians(-35), 0), 40, size=0.8, color=(1.0, 0.85, 0.65))
    lib.area("Back", (0.5, 1.2, 0.9), (math.radians(-60), 0, math.radians(160)), 18, size=0.7, color=(1.0, 0.65, 0.4))
    lib.falling_petals("KPetal", 10, (-0.5, -0.4, 0.15), (0.5, 0.4, 0.9), 1, 225, seed=31)

    cam, tgt = lib.camera(35, fstop=3.2)
    cam.data.dof.focus_distance = 1.75
    for f in range(1, 226, 5):
        t = (f - 1) / 224
        a = math.radians(-112 + 36 * ease(t))
        r = 1.85 - 0.15 * t
        cam.location = (r * math.cos(a), r * math.sin(a), 0.95 - 0.1 * t)
        cam.keyframe_insert("location", frame=f)
    tgt.location = (0, 0, 0.36)


def scene5():
    lib.world((0.05, 0.035, 0.025), 1.0)
    wall = plaster("PujaWall", (0.78, 0.62, 0.45), (0.86, 0.70, 0.52))
    teak = lib.wood("PeethamTeak", (0.08, 0.03, 0.01), (0.30, 0.13, 0.05))
    box("Floor", (0, 0, -0.03), (6, 6, 0.06), stone_tiles("PujaFloor", (0.55, 0.45, 0.35), (0.45, 0.37, 0.29),
                                                           (0.25, 0.2, 0.16), scale=2))
    box("Wall", (0, 0.72, 1.5), (4, 0.1, 3.0), wall)
    # framed patam
    frame_m = lib.wood("PatamFrame", (0.06, 0.02, 0.01), (0.22, 0.09, 0.03), scale=4)
    box("PatamFrame", (0, 0.645, 1.18), (0.62, 0.05, 0.82), frame_m, bevel=0.012)
    box("PatamGold", (0, 0.618, 1.18), (0.56, 0.01, 0.76), lib.gold("PatamGoldTrim"))
    pic = lib.image_mat("Patam", os.path.join(TEX, "satyanarayana_patam.jpg"), rough=0.35, emit=0.15)
    import bmesh
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5)
    uv = bm.loops.layers.uv.new()
    for f in bm.faces:
        for lp in f.loops:
            lp[uv].uv = (lp.vert.co.x + 0.5, lp.vert.co.y + 0.5)
    pob = lib.mesh_from_bm("PatamImage", bm, [pic], smooth_shade=False)
    pob.location = (0, 0.61, 1.18)
    pob.rotation_euler = (math.pi / 2, 0, 0)
    pob.scale = (0.5, 0.70, 1)
    sp, _ = swag("PatamSwag", (-0.33, 0.58, 1.6), (0.33, 0.58, 1.6), 0.18, seed=41)
    sway(sp, 0.03, 40, seed=42)
    for sx in (-1, 1):
        piv, _ = garland_strand(f"PatamStrand{sx}", (sx * 0.34, 0.58, 1.6), 0.75, pattern=(0, 0, 1, 1), seed=43 + sx)
        sway(piv, 0.03, 38, seed=44 + sx)
    # peetham with cloth
    box("PeethamTop", (0, 0.32, 0.36), (1.1, 0.55, 0.05), teak, bevel=0.01)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(f"PLeg{sx}{sy}", (sx * 0.48, 0.32 + sy * 0.22, 0.17), (0.06, 0.06, 0.34), teak)
    cloth = principled("Cloth", (0.95, 0.93, 0.86), rough=0.8, sheen=0.4)
    border = principled("ClothBorder", (0.65, 0.05, 0.05), rough=0.5, sheen=0.5)
    box("Cloth", (0, 0.30, 0.39), (1.0, 0.5, 0.012), cloth)
    box("ClothDrape", (0, 0.05, 0.33), (1.0, 0.012, 0.12), cloth)
    box("ClothBorderF", (0, 0.043, 0.28), (1.0, 0.004, 0.03), border)
    box("Kolam", (0, -0.25, 0.002), (0.9, 0.5, 0.002), principled("KolamBase", (0.6, 0.05, 0.08), 0.8))
    rangoli_plane((0, -0.25, 0.006), 0.48)
    kalasham("PujaKalasham", (0, 0.36, 0.40), scale=0.62, leaf_seed=8)
    for sx in (-1, 1):
        brass_lamp(f"PujaLamp{sx}", (sx * 0.38, 0.30, 0.40), scale=0.55, energy=3.5)
        lib.banana_plant(f"PujaBanana{sx}", (sx * 0.78, 0.45, 0.0), height=1.9, seed=9 + sx, rot=sx * 0.6)
    yellow = principled("BananaP", (0.88, 0.68, 0.12), rough=0.5)
    for k in range(4):
        pts = [(-0.26 + 0.015 * k, 0.20, 0.405), (-0.19 + 0.015 * k, 0.15 + 0.01 * k, 0.42), (-0.11 + 0.015 * k, 0.16, 0.405)]
        curve_tube(f"PBanana{k}", pts, 0.016, yellow, radii=[0.5, 1.0, 0.45])
    coco = bpy.data.materials.get("Coconut")
    uv_sphere("PCoconut", (0.20, 0.17, 0.44), (0.05, 0.05, 0.06), coco)
    betel = principled("BetelP", (0.08, 0.30, 0.05), rough=0.3, coat=0.3)
    for k in range(4):
        lf = leaf_mesh(f"PBetel{k}", 0.11, 0.07, 0.0, betel, curl=0.01)
        lf.location = (0.12, 0.12, 0.398 + k * 0.002)
        lf.rotation_euler = (0, 0, 3.5 + k * 0.4)
    kum = principled("PKumkum", (0.70, 0.02, 0.03), rough=0.8)
    pas = principled("PTurmeric", (0.92, 0.62, 0.05), rough=0.8)
    for k, (m, x) in enumerate(((kum, -0.06), (pas, 0.05))):
        lathe(f"Bowl{k}", [(0.0, 0.0), (0.03, 0.0), (0.04, 0.02), (0.0, 0.018)], lib.brass(f"BowlBrass{k}"),
              loc=(x, 0.12, 0.396), seg=24)
        uv_sphere(f"Powder{k}", (x, 0.12, 0.414), (0.032, 0.032, 0.012), m)
    scatter_flowers("PeethamFlowers", (0, 0.3), 0.0, 70, seed=33, z=0.396, ring=(0.12, 0.28))
    scatter_flowers("FloorFlowers", (0, -0.25), 0.0, 60, seed=34, z=0.006, ring=(0.25, 0.32))
    hanging_bell("PujaBell", (0.55, 0.15, 1.95), 0.55, brass("BellBrass"), swing=0.16, period=55)
    # aarti: a brass plate with camphor, circling in front of the patam; its handle runs off frame
    root = empty("Aarti", (0, 0, 0))
    plate = lathe("AartiPlate", [(0.0, 0.0), (0.07, 0.0), (0.085, 0.01), (0.09, 0.016), (0.08, 0.014), (0.0, 0.006)],
                  brass("AartiBrass"), seg=48)
    plate.parent = root
    lib.flame("Camphor", (0, 0, 0.01), size=1.9, energy=9, parent=root, seed=5)
    handle = curve_tube("AartiHandle", [(0.08, -0.02, 0.0), (0.25, -0.15, -0.12), (0.45, -0.35, -0.35)], 0.008,
                        brass("HandleBrass"))
    handle.parent = root
    for f in range(1, 226, 2):
        t = (f - 1) / 30.0
        a = -2 * math.pi * t / 2.6
        rr = 0.16
        root.location = (0.0 + rr * math.sin(a), -0.12, 0.95 + rr * math.cos(a))
        root.rotation_euler = (0, 0, 0.1 * math.sin(a))
        root.keyframe_insert("location", frame=f)
        root.keyframe_insert("rotation_euler", frame=f)
    lib.area("Key", (-0.8, -1.2, 1.8), (math.radians(55), math.radians(-25), 0), 70, size=1.2, color=(1.0, 0.85, 0.68))
    lib.area("Fill", (0.9, -1.0, 1.2), (math.radians(60), math.radians(30), 0), 15, size=1.0, color=(1.0, 0.75, 0.55))

    cam, tgt = lib.camera(32, fstop=4.0)
    cam.data.dof.focus_distance = 1.7
    lib.path_keys(cam, [(1, (0.0, -1.85, 0.92)), (225, (0.06, -1.58, 0.90))])
    lib.path_keys(tgt, [(1, (0.0, 0.4, 0.88)), (225, (0.02, 0.4, 0.90))])


def scene6():
    sky_and_sun()
    entrance(door_open_frames=(1, 60), door_start=math.radians(70), door_end=math.radians(104))
    cow, calf = cattle_pair()
    cow.place((-0.45, 0.2, 0.0), math.radians(-48))
    cow.stand()
    cow.blink([40, 120, 165])
    cow.head_pose(1, yaw=-0.18, pitch=0.30)
    for k, f in enumerate(range(20, 181, 30)):
        cow.head_pose(f, yaw=-0.18 + 0.05 * (k % 2), pitch=0.38 if k % 2 == 0 else 0.26)
    cow.head_idle(0.02)
    calf.walk(25, 90, (1.45, -1.05, 0.0), (1.12, -0.92, 0.0), math.radians(162), cycle=22)
    calf.blink([70, 150])
    calf.head_pose(1, yaw=0.12, pitch=-0.15)
    calf.head_pose(100, yaw=0.20, pitch=-0.28)
    calf.head_pose(180, yaw=0.15, pitch=-0.2)
    calf.head_idle(0.04)

    cam, tgt = lib.camera(26, fstop=6.0)
    cam.data.dof.focus_object = cow.neck
    lib.path_keys(cam, [(1, (-0.1, -4.9, 1.65)), (180, (0.45, -4.3, 1.45))])
    lib.path_keys(tgt, [(1, (0.3, 1.0, 1.5)), (180, (0.35, 1.0, 1.4))])


SCENES = {1: scene1, 2: scene2, 3: scene3, 4: scene4, 5: scene5, 6: scene6}


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--scene", type=int, required=True)
    ap.add_argument("--res", type=int, default=720)
    ap.add_argument("--samples", type=int, default=10)
    ap.add_argument("--frames", default=None)
    ap.add_argument("--out", required=True)
    ap.add_argument("--still", action="store_true")
    a = ap.parse_args(argv)
    random.seed(a.scene * 101)
    lib.clear()
    s = lib.setup_render(a.res, a.res * 16 // 9, a.samples)
    SCENES[a.scene]()
    s.frame_start = 1
    s.frame_end = LENGTHS[a.scene]
    if a.frames:
        f0, f1 = (int(x) for x in a.frames.split("-"))
        s.frame_start, s.frame_end = f0, f1
    os.makedirs(a.out, exist_ok=True)
    if a.still:
        s.render.use_overwrite = True
        s.render.use_placeholder = False
        for f in range(s.frame_start, s.frame_end + 1, max(1, (s.frame_end - s.frame_start) // 3 or 1)):
            s.frame_set(f)
            s.render.filepath = os.path.join(a.out, f"s{a.scene}_test_{f:04d}.png")
            bpy.ops.render.render(write_still=True)
        return
    s.render.filepath = os.path.join(a.out, f"s{a.scene}_")
    bpy.ops.render.render(animation=True)


main()
