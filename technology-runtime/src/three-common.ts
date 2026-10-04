/** Created: 2026-10-04. Shared, version-scoped Three.js renderer lifecycle. */
import * as THREE from "three";

/** Three r186's shared DFG lookup texture retains a dispose listener per renderer.
 * Capture its uniform through the public material compile hook, then release it
 * through Texture.dispose before releasing the sole live gallery renderer.
 * No shader source or private registry is changed. Recheck on a Three upgrade.
 */
export function ownThreeLookupTexture(scene: THREE.Scene) {
  const uniforms = new Set<THREE.IUniform>();
  const hooks = new Map<THREE.Material, THREE.Material["onBeforeCompile"]>();
  scene.traverse((object) => {
    const entry = (object as THREE.Mesh).material;
    for (const material of Array.isArray(entry)
      ? entry
      : entry
        ? [entry]
        : []) {
      if (hooks.has(material)) continue;
      const previous = material.onBeforeCompile;
      hooks.set(material, previous);
      material.onBeforeCompile = function (shader, renderer) {
        previous.call(this, shader, renderer);
        if (shader.uniforms.dfgLUT) uniforms.add(shader.uniforms.dfgLUT);
      };
    }
  });
  return () => {
    const textures = new Set<THREE.Texture>();
    uniforms.forEach((uniform) => {
      if (uniform.value instanceof THREE.Texture) textures.add(uniform.value);
    });
    textures.forEach((texture) => texture.dispose());
    uniforms.clear();
    hooks.forEach((previous, material) => {
      material.onBeforeCompile = previous;
    });
    hooks.clear();
  };
}

export function disposeThree(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.geometry) geometries.add(mesh.geometry);
    if (mesh.material)
      (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(
        (material) => materials.add(material),
      );
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  scene.clear();
  renderer.renderLists.dispose();
  renderer.dispose();
  renderer.forceContextLoss();
  renderer.domElement.remove();
}
