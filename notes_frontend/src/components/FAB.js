import React from "react";

// PUBLIC_INTERFACE
export default function FAB({ onClick, label = "New note" }) {
  /** Floating Action Button for creating a new note. */
  return (
    <button className="fab" type="button" onClick={onClick} aria-label={label} title={label}>
      <span className="fab__plus" aria-hidden="true">
        +
      </span>
    </button>
  );
}
