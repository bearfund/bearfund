# Data Model

## Entities

### User

Represents a registered player.

| Field          | Type             | Description                                    |
| -------------- | ---------------- | ---------------------------------------------- |
| `username`     | string           | Unique identifier for the user.                |
| `email`        | string           | User's email address.                          |
| `name`         | string           | Display name.                                  |
| `avatar`       | string           | URL to avatar image.                           |
| `bio`          | string           | User biography.                                |
| `social_links` | object           | Map of social platform URLs (twitter, twitch). |
| `level`        | number           | Current player level.                          |
| `total_xp`     | number           | Total experience points.                       |
| `member_since` | string (ISO8601) | Account creation date.                         |

### Game

Represents a game instance.

| Field          | Type     | Description                                     |
| -------------- | -------- | ----------------------------------------------- |
| `ulid`         | string   | Unique identifier (ULID).                       |
| `title`        | string   | Game title (e.g., "Connect Four").              |
| `mode`         | string   | Game mode (e.g., "Standard").                   |
| `status`       | string   | Game status (`active`, `completed`, `pending`). |
| `current_turn` | string   | ULID of the player whose turn it is.            |
| `players`      | Player[] | List of participants.                           |
| `state`        | object   | Game-specific state (board, moves).             |
| `created_at`   | string   | Creation timestamp.                             |
| `updated_at`   | string   | Last update timestamp.                          |

### Player (in Game)

Represents a participant in a specific game.

| Field             | Type    | Description                                    |
| ----------------- | ------- | ---------------------------------------------- |
| `ulid`            | string  | Unique player identifier in this game context. |
| `user_id`         | number  | Internal user ID.                              |
| `username`        | string  | Username.                                      |
| `color`           | string  | Assigned color/side.                           |
| `is_current_turn` | boolean | Whether it is this player's turn.              |
| `is_winner`       | boolean | Whether this player won.                       |

### Lobby

Represents a pre-game staging area.

| Field         | Type          | Description                         |
| ------------- | ------------- | ----------------------------------- |
| `ulid`        | string        | Unique identifier.                  |
| `host`        | UserSummary   | The user who created the lobby.     |
| `game_title`  | string        | The game being played.              |
| `mode`        | Mode          | Game mode details.                  |
| `is_public`   | boolean       | Visibility.                         |
| `min_players` | number        | Minimum players required.           |
| `status`      | string        | Lobby status (`pending`, `active`). |
| `players`     | LobbyPlayer[] | List of players in the lobby.       |

### Action

Represents a move or action in a game.

| Field         | Type   | Description                                |
| ------------- | ------ | ------------------------------------------ |
| `action_id`   | string | Unique identifier for the action.          |
| `game_ulid`   | string | ID of the game.                            |
| `player_ulid` | string | ID of the player who performed the action. |
| `action`      | string | Action type (e.g., "DROP_PIECE").          |
| `parameters`  | object | Action parameters (e.g., `{ column: 3 }`). |
| `status`      | string | Action status (`queued`, `processed`).     |
| `timestamp`   | string | Time of action.                            |

## Value Objects

### PaginationMeta

Metadata for paginated responses.

| Field          | Type   | Description          |
| -------------- | ------ | -------------------- |
| `current_page` | number | Current page number. |
| `from`         | number | Index of first item. |
| `last_page`    | number | Total pages.         |
| `per_page`     | number | Items per page.      |
| `to`           | number | Index of last item.  |
| `total`        | number | Total items.         |

### PaginationLinks

Navigation links for pagination.

| Field   | Type           | Description           |
| ------- | -------------- | --------------------- |
| `first` | string         | URL to first page.    |
| `last`  | string         | URL to last page.     |
| `prev`  | string \| null | URL to previous page. |
| `next`  | string \| null | URL to next page.     |
