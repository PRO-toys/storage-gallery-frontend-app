// src/components/sidebar/SidebarToggleBottom.tsx
import React from "react";

export type ThemeMode = "light" | "dark" | "system";

// Props for the slide-up sidebar used to control the Live Feed screen.
// It manages behavior toggles, visibility toggles, and theme mode.
export type SidebarToggleBottomProps = {
  /** open/close state of the bottom sheet */
  isOpen?: boolean;
  onToggleOpen?: () => void;

  /** behavior controls */
  autoplay: boolean;
  onAutoplayChange: (v: boolean) => void;

  live: boolean;
  onLiveChange: (v: boolean) => void;

  showEvent: boolean; // visibility for the Event: label/value on the header
  onShowEventChange: (v: boolean) => void;

  showQR: boolean; // visibility for the QR overlay
  onShowQRChange: (v: boolean) => void;

  onRefresh: () => void;

  /** visibility controls for page UI */
  showTitle: boolean; // "Live Feed (9:16)"
  onShowTitleChange: (v: boolean) => void;

  showLiveButton: boolean; // the Live ON/OFF button in header
  onShowLiveButtonChange: (v: boolean) => void;

  showAutoplayButton: boolean; // the Pause/Play button in header
  onShowAutoplayButtonChange: (v: boolean) => void;

  showRefreshButton: boolean; // the Refresh button in header
  onShowRefreshButtonChange: (v: boolean) => void;

  /** theme */
  theme: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
};

const Switch: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}> = ({ checked, onChange, label }) => (
  <label className="flex items-center justify-between gap-3 py-2 select-none">
    <span className="text-sm text-white/90">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? "bg-blue-600" : "bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  </label>
);

const Divider: React.FC<{ label?: string }> = ({ label }) => (
  <div className="flex items-center gap-3 pt-1">
    <div className="h-px flex-1 bg-white/10" />
    {label ? (
      <span className="text-[11px] uppercase tracking-wider text-white/60">
        {label}
      </span>
    ) : null}
    <div className="h-px flex-1 bg-white/10" />
  </div>
);

const ThemePill: React.FC<{
  active: boolean;
  label: string;
  onClick: () => void;
}> = ({ active, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-sm transition
      ${active ? "bg-blue-600 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
    aria-pressed={active}
  >
    {label}
  </button>
);

const SidebarToggleBottom: React.FC<SidebarToggleBottomProps> = ({
  isOpen = true,
  onToggleOpen,

  // behavior
  autoplay,
  onAutoplayChange,
  live,
  onLiveChange,
  showEvent,
  onShowEventChange,
  showQR,
  onShowQRChange,
  onRefresh,

  // visibility
  showTitle,
  onShowTitleChange,
  showLiveButton,
  onShowLiveButtonChange,
  showAutoplayButton,
  onShowAutoplayButtonChange,
  showRefreshButton,
  onShowRefreshButtonChange,

  // theme
  theme,
  onThemeChange,
}) => {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ${
        isOpen ? "translate-y-0" : "translate-y-[calc(100%-2.5rem)]"
      }`}
    >
      {/* grab handle */}
      <button
        onClick={onToggleOpen}
        className="mx-auto mb-2 block h-2 w-10 rounded-full bg-white/50"
        aria-label="Toggle controls"
      />

      <div className="mx-auto max-w-md rounded-t-2xl bg-black/70 backdrop-blur-md ring-1 ring-white/10 p-4 shadow-2xl">
        <div className="grid grid-cols-1 gap-2">
          {/* THEME */}
          <Divider label="Theme" />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-white/90">Appearance</span>
            <div className="flex items-center gap-2">
              <ThemePill
                label="Light"
                active={theme === "light"}
                onClick={() => onThemeChange("light")}
              />
              <ThemePill
                label="Dark"
                active={theme === "dark"}
                onClick={() => onThemeChange("dark")}
              />
              <ThemePill
                label="System"
                active={theme === "system"}
                onClick={() => onThemeChange("system")}
              />
            </div>
          </div>

          {/* BEHAVIOR */}
          <Divider label="Behavior" />
          <Switch
            checked={autoplay}
            onChange={onAutoplayChange}
            label={autoplay ? "Autoplay: ON" : "Autoplay: OFF"}
          />
          <Switch
            checked={live}
            onChange={onLiveChange}
            label={live ? "Live polling: ON" : "Live polling: OFF"}
          />
          <Switch
            checked={showEvent}
            onChange={onShowEventChange}
            label={showEvent ? "Show Event: YES" : "Show Event: NO"}
          />
          <Switch
            checked={showQR}
            onChange={onShowQRChange}
            label={showQR ? "Show QR: YES" : "Show QR: NO"}
          />

          {/* VISIBILITY */}
          <Divider label="Visibility" />
          <Switch
            checked={showTitle}
            onChange={onShowTitleChange}
            label={showTitle ? 'Title "Live Feed (9:16)": SHOW' : "Title: HIDE"}
          />
          <Switch
            checked={showLiveButton}
            onChange={onShowLiveButtonChange}
            label={showLiveButton ? "Live Button: SHOW" : "Live Button: HIDE"}
          />
          <Switch
            checked={showAutoplayButton}
            onChange={onShowAutoplayButtonChange}
            label={
              showAutoplayButton
                ? "Pause/Play Button: SHOW"
                : "Pause/Play Button: HIDE"
            }
          />
          <Switch
            checked={showRefreshButton}
            onChange={onShowRefreshButtonChange}
            label={
              showRefreshButton ? "Refresh Button: SHOW" : "Refresh Button: HIDE"
            }
          />

          {/* ACTIONS */}
          <Divider />
          <div className="pt-1">
            <button
              onClick={onRefresh}
              className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
            >
              Refresh now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarToggleBottom;
