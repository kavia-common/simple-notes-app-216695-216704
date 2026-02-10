import React, { useEffect, useMemo, useState } from "react";

function validate({ title, content }) {
  const errors = {};
  if (!(title || "").trim()) errors.title = "Title is required.";
  if (!(content || "").trim()) errors.content = "Content is required.";
  return errors;
}

// PUBLIC_INTERFACE
export default function NoteEditor({
  note,
  mode,
  isSaving,
  isDeleting,
  onSave,
  onDelete,
  onCancelNew,
  isNarrow
}) {
  /**
   * Right panel: edit/create note.
   * mode: "create" | "edit" | "empty"
   */
  const initial = useMemo(() => {
    if (!note) return { title: "", content: "" };
    return { title: note.title || "", content: note.content || "" };
  }, [note]);

  const [draft, setDraft] = useState(initial);
  const [touched, setTouched] = useState({ title: false, content: false });

  useEffect(() => {
    setDraft(initial);
    setTouched({ title: false, content: false });
  }, [initial]);

  const errors = validate(draft);
  const showTitleError = touched.title && errors.title;
  const showContentError = touched.content && errors.content;

  const canSave = Object.keys(errors).length === 0 && !isSaving && mode !== "empty";

  const titleText =
    mode === "create" ? "New note" : mode === "edit" ? "Edit note" : "Select a note";

  const subtitleText =
    mode === "create"
      ? "Start typing. Save when ready."
      : mode === "edit"
        ? "Update your note and hit Save."
        : "Pick one from the list or create a new one.";

  if (mode === "empty") {
    return (
      <section className={`panel panel--editor ${isNarrow ? "panel--narrow" : ""}`}>
        <div className="panel__header">
          <h2 className="panel__title">{titleText}</h2>
          <div className="panel__meta">{subtitleText}</div>
        </div>
        <div className="panel__body">
          <div className="emptyState">
            <div className="emptyState__title">Nothing selected</div>
            <div className="emptyState__hint">Create a new note with the + button.</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`panel panel--editor ${isNarrow ? "panel--narrow" : ""}`}>
      <div className="panel__header">
        <div>
          <h2 className="panel__title">{titleText}</h2>
          <div className="panel__meta">{subtitleText}</div>
        </div>

        <div className="panel__actions">
          {mode === "create" ? (
            <button className="btn btn--ghost" type="button" onClick={onCancelNew} disabled={isSaving || isDeleting}>
              Cancel
            </button>
          ) : null}

          {mode === "edit" ? (
            <button
              className="btn btn--danger"
              type="button"
              onClick={onDelete}
              disabled={isSaving || isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          ) : null}

          <button
            className="btn btn--primary"
            type="button"
            onClick={() => onSave(draft)}
            disabled={!canSave}
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="panel__body">
        <div className="form">
          <label className="field">
            <div className="field__label">Title</div>
            <input
              className={`input ${showTitleError ? "input--error" : ""}`}
              value={draft.title}
              onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
              onBlur={() => setTouched((p) => ({ ...p, title: true }))}
              placeholder="e.g., VHS shopping list"
              maxLength={120}
              disabled={isSaving || isDeleting}
            />
            {showTitleError ? <div className="field__error">{errors.title}</div> : null}
          </label>

          <label className="field">
            <div className="field__label">Content</div>
            <textarea
              className={`textarea ${showContentError ? "input--error" : ""}`}
              value={draft.content}
              onChange={(e) => setDraft((p) => ({ ...p, content: e.target.value }))}
              onBlur={() => setTouched((p) => ({ ...p, content: true }))}
              placeholder="Write something memorable…"
              rows={12}
              disabled={isSaving || isDeleting}
            />
            {showContentError ? <div className="field__error">{errors.content}</div> : null}
          </label>

          <div className="form__hint">
            Tip: Keep it short and punchy—like a mixtape label.
          </div>
        </div>
      </div>
    </section>
  );
}
