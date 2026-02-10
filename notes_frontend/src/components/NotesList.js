import React from "react";

function excerpt(text, maxLen = 110) {
  const trimmed = (text || "").trim().replace(/\s+/g, " ");
  if (!trimmed) return "No content yet…";
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen)}…`;
}

// PUBLIC_INTERFACE
export default function NotesList({
  notes,
  selectedId,
  onSelect,
  isLoading,
  onRetry,
  isNarrow
}) {
  /** Left panel: shows a list of notes with title and excerpt. */
  return (
    <section className={`panel panel--list ${isNarrow ? "panel--narrow" : ""}`}>
      <div className="panel__header">
        <h2 className="panel__title">Notes</h2>
        <div className="panel__meta">{notes.length} total</div>
      </div>

      <div className="panel__body">
        {isLoading ? (
          <div className="emptyState">
            <div className="spinner" aria-hidden="true" />
            <div className="emptyState__title">Loading notes…</div>
            <div className="emptyState__hint">Warming up the tape drive.</div>
          </div>
        ) : notes.length === 0 ? (
          <div className="emptyState">
            <div className="emptyState__title">No notes yet</div>
            <div className="emptyState__hint">Hit the + button to create your first note.</div>
          </div>
        ) : (
          <ul className="notesList" role="list">
            {notes.map((n) => {
              const isSelected = String(n.id) === String(selectedId);
              return (
                <li key={n.id} className="notesList__item">
                  <button
                    type="button"
                    className={`noteRow ${isSelected ? "noteRow--selected" : ""}`}
                    onClick={() => onSelect(n.id)}
                    aria-current={isSelected ? "true" : undefined}
                  >
                    <div className="noteRow__title">
                      {(n.title || "").trim() || "Untitled"}
                    </div>
                    <div className="noteRow__excerpt">{excerpt(n.content)}</div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {!isLoading && onRetry ? (
          <div className="panel__footer">
            <button className="btn btn--ghost" type="button" onClick={onRetry}>
              Refresh
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
