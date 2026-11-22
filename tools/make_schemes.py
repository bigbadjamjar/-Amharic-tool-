#!/usr/bin/env python3
"""Builds site/css/schemes.css: the extra colour schemes people can pick on the welcome page.

Each scheme starts from one of Rob's palette files (five colours each). This script turns the five
colours into every colour the app needs (page, cards, header, buttons, transcription text, badges...)
for both light and dark mode, and nudges each one darker or lighter until text on it is easy to read
(WCAG AA: at least 4.5 to 1 for text, 3 to 1 for shapes like the switch in the header).

The default scheme ("Summer calm", Palette 1) is not built here: it lives at the top of style.css.

Run it after changing a palette below:   python3 tools/make_schemes.py
The names and the swatches shown on the welcome page are in site/js/schemes.js; keep the ids the same.
"""
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "site" / "css" / "schemes.css"

# id, the palette (as in the PDF), and which palette colour plays which part.
#   head  header band        accent  buttons, links, selected things   rom  transcription text
#   sun   warm highlight     sea/sage  soft fills                      hero  welcome box and "today" box
#   pgk/pgl  the two progress bar colours                             hgold  highlight in the header
#   light_head  True for a pale header with dark writing (for an all-pastel palette)
SCHEMES = [
    dict(id="lake", file="Palette10", pal="05668D 427AA1 EBF2FA 679436 A5BE00",
         head="05668D", accent="05668D", rom="679436", sun="A5BE00", sea="427AA1", sage="679436",
         hero="EBF2FA", pgk="427AA1", pgl="A5BE00", hgold="A5BE00",
         dark_accent="427AA1", dark_rom="A5BE00"),
    dict(id="forest", file="Palette8", pal="132A13 31572C 4F772D 90A955 ECF39E",
         head="31572C", accent="4F772D", rom="4F772D", sun="ECF39E", sea="90A955", sage="4F772D",
         hero="ECF39E", pgk="4F772D", pgl="90A955", hgold="ECF39E",
         dark_accent="90A955", dark_rom="ECF39E"),
    dict(id="coffee", file="Palette7", pal="724319 D88180 F7B1B0 FEEAC7 CAD182",
         head="724319", accent="724319", rom="D88180", sun="FEEAC7", sea="F7B1B0", sage="CAD182",
         hero="FEEAC7", pgk="D88180", pgl="CAD182", hgold="F7B1B0",
         dark_accent="F7B1B0", dark_rom="CAD182"),
    dict(id="lagoon", file="Palette6", pal="0081A7 00AFB9 FDFCDC FED9B7 F07167",
         head="0081A7", accent="0081A7", rom="00AFB9", sun="FED9B7", sea="00AFB9", sage="F07167",
         hero="FDFCDC", pgk="00AFB9", pgl="F07167", hgold="FED9B7",
         dark_accent="00AFB9", dark_rom="FED9B7"),
    dict(id="harar", file="Palette5", pal="264653 2A9D8F E9C46A F4A261 E76F51",
         head="264653", accent="2A9D8F", rom="E76F51", sun="E9C46A", sea="2A9D8F", sage="F4A261",
         hero="E9C46A", pgk="2A9D8F", pgl="F4A261", hgold="E9C46A",
         dark_accent="2A9D8F", dark_rom="E9C46A"),
    dict(id="addis", file="Palette4", pal="0D3B66 FAF0CA F4D35E EE964B F95738",
         head="0D3B66", accent="0D3B66", rom="EE964B", sun="F4D35E", sea="EE964B", sage="FAF0CA",
         hero="FAF0CA", pgk="EE964B", pgl="F4D35E", hgold="F4D35E",
         dark_accent="F4D35E", dark_rom="EE964B"),
    dict(id="meskel", file="Palette2", pal="FB6107 F3DE2C 7CB518 5C8001 FBB02D",
         head="5C8001", accent="FB6107", rom="5C8001", sun="F3DE2C", sea="7CB518", sage="FBB02D",
         hero="F3DE2C", pgk="7CB518", pgl="FBB02D", hgold="FBB02D",
         dark_accent="FBB02D", dark_rom="7CB518"),
    dict(id="mist", file="Palette", pal="FBFBF2 E5E6E4 CFD2CD A6A2A2 847577",
         head="847577", accent="847577", rom="847577", sun="CFD2CD", sea="A6A2A2", sage="CFD2CD",
         hero="E5E6E4", pgk="A6A2A2", pgl="CFD2CD", hgold="E5E6E4",
         dark_accent="CFD2CD", dark_rom="E5E6E4"),
    dict(id="blossom", file="Palette1", pal="7BDFF2 B2F7EF EFF7F6 F7D6E0 F2B5D4",
         head="7BDFF2", accent="7BDFF2", rom="F2B5D4", sun="F7D6E0", sea="B2F7EF", sage="F2B5D4",
         hero="EFF7F6", pgk="7BDFF2", pgl="F2B5D4", hgold="F2B5D4", light_head=True,
         dark_accent="7BDFF2", dark_rom="F2B5D4"),
]

# ---------- colour sums ----------
def rgb(h): h = h.lstrip("#"); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def hexc(c): return "#" + "".join(f"{max(0, min(255, round(v))):02x}" for v in c)
def mix(a, b, t):  # t of b into a
    a, b = rgb(a), rgb(b); return hexc(tuple(x + (y - x) * t for x, y in zip(a, b)))
def lum(h):
    def ch(v):
        v /= 255; return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(v) for v in rgb(h)); return 0.2126 * r + 0.7152 * g + 0.0722 * b
def contrast(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True); return (la + 0.05) / (lb + 0.05)

def until(c, toward, against, need, step=0.02):
    """Move c toward `toward` (a dark or light anchor) until it has `need` contrast with every colour in `against`."""
    t = 0.0
    while t <= 1:
        x = mix(c, toward, t)
        if all(contrast(x, a) >= need for a in against): return x
        t += step
    return toward

def best_ink(bg, dark, light="#ffffff"):
    return dark if contrast(bg, dark) >= contrast(bg, light) else light

def light_mode(s):
    head0 = "#" + s["head"]
    ink = until(mix(head0, "#000000", 0.55), "#000000", ["#ffffff"], 13)
    bg = mix("#" + s["hero"], "#ffffff", 0.75)
    surface = "#ffffff"
    soft = lambda c, amount: until(mix("#" + c, "#ffffff", amount), "#ffffff", [ink], 7)
    tint = mix(soft(s["sea"], 0.78), bg, 0.3)
    hero = soft(s["hero"], 0.45)
    sun = soft(s["sun"], 0.15)
    sea = soft(s["sea"], 0.25)
    sage = soft(s["sage"], 0.25)
    line = mix(tint, ink, 0.1)
    muted = until(mix(ink, bg, 0.25), ink, [tint, hero, bg, surface], 5)
    fills = [bg, surface, tint, hero]
    accent = until("#" + s["accent"], ink, fills, 4.6)
    if contrast(accent, "#ffffff") < 4.6: accent = until(accent, ink, ["#ffffff"] + fills, 4.6)
    rom = until("#" + s["rom"], ink, fills, 4.6)
    if s.get("light_head"):
        head = "#" + s["head"]
        head_ink = until(ink, "#000000", [head], 7)
        hgold = "#" + s["hgold"]
        v = dict(head_bg=head, head_ink=head_ink, head_soft="rgba(0,0,0,.07)", head_muted=mix(head_ink, head, 0.12),
                 head_gold=hgold, head_gold_ink=until(ink, "#000000", [hgold], 7),
                 head_track="rgba(0,0,0,.22)", head_knob="#ffffff", theme=head)
    else:
        head = until(head0, "#000000", ["#ffffff"], 7.5)
        hgold = until("#" + s["hgold"], "#ffffff", [head], 3.2)
        v = dict(head_bg=head, head_ink="#ffffff", head_soft="rgba(255,255,255,.13)", head_muted="rgba(255,255,255,.9)",
                 head_gold=hgold, head_gold_ink=until(mix(head, "#000000", 0.35), "#000000", [hgold], 7),
                 head_track="rgba(255,255,255,.28)", head_knob="#ffffff", theme=head)
    sun_ink = until(mix("#" + s["sun"], "#000000", 0.7), "#000000", [sun], 7)
    v.update(bg=bg, surface=surface, ink=ink, muted=muted, line=line, accent=accent, accent_ink=best_ink(accent, ink),
             tint=tint, gold=rom, sun=sun, sea=sea, sage=sage, lime=hero, hero=hero,
             pg_k=mix("#" + s["pgk"], "#ffffff", 0.15), pg_l=mix("#" + s["pgl"], "#ffffff", 0.15),
             tab_on="#ffffff", tab_on_ink=ink, sun_ink=sun_ink, sun_line=mix(sun, sun_ink, 0.3))
    return v

def dark_mode(s):
    head0 = "#" + s["head"]
    base = head0 if not s.get("light_head") else until(head0, "#000000", ["#ffffff"], 7)
    bg = mix(base, "#0b0b0f", 0.82)
    surface = mix(base, "#0b0b0f", 0.74)
    tint = mix(base, "#0b0b0f", 0.64)
    line = mix(base, "#0b0b0f", 0.56)
    ink = "#eeeee8"
    muted = until(mix(ink, bg, 0.3), ink, [tint, surface, bg], 5)
    fills = [bg, surface, tint]
    accent = until("#" + s["dark_accent"], "#ffffff", fills, 4.8)
    rom = until("#" + s["dark_rom"], "#ffffff", fills, 4.8)
    head = mix(base, "#0b0b0f", 0.55)
    # soft fills stay the palette colours (as in the default dark scheme) but never so bright that they glare
    soft = lambda c: mix("#" + c, bg, 0.12)
    sun = soft(s["sun"])
    sun_ink = until(mix(sun, "#000000", 0.75), "#000000", [sun], 7)
    hgold = until("#" + s["hgold"], "#ffffff", [head], 3.2)
    return dict(bg=bg, surface=surface, ink=ink, muted=muted, line=line, accent=accent, accent_ink=bg, tint=tint, gold=rom,
                sun=sun, sea=soft(s["sea"]), sage=soft(s["sage"]), lime=tint, hero=tint,
                pg_k=mix("#" + s["pgk"], bg, 0.3), pg_l=mix("#" + s["pgl"], bg, 0.3),
                head_bg=head, head_ink=ink, head_soft="rgba(255,255,255,.08)", head_muted="rgba(238,238,232,.8)",
                head_gold=hgold, head_gold_ink=until(mix(hgold, "#000000", 0.75), "#000000", [hgold], 7),
                head_track="rgba(255,255,255,.28)", head_knob="#ffffff",
                tab_on=accent, tab_on_ink=bg, sun_ink=sun_ink, sun_line=mix(sun, sun_ink, 0.3), theme=head)

def block(v):
    return " ".join(f"--{k.replace('_', '-')}:{val};" for k, val in v.items() if k != "theme")

def main():
    out = ["/* Made by tools/make_schemes.py from Rob's palette files. Don't edit by hand: change the script and run it again.",
           "   Each scheme is switched on by <html data-scheme=\"...\"> (see js/schemes.js). The default scheme is in style.css. */"]
    for s in SCHEMES:
        L, D = light_mode(s), dark_mode(s)
        sel = f':root[data-scheme="{s["id"]}"]'
        out.append(f"/* {s['id']}: {s['file']}.pdf  {s['pal']} */")
        out.append(f"{sel}{{{block(L)} --theme:{L['theme']};}}")
        out.append(f"@media (prefers-color-scheme: dark){{{sel}:not([data-theme=\"light\"]){{{block(D)} --theme:{D['theme']};}}}}")
        out.append(f"{sel}[data-theme=\"dark\"]{{{block(D)} --theme:{D['theme']};}}")
    OUT.write_text("\n".join(out) + "\n")
    print(f"wrote {OUT} ({len(SCHEMES)} schemes)")

if __name__ == "__main__":
    main()
