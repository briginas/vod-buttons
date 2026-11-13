# Spec Delta

## ADDED Requirements

### Requirement: Compact settings header
The settings page SHALL display the selected extension icon on the left of FOR TWITCH and VOD Buttons, with both texts on one line and all three elements vertically centered. The header SHALL fit without horizontal scrolling at viewport widths of 320 CSS pixels and wider. The introductory replay/skip sentence SHALL be absent. The local preview SHALL use the same header layout.

#### Scenario: Open settings
- **WHEN** the viewer opens settings or its local preview
- **THEN** the icon appears left of the two texts on a single centered row
- **AND** the introductory replay/skip sentence is absent

#### Scenario: Narrow settings
- **WHEN** the viewer opens settings at a viewport width of 320 CSS pixels
- **THEN** the complete header stays on one line without horizontal overflow
