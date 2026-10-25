# Item Types

DevStash has 7 built-in (system) item types. They are rows in the `ItemType` table with `isSystem = true` and `userId = null`, seeded by `prisma/seed.ts`. Every `Item` references one type through `typeId`.

> **Sources:** `prisma/schema.prisma`, `prisma/seed.ts`, `src/lib/icon-map.tsx`, `src/lib/db/items.ts`, `src/components/layout/sidebar.tsx`, `src/components/dashboard/item-card.tsx`, `context/project-overview.md`.
> `src/lib/constants.tsx` (listed in the research prompt) does not exist. Type metadata comes from the DB seed, and icons are resolved in `src/lib/icon-map.tsx`.

---

## Per-type reference

Listed in display order (`SYSTEM_TYPE_ORDER` in `src/lib/db/items.ts`).

| # | Name (`ItemType.name`) | Icon (Lucide) | Color | Purpose | Key fields |
|---|---|---|---|---|---|
| 1 | `snippet` | `Code` | `#3b82f6` (blue) | Reusable code in any language, shown with syntax highlighting | `content`, `language`, `description` |
| 2 | `prompt` | `Sparkles` | `#8b5cf6` (violet) | AI prompts, system messages, prompt templates | `content`, `description` |
| 3 | `command` | `Terminal` | `#f97316` (orange) | Terminal / shell commands | `content`, `description` (`language` optional, e.g. `bash`) |
| 4 | `note` | `StickyNote` | `#fde047` (yellow) | Markdown notes and docs | `content` (markdown), `description` |
| 5 | `file` | `File` | `#6b7280` (gray) | Uploaded files such as PDFs and templates. **Pro** | `fileUrl`, `fileName`, `fileSize`, `description` |
| 6 | `image` | `Image` | `#ec4899` (pink) | Screenshots, diagrams, visual references. **Pro** in the sidebar badge (see note below) | `fileUrl`, `fileName`, `fileSize`, `description` |
| 7 | `link` | `Link` | `#10b981` (emerald) | Bookmarked URLs (previews are planned) | `url`, `description` |

Notes:
- The project overview calls the last type **URL**. In the DB and code it is named `link`.
- The icon is stored as a string (for example `"Code"`). `getTypeIcon()` / `<TypeIcon>` map that string to a Lucide component and fall back to `HelpCircle` for unknown names.
- **Pro gating:** the sidebar shows a "PRO" badge for `file` and `image` (`PRO_TYPES` in `sidebar.tsx`). The monetization table, however, says Free users can upload **images only**, so image uploads may be free while other file types are Pro. Upload limits are not enforced in code yet.
- The seed data only creates `snippet`, `prompt`, `command` and `link` items. No `note`, `file` or `image` items are seeded.

---

## Classification: text vs file vs URL

The `ContentType` enum (`TEXT` | `FILE`, default `TEXT`) records how an item's payload is stored. There is no separate URL content type: link items use `contentType = TEXT` and put the address in `url`.

| Class | Types | `contentType` | Payload field(s) |
|---|---|---|---|
| **Text** | snippet, prompt, command, note | `TEXT` | `content` (`@db.Text`), plus `language` for code |
| **File** | file, image | `FILE` | `fileUrl` (Cloudflare R2), `fileName`, `fileSize` (bytes) |
| **URL** | link | `TEXT` | `url` (`content` usually empty) |

`contentType` does not follow automatically from the item type. It is set separately on each item, so create/update logic has to keep the two consistent.

---

## Shared properties

Every item has these fields, whatever its type:

- `id`, `title` (required), `description` (optional, shown as the subtitle on cards)
- `isFavorite`, `isPinned`, `lastUsedAt` (for the Favorites, Pinned and Recently Used views)
- `userId` (owner, cascade delete), `typeId` (required), `collectionId` (optional, one collection per item)
- `tags` via the `ItemTag` join table (tags are unique per user)
- `createdAt`, `updatedAt`

`ItemType` itself has `name`, `icon`, `color`, `isSystem` and `userId`, with `@@unique([name, userId])`. Custom types (Pro, not built yet) will be rows with `isSystem = false` and a `userId`.

---

## Display differences

What exists today:
- **Item card** (`item-card.tsx`): every type renders the same way. Type color is used for the 3px left border and the icon tint, the icon sits in a muted badge, and the card shows title, favorite/pin markers, description, tags and the date (`lastUsedAt` ?? `createdAt`).
- **Sidebar**: types are listed in `SYSTEM_TYPE_ORDER` with a colored icon, a pluralized capitalized label and a count. Each links to `/items/{name}s` (for example `/items/snippets`). `file` and `image` get a PRO badge.
- **Collection card**: shows the color/icon of the collection's dominant type.

What is planned (from the project overview, not implemented yet):
- **snippet / command**: syntax-highlighted code block (Shiki), using `language`
- **note**: markdown editor and rendered markdown
- **prompt**: plain text, plus the AI "Prompt Optimizer"
- **file**: file name/size with a download link
- **image**: thumbnail / image preview from `fileUrl`
- **link**: clickable URL with a link preview
