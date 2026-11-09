import { useEffect, useMemo, useRef, useState } from "react";
import {
  parseHtml,
  countChecks,
} from "../../utils/validation/generatedCodeChecks.js";
import { Button } from "#components/ui/button";

export function pickerDocument(html, checks) {
  const doc = parseHtml(html);
  for (const node of doc.querySelectorAll(
    "script, iframe, object, embed, base, meta[http-equiv]",
  ))
    node.remove();
  for (const node of doc.querySelectorAll("*")) {
    for (const attribute of [...node.attributes])
      if (/^on/i.test(attribute.name)) node.removeAttribute(attribute.name);
    const indexes = checks.flatMap((check, index) => {
      try {
        return node.matches(check.element || check.selector || ":not(*)")
          ? [index]
          : [];
      } catch {
        return [];
      }
    });
    node.setAttribute("data-capture-checks", indexes.join(","));
  }
  const script = `<script>document.addEventListener('click',function(event){event.preventDefault();event.stopImmediatePropagation();var node=event.target.closest('[data-capture-checks]');parent.postMessage({type:'CAPTURE_PICK',indexes:node?.getAttribute('data-capture-checks')||''},'*')},true);</script>`;
  return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: https:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; form-action 'none';"><style>*{cursor:crosshair!important}*:hover{outline:2px solid #4f46e5}</style>${doc.toString()}${script}`;
}

export default function CaptureValidationPanel({
  filename,
  initialCaptured,
  expected,
  onCaptureInitial,
  onLoadInitial,
  onCaptureExpected,
  onLoadExpected,
  onClearExpected,
  onTestsChange,
  draft,
  onDraftChange,
  pickerHtml = "",
}) {
  const [error, setError] = useState("");
  const [picking, setPicking] = useState(false);
  const [selected, setSelected] = useState(null);
  const frame = useRef(null);
  const tests = expected?.testCases || [];
  const generated = tests.find((test) => test.type === "generatedChanges");
  const checks = generated?.checks || [];
  const picker = useMemo(
    () => (picking ? pickerDocument(pickerHtml, checks) : ""),
    [picking, pickerHtml, checks],
  );
  useEffect(() => {
    const receive = (event) => {
      if (
        event.source !== frame.current?.contentWindow ||
        event.origin !== "null" ||
        event.data?.type !== "CAPTURE_PICK" ||
        typeof event.data.indexes !== "string"
      )
        return;
      setSelected(
        event.data.indexes
          ? event.data.indexes
              .split(",")
              .map(Number)
              .filter(
                (index) =>
                  Number.isInteger(index) &&
                  index >= 0 &&
                  index < checks.length,
              )
          : [],
      );
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [checks.length]);
  const act = (callback) => {
    try {
      callback();
      setError("");
    } catch (cause) {
      setError(cause.message);
    }
  };
  return (
    <fieldset className="flex flex-col gap-3 rounded-xl border border-border p-3 shadow">
        <legend className="px-1 font-semibold">
          Starting and expected structures
        </legend>
        <p className="text-xs text-foreground">
          {filename} · Validation checks generated code.
        </p>
      <div className="flex flex-col gap-2 text-xs">
        <p className="font-semibold">
          1. Starting structure <span className="text-success">{initialCaptured ? "✓" : ""}</span>
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="primaryOutline" size="sm" onClick={() => act(onLoadInitial)}>
            Load starting
          </Button>
          <Button variant="primaryOutline" size="sm" onClick={() => act(onCaptureInitial)}>
            {initialCaptured ? "Recapture starting" : "Capture starting"}
          </Button>
        </div>
        <p className="text-muted-foreground">
          Capture what the student receives, then edit the workspace to create
          the expected result.
        </p>
        <p className="font-semibold">
          2. Expected structure <span className="text-success">{expected ? "✓" : ""}</span>
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            size="sm"
            variant="primary"
            disabled={!initialCaptured}
            onClick={() => act(onCaptureExpected)}
          >
            {expected ? "Recapture expected" : "Capture expected"}
          </Button>
          {expected && (
            <Button
              variant="default"
              onClick={() => act(onLoadExpected)}
            >
              Load expected
            </Button>
          )}
          {expected && onClearExpected && (
            <Button
            size="sm"
            variant="dangerOutline"
              onClick={() => act(onClearExpected)}
            >
              Clear expected
            </Button>
          )}
        </div>
      </div>
      {/\.js$/i.test(filename) && (
        <p className="text-amber-800 dark:text-amber-300">
          JavaScript automatic checks will be added later. You can still capture
          this file.
        </p>
      )}
      {expected && (
        <div className="text-xs">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold">
              {countChecks(tests)} active checks
            </h4>
            {pickerHtml && checks.length > 0 && (
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  setPicking(!picking);
                  setSelected(null);
                }}
              >
                {picking ? "Close picker" : "Pick an element"}
              </Button>
            )}
          </div>
          <p className="text-muted-foreground">
            Checks cover changes from the starting code. Recapturing regenerates
            these checks and keeps manual tests.
          </p>
          {picking && (
            <div className="flex flex-col gap-2">
              <p>
                Click an element to find its checks. Use the checkboxes to
                choose what matters.
              </p>
              <iframe
                ref={frame}
                title="Pick expected element"
                sandbox="allow-scripts"
                srcDoc={picker}
                className="h-48 w-full rounded border bg-card"
              />
              {selected !== null && (
                <button
                  type="button"
                  className="text-left underline"
                  onClick={() => setSelected(null)}
                >
                  Show all checks
                </button>
              )}
            </div>
          )}
          <div className="flex max-h-56 flex-col gap-2 overflow-y-auto">
            {checks.map((check, index) =>
              selected && !selected.includes(index) ? null : (
                <label
                  key={index}
                  className="flex items-start gap-2 rounded bg-card p-2"
                >
                  <input
                    type="checkbox"
                    disabled={draft != null}
                    checked={check.enabled !== false}
                    onChange={(event) =>
                      act(() =>
                        onTestsChange(
                          tests.map((test) =>
                            test === generated
                              ? {
                                  ...test,
                                  checks: checks.map((item, i) =>
                                    i === index
                                      ? {
                                          ...item,
                                          enabled: event.target.checked,
                                        }
                                      : item,
                                  ),
                                }
                              : test,
                          ),
                        ),
                      )
                    }
                  />
                  <span className="min-w-0 break-words">
                    {check.message || `${check.type}: ${check.selector || ""}`}
                  </span>
                </label>
              ),
            )}
            {!checks.length && (
              <p className="text-muted-foreground">
                No automatic changes detected. Edit the expected structure or
                add manual checks.
              </p>
            )}
            {selected?.length === 0 && (
              <p className="text-muted-foreground">
                This element has no generated checks. Show all checks to review
                the rest.
              </p>
            )}
          </div>
          {draft != null && (
            <p className="text-amber-800 dark:text-amber-300">
              Apply your manual edits before changing selections or recapturing.
            </p>
          )}
          <details className="rounded border bg-card p-2">
            <summary className="cursor-pointer font-semibold">
              Advanced settings · manual tests
            </summary>
            <div className="mt-2 flex flex-col gap-2">
              <p>
                Edit tests as JSON. Tests outside generatedChanges are retained
                when you recapture.
              </p>
              <textarea
                aria-label="Manual validation tests"
                rows={8}
                className="w-full rounded border p-2 font-mono"
                value={draft ?? JSON.stringify(tests, null, 2)}
                onChange={(event) => onDraftChange(event.target.value)}
              />
              <button
                type="button"
                className="self-start rounded border px-2 py-1"
                onClick={() =>
                  act(() =>
                    onTestsChange(JSON.parse(draft ?? JSON.stringify(tests))),
                  )
                }
              >
                Apply manual tests
              </button>
            </div>
          </details>
        </div>
      )}
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}
