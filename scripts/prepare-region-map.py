#!/usr/bin/env python3
"""Created: 2026-10-04. Rebuild the detailed reveal map from pinned Natural Earth data."""
import hashlib
import io
import json
from pathlib import Path
import tarfile
import urllib.request
from datetime import datetime
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/technology-assets/maps"


def features(topology, selected=None):
    transform = topology["transform"]
    cache = {}

    def arc(index):
        key = index if index >= 0 else ~index
        if key not in cache:
            x = y = 0
            points = []
            for dx, dy in topology["arcs"][key]:
                x += dx
                y += dy
                points.append([round(x * transform["scale"][0] + transform["translate"][0], 6),
                               round(y * transform["scale"][1] + transform["translate"][1], 6)])
            cache[key] = points
        return cache[key] if index >= 0 else list(reversed(cache[key]))

    def ring(indices):
        points = []
        for index in indices:
            part = arc(index)
            points.extend(part if not points else part[1:])
        if points[-1] != points[0]:
            points.append(points[0])
        assert len(points) >= 4
        return points

    result = []
    for geometry in topology["objects"]["countries"]["geometries"]:
        if selected is not None and geometry.get("id") not in selected:
            continue
        kind = geometry["type"]
        if kind == "Polygon":
            coordinates = [ring(r) for r in geometry["arcs"]]
        elif kind == "MultiPolygon":
            coordinates = [[ring(r) for r in polygon] for polygon in geometry["arcs"]]
        else:
            raise ValueError(kind)
        result.append({"type": "Feature", "id": geometry.get("id"),
                       "properties": geometry.get("properties", {}),
                       "geometry": {"type": kind, "coordinates": coordinates}})
    return result


def point_count(value):
    if isinstance(value, list):
        if len(value) >= 2 and isinstance(value[0], (int, float)):
            return 1
        return sum(point_count(item) for item in value)
    return 0


def main():
    base = json.loads((OUT / "provenance.json").read_text())
    payload = urllib.request.urlopen(base["archiveUrl"], timeout=60).read()
    assert hashlib.sha256(payload).hexdigest() == base["archiveSha256"], "Pinned archive changed"
    archive = tarfile.open(fileobj=io.BytesIO(payload))
    raw50 = archive.extractfile("package/countries-50m.json").read()
    raw10 = archive.extractfile("package/countries-10m.json").read()
    global_features = features(json.loads(raw50))
    regional = features(json.loads(raw10), {"158"})
    assert len(regional) == 1 and regional[0]["properties"]["name"] == "Taiwan"
    assert sum(feature["id"] == "158" for feature in global_features) == 1
    combined = [regional[0] if feature["id"] == "158" else feature for feature in global_features]
    data = {"type": "FeatureCollection", "features": combined}
    output = (json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n").encode()
    (OUT / "reveal-countries.geojson").write_bytes(output)
    provenance = {
        "created": datetime.now(ZoneInfo("Asia/Taipei")).date().isoformat(),
        "dataset": "Natural Earth 4.1.0 / Admin 0 / 1:50m countries with 1:10m Taiwan",
        "distribution": "world-atlas 2.0.2",
        "source50m": "https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/",
        "source10m": "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/",
        "archiveUrl": base["archiveUrl"], "archiveSha256": base["archiveSha256"],
        "source50mSha256": hashlib.sha256(raw50).hexdigest(),
        "source10mSha256": hashlib.sha256(raw10).hexdigest(),
        "outputSha256": hashlib.sha256(output).hexdigest(), "outputBytes": len(output),
        "featureCount": len(combined),
        "pointCount": sum(point_count(f["geometry"]["coordinates"]) for f in combined),
        "detailFeature": {"id": "158", "name": "Taiwan", "scale": "1:10m", "pointCount": point_count(regional[0]["geometry"]["coordinates"])},
        "conversion": "Decode quantized TopoJSON delta arcs, reverse complemented indices, join rings, round to six decimals. Replace the 50m Taiwan feature with the 10m feature; never overlay duplicate coastlines.",
        "dataLicense": "Public domain", "dataLicenseSource": base["dataLicenseSource"],
        "distributionLicense": "ISC", "distributionLicenseText": base["distributionLicenseText"],
        "attribution": base["attribution"],
        "limitations": ["Historical generalized regional geometry, not street, building, terrain or current-boundary data.",
                        "World features use 1:50m source detail; only Taiwan uses 1:10m. Source boundary representation is preserved.",
                        "City points and illustrative connections retain their separate provenance in provenance.json."],
    }
    (OUT / "reveal-provenance.json").write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({key: provenance[key] for key in ["featureCount", "pointCount", "detailFeature", "outputBytes", "outputSha256"]}))


if __name__ == "__main__":
    main()
