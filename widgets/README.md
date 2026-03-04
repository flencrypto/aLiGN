# aLiGN Assistant Widgets

This directory contains `.widget` definition files. Each file describes a self-contained information panel that the aLiGN AI assistant can render in response to natural-language questions from the user.

---

## Widget File Format

Each `.widget` file is a JSON document with the following top-level schema:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique kebab-case identifier |
| `version` | string | ✅ | Semantic version (e.g. `"1.0.0"`) |
| `name` | string | ✅ | Human-readable display name |
| `description` | string | ✅ | What this widget shows and why it is useful |
| `category` | string | ✅ | Grouping — `market-intelligence`, `analytics`, or `diary-planning` |
| `icon` | string | ✅ | Emoji used in the UI header |
| `template` | string | ✅ | Natural-language query template with `{{variable}}` placeholders |
| `variables` | object | ✅ | Map of variable name → variable definition (see below) |
| `data_sources` | array | ✅ | List of data source descriptors (see below) |
| `display` | object | ✅ | Rendering instructions for the widget UI |
| `assistant_hints` | array | ✅ | Suggestions for how the AI assistant should present or extend the data |

### Variable Definition

```json
{
  "type": "enum | string | integer | boolean | date",
  "description": "...",
  "default": "...",
  "required": false,
  "options": ["..."],   // enum only
  "min": 1,             // integer only
  "max": 100,           // integer only
  "system_resolved": true  // auto-filled from session, e.g. current_user
}
```

### Data Source Descriptor

```json
{
  "id": "unique-source-id",
  "endpoint": "/api/v1/...",
  "method": "GET | POST",
  "filter": { "field": "value" },
  "description": "...",
  "placeholder": true    // marks sources not yet implemented
}
```

---

## Available Widgets

| File | Template | Category |
|------|----------|----------|
| [`newly-formed-dc-companies.widget`](./newly-formed-dc-companies.widget) | Show me newly formed companies in the data centre space in the last `{{days}}` days | market-intelligence |
| [`dc-company-news.widget`](./dc-company-news.widget) | Show me the latest `{{category}}` news for data centre companies in the last `{{days}}` days | market-intelligence |
| [`top-n-by-category.widget`](./top-n-by-category.widget) | Show me the top `{{number}}` `{{category}}` `{{type}}` that `{{user}}` has `{{action}}` between `{{start_date}}` and `{{end_date}}` | analytics |
| [`upcoming-sector-events.widget`](./upcoming-sector-events.widget) | What events in the `{{sector}}` sector are upcoming in the next `{{days}}` days? | diary-planning |
| [`diary-today.widget`](./diary-today.widget) | What's in my diary today? | diary-planning |
| [`tasks-today.widget`](./tasks-today.widget) | What do I need to do today? | diary-planning |

---

## Adding a New Widget

1. Create a new file: `widgets/<kebab-case-id>.widget`
2. Follow the schema above — copy an existing widget as a starting point
3. Add an entry to the table above in this README
4. If the widget needs a new API endpoint, add it in `backend/routers/` and register it in `backend/main.py`

---

## Display Types

| Type | Description |
|------|-------------|
| `card-list` | Vertical list of summary cards |
| `news-feed` | News items with category badge, headline and source link |
| `ranked-table` | Table with a rank column, sortable by a metric |
| `timeline` | Chronological list grouped by date or time |
| `task-list` | Sectioned task list with inline complete action |
