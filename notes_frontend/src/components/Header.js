import React from "react";

// PUBLIC_INTERFACE
export default function Header({ theme, onToggleTheme }) {
  /** App header bar with title and theme toggle. */
  return (
    <header className="header">
      <div className="header__left">
        <div className="brandMark" aria-hidden="true">
          SN
        </div>
        <div>
          <div className="header__title">Simple Notes</div>
          <div className="header__subtitle">Retro feel, modern flow.</div>
        </div>
      </div>

      <div className="header__right">
        <button
          className="btn btn--ghost"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          type="button"
        >
          {theme === "light" ? "Dark mode" : "Light mode"}
        </button>
      </div>
    </header>
  );
}
