# appearance Specification

## Purpose

Let viewers select a consistent warm light or plum dark appearance for extension settings and Twitch VOD controls, with preferences retained on their device.

## Requirements

### Requirement: Two selectable appearances
The settings page SHALL offer exactly Light and Dark themes using the palettes and rounded surface style of watch-youtube-with-friends. Light SHALL be the default for absent or invalid preferences. The selector SHALL support keyboard use and expose its selected value to assistive technology.

#### Scenario: First use and keyboard selection
- **WHEN** the viewer opens settings without a valid saved theme
- **THEN** Light is selected and the viewer can select Dark using the keyboard

### Requirement: Shared local appearance
The extension SHALL save the theme locally, retain it across sessions, and apply saved changes to open settings and supported VOD controls without reloading. Theme changes SHALL NOT alter seek intervals; resetting intervals SHALL NOT change the theme. Extension themes SHALL NOT restyle Twitch itself.

#### Scenario: Change theme with a VOD open
- **WHEN** the viewer selects Dark and it saves successfully
- **THEN** open extension surfaces use the plum dark palette and the selection persists when reopened
- **AND** playback, focus and configured intervals remain intact

#### Scenario: Reset intervals
- **WHEN** the viewer resets intervals with Dark selected
- **THEN** interval defaults are restored and Dark stays selected

### Requirement: Recoverable theme storage failures
Theme loading failures SHALL show a retry action without overwriting saved preferences. Theme saving failures SHALL show an English error and a retry action. Rapid selections SHALL be saved in order so the latest successful selection remains the stored theme.

#### Scenario: Retry saving
- **WHEN** saving a selection fails and the viewer retries after storage recovers
- **THEN** the latest selected theme is saved and the error clears

#### Scenario: Overlapping initial load and external change
- **WHEN** a newer saved theme arrives while an initial read is pending
- **THEN** the stale read does not replace the newer theme
