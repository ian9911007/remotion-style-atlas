"""Created: 2026-10-04. Original open-format vector assets, not fabricated editor exports."""
import json
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

destination = Path(__file__).resolve().parent.parent / "public/technology-assets/vector"
destination.mkdir(parents=True, exist_ok=True)

def keyed(start, end):
    return {"a": 1, "k": [{"t": 0, "s": [start], "e": [end], "i": {"x": [.67], "y": [1]}, "o": {"x": [.33], "y": [0]}}, {"t": 120, "s": [end]}]}

layers = []
for index in range(5):
    layers.append({"ddd": 0, "ind": index + 1, "ty": 4, "nm": "Original capsule", "sr": 1, "ks": {"o": {"a": 0, "k": 100}, "r": keyed(0, 180), "p": {"a": 0, "k": [170 + index * 150, 270, 0]}, "a": {"a": 0, "k": [0, 0, 0]}, "s": {"a": 0, "k": [100, 100, 100]}}, "shapes": [{"ty": "rc", "d": 1, "s": {"a": 0, "k": [90, 180-index*17]}, "p": {"a": 0, "k": [0, 0]}, "r": {"a": 0, "k": 45}}, {"ty": "fl", "c": {"a": 0, "k": [[.77, .25, .17, 1], [.12, .35, .30, 1], [.83, .67, .29, 1]][index % 3]}, "o": {"a": 0, "k": 100}, "r": 1}], "ip": 0, "op": 120, "st": 0, "bm": 0})
capsules = {"v": "5.7.4", "fr": 30, "ip": 0, "op": 120, "w": 960, "h": 540, "nm": "Original Capsules", "ddd": 0, "assets": [], "layers": layers}
progress = json.loads(json.dumps(capsules))
progress["nm"] = "Original Progress Ring"
progress["layers"] = [layers[0]]
layer = json.loads(json.dumps(layers[0]))
layer["ks"]["p"]["k"] = [480, 270, 0]
layer["ks"]["r"] = {"a": 0, "k": -90}
layer["shapes"] = [{"ty": "el", "d": 1, "s": {"a": 0, "k": [250, 250]}, "p": {"a": 0, "k": [0, 0]}}, {"ty": "st", "c": {"a": 0, "k": [.12, .35, .30, 1]}, "o": {"a": 0, "k": 100}, "w": {"a": 0, "k": 18}, "lc": 2, "lj": 2}, {"ty": "tm", "s": {"a": 0, "k": 0}, "e": keyed(1, 100), "o": {"a": 0, "k": 0}, "m": 1}]
progress["layers"] = [layer]
assets = {"capsules": capsules, "progress": progress}
for name, value in assets.items():
    (destination / f"{name}.json").write_text(json.dumps(value, separators=(",", ":")))
with ZipFile(destination / "capsules.lottie", "w") as archive:
    content = {"manifest.json": {"version": "2", "generator": "Atlas original procedural asset builder", "animations": [{"id": name, "name": value["nm"]} for name, value in assets.items()], "initial": {"animation": "capsules"}}, **{f"a/{name}.json": value for name, value in assets.items()}}
    for name, value in content.items():
        info = ZipInfo(name)  # Standard fixed ZIP epoch preserves reproducible bytes.
        info.compress_type = ZIP_DEFLATED
        archive.writestr(info, json.dumps(value, separators=(",", ":")))
