import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import Header from "./components/Header";
import NotesList from "./components/NotesList";
import NoteEditor from "./components/NoteEditor";
import FAB from "./components/FAB";
import { ToastCenter, useToasts } from "./components/ToastCenter";

import { createNote, deleteNote, listNotes, updateNote } from "./api/notesApi";

function sortNotesNewestFirst(notes) {
  // Prefer backend-provided timestamps if present; otherwise keep stable by id desc.
  return [...notes].sort((a, b) => {
    const ad = a.updated_at || a.updatedAt || a.created_at || a.createdAt;
    const bd = b.updated_at || b.updatedAt || b.created_at || b.createdAt;
    if (ad && bd) return String(bd).localeCompare(String(ad));
    // if ids are numeric-ish
    const ai = Number(a.id);
    const bi = Number(b.id);
    if (!Number.isNaN(ai) && !Number.isNaN(bi)) return bi - ai;
    return String(b.id).localeCompare(String(a.id));
  });
}

function normalizeNote(n) {
  // Keep minimal assumptions: id, title, content.
  return {
    id: n.id,
    title: n.title ?? "",
    content: n.content ?? "",
    created_at: n.created_at,
    updated_at: n.updated_at
  };
}

// PUBLIC_INTERFACE
function App() {
  /** Simple Notes App: list notes, create/edit, delete, responsive with retro/modern theme. */
  const [theme, setTheme] = useState("light");

  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editorMode, setEditorMode] = useState("empty"); // "empty" | "create" | "edit"
  const abortRef = useRef(null);

  const { toasts, addToast, dismissToast } = useToasts();

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const isNarrow = useMemo(() => {
    // simple heuristic; CSS handles most responsiveness
    return false;
  }, []);

  const selectedNote = useMemo(() => {
    if (!selectedId) return null;
    const found = notes.find((n) => String(n.id) === String(selectedId));
    return found || null;
  }, [notes, selectedId]);

  const refreshNotes = async ({ keepSelection = true } = {}) => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setIsLoading(true);
    try {
      const data = await listNotes({ signal: ctrl.signal });
      const normalized = Array.isArray(data) ? data.map(normalizeNote) : [];
      const sorted = sortNotesNewestFirst(normalized);

      setNotes(sorted);

      if (!keepSelection) {
        setSelectedId(null);
        setEditorMode("empty");
      } else if (selectedId) {
        const stillExists = sorted.some((n) => String(n.id) === String(selectedId));
        if (!stillExists) {
          setSelectedId(null);
          setEditorMode("empty");
        }
      }
    } catch (e) {
      addToast("error", `Could not load notes: ${e.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshNotes();
    // cleanup abort on unmount
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    /** Toggles light/dark theme. */
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    setEditorMode("edit");
  };

  const handleNew = () => {
    setSelectedId(null);
    setEditorMode("create");
  };

  const handleCancelNew = () => {
    // If there are notes, select the first; else empty.
    if (notes.length > 0) {
      setSelectedId(notes[0].id);
      setEditorMode("edit");
    } else {
      setSelectedId(null);
      setEditorMode("empty");
    }
  };

  const handleSave = async ({ title, content }) => {
    // validation is also performed in NoteEditor; keep a defensive check here
    const t = (title || "").trim();
    const c = (content || "").trim();
    if (!t || !c) {
      addToast("error", "Please provide both a title and content.");
      return;
    }

    setIsSaving(true);

    try {
      if (editorMode === "create") {
        // Optimistic: add a temp note row immediately, then replace on success.
        const tempId = `temp_${Date.now()}`;
        const optimistic = { id: tempId, title: t, content: c };
        setNotes((prev) => sortNotesNewestFirst([optimistic, ...prev]));
        setSelectedId(tempId);
        setEditorMode("edit");

        const created = await createNote({ title: t, content: c });
        const createdNorm = normalizeNote(created);

        setNotes((prev) => {
          const filtered = prev.filter((n) => String(n.id) !== String(tempId));
          return sortNotesNewestFirst([createdNorm, ...filtered]);
        });
        setSelectedId(createdNorm.id);
        addToast("success", "Note created.");
      } else if (editorMode === "edit" && selectedId) {
        // Optimistic update existing note
        const before = notes;
        setNotes((prev) =>
          sortNotesNewestFirst(
            prev.map((n) => (String(n.id) === String(selectedId) ? { ...n, title: t, content: c } : n))
          )
        );

        try {
          const updated = await updateNote(selectedId, { title: t, content: c });
          const updatedNorm = normalizeNote(updated);

          setNotes((prev) =>
            sortNotesNewestFirst(
              prev.map((n) => (String(n.id) === String(selectedId) ? { ...n, ...updatedNorm } : n))
            )
          );
          addToast("success", "Saved.");
        } catch (e) {
          // rollback
          setNotes(before);
          throw e;
        }
      }
    } catch (e) {
      addToast("error", `Save failed: ${e.message || "Unknown error"}`);
      // If create failed and we were on temp note, go back to create mode.
      if (String(selectedId || "").startsWith("temp_")) {
        setNotes((prev) => prev.filter((n) => !String(n.id).startsWith("temp_")));
        setSelectedId(null);
        setEditorMode("create");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    // Do not attempt delete for optimistic temp notes
    if (String(selectedId).startsWith("temp_")) {
      setNotes((prev) => prev.filter((n) => String(n.id) !== String(selectedId)));
      setSelectedId(null);
      setEditorMode(notes.length > 1 ? "edit" : "empty");
      addToast("info", "Draft removed.");
      return;
    }

    setIsDeleting(true);
    const idToDelete = selectedId;

    // Optimistic remove
    const before = notes;
    const remaining = notes.filter((n) => String(n.id) !== String(idToDelete));
    setNotes(remaining);
    setSelectedId(remaining[0]?.id ?? null);
    setEditorMode(remaining[0] ? "edit" : "empty");

    try {
      await deleteNote(idToDelete);
      addToast("success", "Note deleted.");
    } catch (e) {
      // rollback
      setNotes(before);
      setSelectedId(idToDelete);
      setEditorMode("edit");
      addToast("error", `Delete failed: ${e.message || "Unknown error"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="AppShell">
      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main className="main">
        <div className="grid">
          <NotesList
            notes={notes}
            selectedId={selectedId}
            onSelect={handleSelect}
            isLoading={isLoading}
            onRetry={() => refreshNotes({ keepSelection: true })}
            isNarrow={isNarrow}
          />

          <NoteEditor
            note={editorMode === "edit" ? selectedNote : null}
            mode={editorMode === "edit" ? (selectedNote ? "edit" : "empty") : editorMode}
            isSaving={isSaving}
            isDeleting={isDeleting}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancelNew={handleCancelNew}
            isNarrow={isNarrow}
          />
        </div>
      </main>

      <FAB onClick={handleNew} label="Create new note" />

      <ToastCenter toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
