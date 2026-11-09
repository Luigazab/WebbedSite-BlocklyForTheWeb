import { Button } from "#components/ui/button";

export default function RubricEditor({
  rubric,
  setRubric,
  passing,
  setPassing,
}) {
  return (
    <fieldset className="rounded-xl border bg-card p-3">
      <legend className="px-1 font-semibold">Laboratory grading rubric</legend>
      <p className="text-xs text-foreground">
        Points must total 100. Unpublish before editing; submitted work keeps
        its original rubric.
      </p>
      {rubric.map((c, i) => (
        <div key={c.id} className="flex gap-2 space-y-3">
          <label className="flex-1 text-xs">
            Criterion <span className="text-destructive">*</span>
            <input
              required
              value={c.label}
              maxLength={160}
              onChange={(e) =>
                setRubric(
                  rubric.map((x, j) =>
                    j === i ? { ...x, label: e.target.value } : x,
                  ),
                )
              }
              className="mt-1 w-full rounded border p-2"
            />
          </label>
          <label className="w-20 text-xs">
            Points <span className="text-destructive">*</span>
            <input
              type="number"
              required
              min="1"
              max="100"
              value={c.max}
              onChange={(e) =>
                setRubric(
                  rubric.map((x, j) =>
                    j === i ? { ...x, max: Number(e.target.value) } : x,
                  ),
                )
              }
              className="mt-1 w-full rounded border p-2"
            />
          </label>
          <button
            type="button"
            disabled={rubric.length === 1}
            onClick={() => setRubric(rubric.filter((_, j) => i !== j))}
            aria-label={`Remove ${c.label}`}
          >
            <span className="text-destructive">×</span>
          </button>
        </div>
      ))}
      <Button variant="successOutline" size="xs" 
        disabled={rubric.length >= 12}
        onClick={() =>
          setRubric([
            ...rubric,
            { id: crypto.randomUUID(), label: "New criterion", max: 1 },
          ])
        }>
        Add criterion
      </Button>
      <p className="text-sm font-semibold">
        Total: {rubric.reduce((n, c) => n + Number(c.max), 0)} / 100
      </p>
      <div className="flex justify-between items-center">
        <label className="text-sm">
          Passing score (%)<span className="text-destructive">*</span>
        </label>
        <input
          required
          type="number"
          min="1"
          max="100"
          value={passing}
          onChange={(e) => setPassing(Number(e.target.value))}
          className="ml-2 w-20 rounded border p-2"
        />
      </div>
    </fieldset>
  );
}
