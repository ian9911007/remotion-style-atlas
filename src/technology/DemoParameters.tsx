/** Created: 2026-10-25. Parameter editor for the active original scene. */
import { useEffect, useState } from "react";
import collection from "./original-demo-catalog.generated.json";
import { sourceUrl } from "./AssetLibrary";
export function DemoParameters({ id }: { id: string }) {
  const entry = collection.entries.find((e) => e.case_id === id);
  const [status, setStatus] = useState("");
  useEffect(() => {
    const done = (e: Event) => {
      const result = (e as CustomEvent).detail;
      setStatus(result.ok ? "Applied to the active scene." : result.error);
    };
    window.addEventListener("atlas:demo-result", done);
    return () => window.removeEventListener("atlas:demo-result", done);
  }, []);
  if (!entry) return null;
  const p = entry.editable_parameters;
  return (
    <section className="demo-parameters">
      <h3>Edit this original demo</h3>
      <p>
        Change the active scene, then scrub or replay. Invalid input keeps the
        last valid scene. Your file stays in this browser.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const patch: Record<string, unknown> = {
            title: form.get("title"),
            accent: form.get("accent"),
            duration: Number(form.get("duration")),
            width: Number(form.get("width") || 390),
            labels: String(form.get("labels"))
              .split("|")
              .map((s) => s.trim()),
          };
          const image = form.get("screenshot");
          if (image instanceof File && image.size) {
            if (image.size > 5_000_000) {
              setStatus("Screenshot must be no larger than 5 MB.");
              return;
            }
            patch.screenshot = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = reject;
              reader.readAsDataURL(image);
            });
          }
          setStatus("Applying…");
          window.dispatchEvent(
            new CustomEvent("atlas:demo-parameters", { detail: patch }),
          );
        }}
      >
        <label>
          Title{" "}
          <input name="title" defaultValue={p.title} maxLength={30} required />
        </label>
        <label>
          Three labels, separated by |{" "}
          <input name="labels" defaultValue={p.labels?.join(" | ")} required />
        </label>
        <label>
          Accent <input type="color" name="accent" defaultValue={p.accent} />
        </label>
        <label>
          Duration (seconds){" "}
          <input
            type="number"
            name="duration"
            min="3"
            max="12"
            step=".5"
            defaultValue={p.duration}
          />
        </label>
        <label hidden={entry.id !== "continuous-ui-morph"}>
          Control width{" "}
          <input
            type="number"
            name="width"
            min="320"
            max="460"
            defaultValue={p.width ?? 390}
          />
        </label>
        {entry.id === "product-surface-reveal" && (
          <label>
            Your permitted screenshot{" "}
            <input
              name="screenshot"
              type="file"
              accept="image/png,image/jpeg,image/webp"
            />
          </label>
        )}
        <button type="submit">Apply parameters</button>
        <output aria-live="polite">{status}</output>
      </form>
      <p>Parameters: {JSON.stringify(p)}</p>
      {entry.source_files.map((file) => (
        <p key={file}>
          <a href={sourceUrl(file)} target="_blank" rel="noreferrer">
            {file}
          </a>
        </p>
      ))}
      <p>
        Use sceneSVG(id, config, time) from the source. Duration retimes the
        scene; the gallery keeps its six-second preview cycle. Copy the
        module/config for a different delivery length. Scientific accuracy,
        sound and native video-engine conversion are unverified.
      </p>
    </section>
  );
}
