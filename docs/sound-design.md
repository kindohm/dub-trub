# Sound design

Status: agreed and implemented. Instruments are synthesized locally with the Web Audio API; no original-game recordings are used.

## Agreed direction

- Use short, distinct, organic sound effects: wooden taps, warm marimba notes, and muted low drums.
- Add an original minimal 100 BPM shaker-and-drum loop as the background beat, quieter than the effects.
- Provide separate Beat and Sound effects toggles. Both are initially on; remember the player's preferences for future visits.

## Interaction sounds

- Selecting or deselecting a tile produces a wooden tap.
- An invalid attempt produces a muted low drum instead of the normal tap. This applies both to different tile types and matching tiles without a valid connection.
- Accepting a valid second tile produces a tap. When the pair disappears after the existing 300 ms connection animation, play a warm two-note marimba sound.
- Each removed pair gets its own success sound; control overlapping sounds so rapid removals do not become excessively loud.
- Ignored interactions produce no sound.

## Beat lifecycle

- Start the beat when the player starts a game, subject to the Beat preference.
- Stop the beat when the game ends.
- Silence the beat while the tab is hidden; resume on return if the game is still active and Beat is enabled.

## Existing game behavior

- An invalid second tile becomes the new selected tile. Invalid attempts include different tile types and matching tiles without a valid connection.
- Selecting the same tile again deselects it.
- Accepted pairs display a connection for 300 ms before their tiles disappear; several pairs can be pending together.
- Disabled, empty, and out-of-play tile interactions have no game effect.
- The glossary reserves **Clear** for removing all tiles from the board. This design uses **pair removal** for removing two connected matching tiles.
