# vod-seek-controls Specification

## Purpose

Let Twitch VOD viewers revisit or skip moments using a mouse through configurable seek buttons, while preserving the native player's behavior.

## Requirements

### Requirement: Supported viewing contexts
The extension SHALL show seek controls only for supported VOD playback on twitch.tv, including normal, theater and fullscreen modes. Live streams, clips and players embedded on other sites SHALL NOT receive these controls.

#### Scenario: View a VOD
- **WHEN** a supported VOD player becomes ready on twitch.tv
- **THEN** the extension attaches controls using the current settings

#### Scenario: View unsupported content
- **WHEN** the viewer opens a live stream, a clip or a player embedded on a third-party site
- **THEN** no extension seek controls are shown

### Requirement: Independent column layout
The extension SHALL place rewind buttons on the left and forward buttons on the right, in the configured order with equal gaps. Each nonempty column SHALL be vertically centered independently within the available player area; empty columns SHALL be absent. The native bottom control bar SHALL remain unobstructed.

#### Scenario: Unequal button counts
- **WHEN** rewind has three buttons and forward has one
- **THEN** each column is independently centered with its own configured order
- **AND** the bottom control bar remains fully usable

#### Scenario: Empty direction
- **WHEN** one or both direction lists are empty
- **THEN** the corresponding columns are absent

#### Scenario: Change viewing mode or size
- **WHEN** the viewer resizes the player or switches between normal, theater and fullscreen modes
- **THEN** the controls remain inside the active player and do not obstruct native controls

### Requirement: Overflow scrolling
When buttons do not fit vertically, the extension SHALL constrain the column to the available area and provide internal scrolling by mouse wheel, touchpad gestures and a visible scrollbar. Every configured button SHALL remain accessible without a keyboard. Scrolling a column SHALL NOT seek the video.

#### Scenario: Use all six buttons in a small player
- **WHEN** six buttons exceed the available column height
- **THEN** all six remain reachable through internal scrolling without covering the native control bar

#### Scenario: Scroll using different input devices
- **WHEN** the viewer scrolls an overflowing column with a mouse wheel, a touchpad gesture or its scrollbar
- **THEN** the column scroll position changes and the video playback position does not change because of that input

### Requirement: Pointer visibility and visual style
Controls SHALL appear when the pointer enters or moves over the video or extension buttons. They SHALL hide after 3 seconds without pointer activity or when the pointer leaves the player, unless a control has keyboard focus. Pointer presses and scrolling within the player SHALL restart the inactivity timer. Focus caused by a mouse click alone SHALL NOT prevent hiding. Buttons SHALL have dark translucent backgrounds, light English labels, moderate corner rounding and a purple hover accent.

#### Scenario: Move between video and buttons
- **WHEN** the pointer enters the video and then moves onto a seek button
- **THEN** the controls appear and the 3-second inactivity timer restarts

#### Scenario: Stop and resume pointer activity
- **WHEN** the pointer remains stationary in the player for 3 seconds without presses or scrolling and no control has keyboard focus
- **THEN** the columns hide even if a button retains focus from a mouse click
- **AND** moving the pointer within the player shows the columns again and restarts the timer

#### Scenario: Keep keyboard controls visible
- **WHEN** a control has keyboard focus and the pointer inactivity timer expires
- **THEN** the columns remain visible until keyboard focus leaves or pointer interaction resumes

#### Scenario: Leave the player
- **WHEN** the pointer leaves the player and no extension button has keyboard focus
- **THEN** the columns become hidden

### Requirement: Seek by the configured interval
Activating a button SHALL immediately seek in its column's direction by its positive configured interval, bounded by the VOD's beginning and end. A seek SHALL preserve playing or paused state without triggering the native video click action, except for natural completion at the end.

#### Scenario: Seek during playback or pause
- **WHEN** a viewer activates a rewind or forward button during playback or pause
- **THEN** the position changes by the configured number of seconds in the correct direction
- **AND** the prior playing or paused state is preserved away from the end

#### Scenario: Reach a recording boundary
- **WHEN** the requested offset would go before the beginning or beyond the end
- **THEN** the position is limited to that boundary, including natural completion at the end

#### Scenario: Video is not seekable
- **WHEN** a supported VOD is not ready for a valid seek
- **THEN** the extension does not perform an invalid seek or interfere with native playback

### Requirement: Navigation lifecycle
The extension SHALL attach at most one set of controls to the current supported player and remove obsolete elements when navigation or player replacement changes the context, including navigation without a page reload. An unrecognized context SHALL NOT receive controls.

#### Scenario: Navigate between VODs
- **WHEN** the viewer navigates from one VOD to another without reloading the tab
- **THEN** one set of controls targets the new player with the current settings

#### Scenario: Navigate away and return
- **WHEN** the viewer navigates from a VOD to a live stream, clip or unsupported page, then returns to a VOD
- **THEN** the old controls are removed and a single set reappears only for the supported VOD

### Requirement: Accessible activation
Seek buttons SHALL have English accessible names describing direction and duration, visible keyboard focus and standard keyboard activation. Focused controls SHALL remain visible and focused overflowed buttons SHALL be scrolled into view. Global interval shortcuts are not required.

#### Scenario: Navigate by keyboard
- **WHEN** a viewer focuses an extension button using standard keyboard navigation
- **THEN** its focus is visible, its direction and duration are available to assistive technology, and it can be activated
- **AND** the focused button is visible within its column even when scrolling is required
