# Design

## Context

See proposal.md for motivation. Settings and preview share CSS but have separate HTML. The existing header has a 48px icon and stacked eyebrow and heading.

## Goals / Non-Goals

Keep both documents visually consistent across desktop and narrow viewports. Storage, themes and seek controls are outside this change.

## Decisions

- Keep the icon first in the DOM, and make the existing text wrapper a centered flex row. Retain the existing heading semantics and FOR TWITCH label.
- Use smaller heading text and gaps at narrow widths so the complete header fits at 320px. Allowing wrapping would violate the requested single row.
- Remove the intro elements and unused rule; keep the appearance card's existing top margin.

## Risks / Trade-offs

- Narrow screens have limited header space → check the smallest supported viewport and use responsive typography.
