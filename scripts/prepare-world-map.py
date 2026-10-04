#!/usr/bin/env python3
"""Created: 2026-10-04. Rebuild pinned Natural Earth data without runtime networking."""
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
ATLAS_URL = "https://registry.npmjs.org/world-atlas/-/world-atlas-2.0.2.tgz"
ATLAS_HASH = "032e7765f2ce00edaeafec23ff22bc3b77e42987c257da944cc585b452c05b97"
PLACES_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v4.1.0/geojson/ne_110m_populated_places.geojson"
PLACES_HASH = "c2fd71d965a25b0d0021c121e592c1848be7e35e883901685329373ef06d4c51"


def download(url, expected):
    data = urllib.request.urlopen(url, timeout=60).read()
    actual = hashlib.sha256(data).hexdigest()
    if actual != expected:
        raise ValueError(f"Pinned source changed: {url}: {actual}")
    return data


def decode(topology):
    transform = topology["transform"]
    decoded = []
    for arc in topology["arcs"]:
        x = y = 0
        points = []
        for dx, dy in arc:
            x += dx
            y += dy
            points.append([round(x * transform["scale"][0] + transform["translate"][0], 6),
                           round(y * transform["scale"][1] + transform["translate"][1], 6)])
        decoded.append(points)

    def ring(indices):
        points = []
        for index in indices:
            arc = decoded[index] if index >= 0 else list(reversed(decoded[~index]))
            points.extend(arc if not points else arc[1:])
        if points[-1] != points[0]:
            points.append(points[0])
        if len(points) < 4:
            raise ValueError("Invalid decoded ring")
        return points

    features = []
    for geometry in topology["objects"]["countries"]["geometries"]:
        kind = geometry["type"]
        if kind == "Polygon":
            coordinates = [ring(r) for r in geometry["arcs"]]
        elif kind == "MultiPolygon":
            coordinates = [[ring(r) for r in p] for p in geometry["arcs"]]
        else:
            raise ValueError(f"Unexpected geometry: {kind}")
        features.append({"type": "Feature", "id": geometry.get("id"),
                         "properties": geometry.get("properties", {}),
                         "geometry": {"type": kind, "coordinates": coordinates}})
    assert len(features) == 177
    return {"type": "FeatureCollection", "features": features}


def main():
    archive = tarfile.open(fileobj=io.BytesIO(download(ATLAS_URL, ATLAS_HASH)))
    topology_bytes = archive.extractfile("package/countries-110m.json").read()
    license_text = archive.extractfile("package/LICENSE").read().decode()
    countries = decode(json.loads(topology_bytes))
    places = json.loads(download(PLACES_URL, PLACES_HASH))
    names = {"Taipei": "臺北", "Tokyo": "東京", "Singapore": "新加坡", "Sydney": "雪梨", "London": "倫敦"}
    cities = []
    for name, label in names.items():
        matches = [f for f in places["features"] if f["properties"].get("NAME") == name]
        assert len(matches) == 1, name
        cities.append({"id": name.lower(), "name": name, "label": label,
                       "coordinates": matches[0]["geometry"]["coordinates"]})
    OUT.mkdir(parents=True, exist_ok=True)
    payload = (json.dumps(countries, ensure_ascii=False, separators=(",", ":")) + "\n").encode()
    (OUT / "world-countries.geojson").write_bytes(payload)
    provenance = {
        "created": datetime.now(ZoneInfo("Asia/Taipei")).date().isoformat(),
        "dataset": "Natural Earth 4.1.0 / Admin 0 countries / 1:110m",
        "distribution": "world-atlas 2.0.2",
        "source": "https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/",
        "dataLicense": "Public domain",
        "dataLicenseSource": "https://www.naturalearthdata.com/about/terms-of-use/",
        "distributionLicense": "ISC", "distributionLicenseText": license_text,
        "archiveUrl": ATLAS_URL, "archiveSha256": ATLAS_HASH,
        "topologySha256": hashlib.sha256(topology_bytes).hexdigest(),
        "geojsonSha256": hashlib.sha256(payload).hexdigest(),
        "featureCount": len(countries["features"]),
        "coordinateSystem": "Longitude, latitude in decimal degrees (geographic coordinates)",
        "conversion": "Decode TopoJSON quantized delta arcs, reverse complemented indices, join rings, round to six decimals.",
        "citiesSource": PLACES_URL, "citiesSourceSha256": PLACES_HASH, "cities": cities,
        "routes": "Original illustrative connections from Taipei; not flight schedules, traffic, navigation or actual services.",
        "limitations": ["Historical small-scale generalized data; not current boundary authority or navigation geometry.",
                        "Preserves source boundary representation; disputes and small islands require purpose-specific data review.",
                        "City points represent dataset label locations, not airports or official municipal centroids."],
        "attribution": "Made with Natural Earth. world-atlas redistribution by Mike Bostock (ISC).",
    }
    (OUT / "provenance.json").write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + "\n")
    print(f"Prepared {len(countries['features'])} country features, {len(cities)} verified source city points; SHA-256 {provenance['geojsonSha256']}")


if __name__ == "__main__":
    main()
