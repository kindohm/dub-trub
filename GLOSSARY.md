# Double Trouble

Double Trouble is a single-player puzzle about connecting matching tiles to clear a board against the clock.

## Language

**Tile**:
A single piece on the board that can be paired with another matching piece.
_Avoid_: Block, square

**Board**:
The play area containing the tiles and the spaces between them.

**Connection**:
An unobstructed path inside the board joining the left or right sides of two matching tiles. It is either straight and horizontal or has two right-angle bends with a vertical segment between horizontal segments.
_Avoid_: Line (when referring to an entire path)

**Segment**:
A straight portion of a connection between its endpoints or bends.
_Avoid_: Line (when counting portions of a connection)

**Bend**:
A change of direction within a connection. A connection with two segments has one bend.
_Avoid_: Turn (which can also mean a player's move)

**Clear**:
Remove all tiles from the board.

**Matching pair**:
Two tiles with the same symbol and color. A matching pair can be removed only if a valid connection joins them.

**Deadlock**:
A board with tiles remaining but no matching pair that can be connected. A deadlock ends the game.
