/** Created: 2026-10-05. Verify real peer resolution after package-manager migration. */
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
test("Remotion CLI, renderer and composition share the project's React instance", () => {
  const react = require("react");
  for (const name of ["remotion", "@remotion/renderer", "@remotion/cli"]) {
    const peer = createRequire(require.resolve(name));
    assert.equal(peer("react"), react, `${name} must resolve the same React object`);
    assert.equal(require(`${name}/package.json`).version, "4.0.530");
  }
});
