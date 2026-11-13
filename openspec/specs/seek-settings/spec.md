# seek-settings Specification

## Purpose

Let viewers personalize independent rewind and forward button lists, with settings persisted locally and applied to open Twitch VOD players without reloading the page.

## Requirements

### Requirement: Independent bounded lists
The extension SHALL provide an English settings page with independent Rewind and Forward lists, each containing zero to six buttons. Adding, deleting and reordering buttons SHALL be possible using a mouse; interval number entry can use a keyboard. List order SHALL determine top-to-bottom button order in the player.

#### Scenario: Edit one direction
- **WHEN** the viewer adds, deletes, reorders or edits a button in one list
- **THEN** only that direction changes and its player column reflects the configured order

#### Scenario: Reach the count limit
- **WHEN** a list already contains six buttons
- **THEN** the viewer cannot add a seventh button to that list

#### Scenario: Remove all buttons
- **WHEN** the viewer removes every button from one or both lists
- **THEN** the empty lists are saved and their corresponding columns are absent

### Requirement: Positive integer intervals
Each interval SHALL accept a positive whole number and a unit of seconds or minutes; the column SHALL define its direction. Zero, negative, fractional, empty or nonnumeric input SHALL NOT replace a saved valid interval. Invalid input SHALL display an understandable English field error.

#### Scenario: Enter seconds or minutes
- **WHEN** the viewer enters 90 seconds or 2 minutes as a valid interval
- **THEN** the resulting button seeks by 90 or 120 seconds respectively in its column's direction

#### Scenario: Enter an invalid value
- **WHEN** the viewer enters zero, a negative number, a fraction, empty input or nonnumeric text
- **THEN** the field displays an English validation error and the last valid saved value remains active

### Requirement: Default configuration and reset
On first use and on reset, both lists SHALL contain 5 seconds, 15 seconds, 30 seconds and 1 minute, in that order. Player labels SHALL show the direction and duration in English using s and min; reset SHALL restore both lists.

#### Scenario: First use
- **WHEN** the extension has no saved configuration
- **THEN** each direction contains the four default intervals in the prescribed order
- **AND** the player labels are −5 s, −15 s, −30 s, −1 min on the left and +5 s, +15 s, +30 s, +1 min on the right

#### Scenario: Reset customized settings
- **WHEN** the viewer activates reset after customizing either list
- **THEN** both lists return to their defaults and open supported VODs receive that configuration

### Requirement: Local persistence and immediate application
The extension SHALL persist valid settings on the current device across browser sessions and apply saved changes to already open supported VOD players without a page reload. It SHALL NOT synchronize settings across devices or require an extension account.

#### Scenario: Restart the browser
- **WHEN** the viewer closes and reopens Chrome after saving a configuration
- **THEN** the same lists, intervals and order remain configured on that device

#### Scenario: Update multiple open VODs
- **WHEN** the viewer saves a valid setting while multiple supported VOD tabs are open
- **THEN** each tab applies the changed configuration without a page reload

### Requirement: No external data collection
The extension SHALL store configuration locally and SHALL NOT transmit settings or viewing history to external services, collect analytics or require a backend. Requested permissions SHALL be limited to the supported Twitch functionality and local settings storage.

#### Scenario: Use and configure the extension
- **WHEN** the viewer watches VODs, seeks, edits settings or resets the configuration
- **THEN** these extension actions do not transmit settings or viewing history to an external service or generate analytics events
