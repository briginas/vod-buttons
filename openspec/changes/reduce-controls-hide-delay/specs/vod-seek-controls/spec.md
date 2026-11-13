# Spec Delta

## MODIFIED Requirements

### Requirement: Pointer visibility and visual style
Controls SHALL appear when the pointer enters or moves over the video or extension buttons. They SHALL hide after 1.5 seconds without pointer activity or when the pointer leaves the player, unless a control has keyboard focus. Pointer presses and scrolling within the player SHALL restart the inactivity timer. Focus caused by a mouse click alone SHALL NOT prevent hiding. Buttons SHALL have dark translucent backgrounds, light English labels, moderate corner rounding and a purple hover accent.

#### Scenario: Move between video and buttons
- **WHEN** the pointer enters the video and then moves onto a seek button
- **THEN** the controls appear and the 1.5-second inactivity timer restarts

#### Scenario: Stop and resume pointer activity
- **WHEN** the pointer remains stationary in the player for 1.5 seconds without presses or scrolling and no control has keyboard focus
- **THEN** the columns hide even if a button retains focus from a mouse click
- **AND** moving the pointer within the player shows the columns again and restarts the timer

#### Scenario: Keep keyboard controls visible
- **WHEN** a control has keyboard focus and the pointer inactivity timer expires
- **THEN** the columns remain visible until keyboard focus leaves or pointer interaction resumes

#### Scenario: Leave the player
- **WHEN** the pointer leaves the player and no extension button has keyboard focus
- **THEN** the columns become hidden
