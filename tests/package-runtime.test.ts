/** Created: 2026-10-26. Verify real peer resolution after package-manager migration. */
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
test("Remotion CLI, renderer and composition share the project's React instance", () => {
  const react = require("react");
  const manifest = require("../package.json");
  const expectedVersion = manifest.dependencies.remotion;
  assert.match(expectedVersion, /^4\.\d+\.\d+$/, "Remotion must remain exactly pinned");
  for (const name of ["@remotion/bundler", "@remotion/renderer", "@remotion/cli"]) {
    assert.equal(manifest.devDependencies[name], expectedVersion, name + " declaration must align");
    assert.equal(require(name + "/package.json").version, expectedVersion, name + " installation must align");
  }
  for (const name of ["remotion", "@remotion/renderer", "@remotion/cli"]) {
    const peer = createRequire(require.resolve(name));
    assert.equal(peer("react"), react, `${name} must resolve the same React object`);
    assert.equal(require(`${name}/package.json`).version, expectedVersion);
  }
});


test("technology player preserves aligned Remotion and its isolated React peer", () => {
  const app = require("../package.json");
  const technology = createRequire(new URL("../technology-runtime/package.json", import.meta.url));
  const manifest = require("../technology-runtime/package.json");
  const expectedVersion = app.dependencies.remotion;
  const react = technology("react");
  for (const name of ["remotion", "@remotion/player"]) {
    assert.equal(manifest.dependencies[name], expectedVersion, name + " technology declaration must align");
    assert.equal(technology(name + "/package.json").version, expectedVersion);
    assert.equal(createRequire(technology.resolve(name))("react"), react, name + " must use its graph's React");
  }
});
