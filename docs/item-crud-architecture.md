# Item CRUD Architecture

A design for one CRUD system that covers all 7 item types: snippet, prompt, command, note, file, image and link.

**Principles**
1. **Mutations** (create, update, delete) live in one Server Action file, `src/actions/items.ts`.
2. **Reads** live in `src/lib/db/items.ts` and are called directly from server components.
3. **One dynamic route**, `/items/[type]`, renders every type through shared components.
4. **Type-specific behavior lives in components.** Actions stay generic and use a type config only as data, never as `if (type === ...)` branches.

> **Sources:** `context/project-overview.md`, `docs/item-types.md`, `prisma/schema.prisma`, the existing `src/lib/db/items.ts`, `src/actions/profile.ts`, `src/app/dashboard/*`, `src/proxy.ts`, `src/components/layout/sidebar.tsx`.
> `docs/content-types.md` and `src/lib/constants.tsx` (listed in the prompt) do not exist. `docs/item-types.md` covers the content types, and this design adds a type config file in place of `constants.tsx`.

---

## 1. Current state (what the design builds on)

| Area | Today |
|---|---|
| Routes | Flat `src/app/dashboard/` and `src/app/profile/`. No `(dashboard)` route group. `profile/layout.tsx` re-exports the dashboard layout to share the app shell. |
| Item links | The sidebar links to `/items/${type.name}s` (for example `/items/snippets`). The dashboard "View all" links to `/items`. **Neither route exists yet.** |
| Reads | `src/lib/db/items.ts` has `getPinnedItems`, `getRecentItems`, `getItemStats`, `getItemTypesWithCounts` and `getUserUsageStats`, using a shared `ITEM_SELECT` and `mapItem` to build `ItemWithType`. |
| Actions | `src/actions/auth.ts` and `src/actions/profile.ts`, using the `auth()` check, then Zod `safeParse`, then try/catch, returning `{ success, error }`. |
| Protection | `src/proxy.ts` protects only `/dashboard` and `/profile`. Layouts also call `auth()`. |
| UI kit | shadcn `sheet`, `dialog`, `dropdown-menu`, `input`, `label`, `button`, `badge` and `sonner` are installed. |

> ⚠️ **Existing gap:** `getPinnedItems`, `getRecentItems`, `getItemStats` and `getItemTypesWithCounts`, plus the collection queries, do **not filter by `userId`**. Every signed-in user sees everyone's items. The CRUD work should add a required `userId` parameter to every query (see §3).

---

## 2. File structure

```
src/
├── actions/
│   └── items.ts                    # createItem, updateItem, deleteItem, toggleFavorite, togglePin
├── lib/
│   ├── item-types.ts               # Type config: slug ↔ name, content class, fields (shared server/client)
│   ├── db/
│   │   └── items.ts                # Queries (extended), all scoped by userId
│   └── validations/
│       └── items.ts                # Zod schemas: base + per-content-class payloads
├── app/
│   └── items/
│       ├── layout.tsx              # Re-exports dashboard layout (same pattern as profile/)
│       ├── page.tsx                # /items — all items (optional; dashboard "View all" target)
│       ├── loading.tsx             # Skeleton
│       └── [type]/
│           ├── page.tsx            # /items/snippets, /items/links, … list + drawer
│           └── loading.tsx
├── components/
│   └── items/
│       ├── item-list.tsx           # Server: renders cards for a list (grid/list)
│       ├── item-list-header.tsx    # Type title, icon, count, "New {type}" button
│       ├── item-drawer.tsx         # Client: Sheet that hosts view/edit/create
│       ├── item-detail.tsx         # Read view: shared metadata + <ItemContentView>
│       ├── item-form.tsx           # Client: shared form (title, description, tags, collection) + <ItemContentFields>
│       ├── item-actions-menu.tsx   # Client: favorite / pin / edit / delete dropdown
│       ├── delete-item-dialog.tsx  # Client: confirm delete
│       ├── content-fields/         # ← type-specific INPUTS
│       │   ├── index.tsx           #   <ItemContentFields type=…> switch on content class
│       │   ├── text-field.tsx      #   prompt / note (note → markdown editor later)
│       │   ├── code-field.tsx      #   snippet / command (content + language)
│       │   ├── file-field.tsx      #   file / image (upload → fileUrl/fileName/fileSize)
│       │   └── url-field.tsx       #   link
│       └── content-views/          # ← type-specific DISPLAY
│           ├── index.tsx           #   <ItemContentView item=…>
│           ├── code-view.tsx       #   Shiki-highlighted block + copy
│           ├── markdown-view.tsx   #   note
│           ├── text-view.tsx       #   prompt
│           ├── image-view.tsx      #   image preview
│           ├── file-view.tsx       #   name, size, download
│           └── link-view.tsx       #   clickable URL (preview later)
└── proxy.ts                        # add "/items" to PROTECTED_PREFIXES + matcher
```

The existing `src/components/dashboard/item-card.tsx` is reused as-is for list rows. Card display is already type-agnostic, using type color and icon.

---

## 3. Data layer: `src/lib/db/items.ts`

Everything here is called directly from server components. All functions take **`userId` as the first argument**.

| Function | Used by | Notes |
|---|---|---|
| `getItemsByType(userId, typeName, opts?)` | `/items/[type]` | `where: { userId, type: { name, isSystem: true } }`, ordered by `isPinned desc, updatedAt desc`. Returns `ItemWithType[]` through the existing `ITEM_SELECT`. |
| `getItems(userId, opts?)` | `/items` | Same, without the type filter. |
| `getItemById(userId, id)` | drawer / edit | `findFirst({ where: { id, userId } })` with a **detail select** (`content`, `url`, `fileUrl`, `fileName`, `fileSize`, `language`, `collectionId`). Returns `ItemDetail \| null`. |
| `getItemTypeByName(name)` | route + actions | Resolves a system type row (id, icon, color). |
| existing `getPinnedItems`, `getRecentItems`, `getItemStats`, `getItemTypesWithCounts` | dashboard / sidebar | Add a `userId` filter (the gap noted in §1). |

Types:
- `ItemWithType` (existing): the lightweight list shape, with no content. Keeps list pages from over-fetching.
- `ItemDetail = ItemWithType & { content, url, fileUrl, fileName, fileSize, language, collectionId }`: the full shape, only for the open item.

---

## 4. Type config: `src/lib/item-types.ts`

This takes the place of the missing `constants.tsx`. It is a plain TS module with no Prisma import, so both server and client code can import it.

```ts
export type ContentClass = "text" | "code" | "file" | "url"

export interface ItemTypeConfig {
  name: string          // DB ItemType.name, e.g. "snippet"
  slug: string          // URL segment, e.g. "snippets"
  label: string         // "Snippet"
  contentClass: ContentClass
  contentType: "TEXT" | "FILE"   // Prisma ContentType to persist
  pro: boolean
}

export const ITEM_TYPES: ItemTypeConfig[] = [
  { name: "snippet", slug: "snippets", label: "Snippet", contentClass: "code", contentType: "TEXT", pro: false },
  { name: "prompt",  slug: "prompts",  label: "Prompt",  contentClass: "text", contentType: "TEXT", pro: false },
  { name: "command", slug: "commands", label: "Command", contentClass: "code", contentType: "TEXT", pro: false },
  { name: "note",    slug: "notes",    label: "Note",    contentClass: "text", contentType: "TEXT", pro: false },
  { name: "file",    slug: "files",    label: "File",    contentClass: "file", contentType: "FILE", pro: true  },
  { name: "image",   slug: "images",   label: "Image",   contentClass: "file", contentType: "FILE", pro: true  },
  { name: "link",    slug: "links",    label: "Link",    contentClass: "url",  contentType: "TEXT", pro: false },
]

export function getTypeBySlug(slug: string): ItemTypeConfig | undefined
export function getTypeByName(name: string): ItemTypeConfig | undefined
```

- Colors and icons stay in the DB (`ItemType.color`, `ItemType.icon`) and keep rendering through `TypeIcon`. The config holds only behavior.
- `SYSTEM_TYPE_ORDER` in `db/items.ts` and `PRO_TYPES` in `sidebar.tsx` can later be derived from `ITEM_TYPES`. That refactor is optional and outside CRUD scope.
- `contentType` is set **from the config on the server**, never from the client. This fixes the inconsistency noted in `docs/item-types.md`.

---

## 5. Routing: how `/items/[type]` works

```
/items/snippets  ──►  app/items/[type]/page.tsx
                        │ params: Promise<{ type: string }>   (Next.js 16: await params)
                        │ searchParams: Promise<{ item?: string; new?: string }>
                        ▼
                     getTypeBySlug("snippets") ── undefined? ──► notFound()
                        ▼
                     auth() → userId
                        ▼
                     Promise.all([
                       getItemsByType(userId, "snippet"),
                       getItemTypeByName("snippet"),           // icon/color/id for header + form
                       item ? getItemById(userId, item) : null // drawer contents
                     ])
                        ▼
                     <ItemListHeader/> <ItemList/> <ItemDrawer item=… mode=…/>
```

- **One route for all types.** The `[type]` segment is the plural slug the sidebar already produces (`/items/${name}s`). Unknown slugs return a 404.
- **Detail, edit and create open in a drawer** on the same route (matching `context/screenshots/dashboard-ui-drawer.png`), driven by search params:
  - `?item=<id>` opens the read view for that item
  - `?item=<id>&edit=1` opens the edit form
  - `?new=1` opens the create form for the current type

  URL-driven state makes the drawer shareable and back-button friendly. The data is still fetched on the server, so no client fetching is needed.
- **Layout:** `app/items/layout.tsx` is `export { default } from "@/app/dashboard/layout"`, the same as `profile/`, so items get the sidebar and top bar.
- **Protection:** add `/items` to `PROTECTED_PREFIXES` and `"/items/:path*"` to the `matcher` in `src/proxy.ts`. The page still calls `auth()` itself (defense in depth, matching the current layouts).
- `/items` (no type) uses the same components with `getItems(userId)`. It is optional, but the dashboard already links there.
- A separate `/items/[type]/[id]` page isn't needed for MVP. Add one only if full-page editing is wanted.

---

## 6. Mutations: `src/actions/items.ts`

This follows the existing `profile.ts` pattern (`"use server"`, `auth()`, Zod, try/catch, a result object) and widens the result to the coding-standard `{ success, data, error }`.

```ts
export interface ItemActionResult<T = undefined> {
  success: boolean
  data?: T
  error?: string
}

createItem(_prev, formData)      → ItemActionResult<{ id: string }>
updateItem(_prev, formData)      → ItemActionResult<{ id: string }>
deleteItem(id: string)           → ItemActionResult
toggleFavorite(id: string)       → ItemActionResult<{ isFavorite: boolean }>
togglePin(id: string)            → ItemActionResult<{ isPinned: boolean }>
```

Generic flow (the same for all 7 types):
1. `auth()`: return an error if there is no `session.user.id`.
2. Read the type `name` from the form, then `getTypeByName()` from the config. Reject unknown types.
3. `itemInputSchema.safeParse(...)`: Zod validates the base fields plus the payload for that type's `contentClass` (see below).
4. Cross-cutting checks: **ownership** (update/delete use `where: { id, userId }`, through `updateMany`/`deleteMany` or `findFirst` first), the **free-tier limit** (≤ 50 items) on create, and the **Pro gate** when `config.pro && !user.isPro`, plus collection ownership if `collectionId` is set.
5. Write with Prisma: `contentType` comes from the config, `typeId` from `getItemTypeByName`, and tags are upserted per user (`Tag @@unique([name, userId])`) and replaced on update.
6. `revalidatePath("/items/" + config.slug)` and `revalidatePath("/dashboard")` (the sidebar counts and dashboard lists change).
7. Return `{ success, data }`. The client shows a toast through `sonner`.

### Validation: `src/lib/validations/items.ts`

Validation is keyed by the **content class**, not by each of the 7 types, so the action contains no type branching:

```ts
const baseItemSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(500).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  collectionId: z.string().optional(),
})

export const contentSchemas = {
  text: z.object({ content: z.string().min(1) }),
  code: z.object({ content: z.string().min(1), language: z.string().max(40).optional() }),
  url:  z.object({ url: z.url() }),
  file: z.object({ fileUrl: z.url(), fileName: z.string().min(1), fileSize: z.number().int().positive() }),
} satisfies Record<ContentClass, z.ZodType>
```

The action picks `baseItemSchema.and(contentSchemas[config.contentClass])` and writes **only** the fields in the parsed result. Fields belonging to other classes are left `null`, so a link never stores `content` and a snippet never stores `fileUrl`.

Files: uploads go to Cloudflare R2 through `POST /api/upload` (presigned URL, a Route Handler per the coding standards). `createItem` only records the resulting `fileUrl`/`fileName`/`fileSize`. That upload route is a separate feature.

---

## 7. Where type-specific logic lives

| Concern | Location | Type-aware? |
|---|---|---|
| Slug ↔ type, content class, Pro flag | `lib/item-types.ts` (data) | Config only |
| Which payload fields are valid | `lib/validations/items.ts` (per content class) | By class, data-driven |
| Auth, ownership, limits, persistence, revalidation | `actions/items.ts` | **No.** Generic. |
| Queries | `lib/db/items.ts` | No. Filters by `typeName` only. |
| **Form inputs** for the payload | `components/items/content-fields/*` | **Yes** |
| **Display** of the payload | `components/items/content-views/*` | **Yes** |
| Card, header, drawer, menus | `components/items/*`, `dashboard/item-card.tsx` | No. They use type icon/color/label. |

Adding a new built-in type means adding a config entry and a seed row, then reusing an existing content class. Only a brand-new *content class* needs new field and view components plus a schema.

---

## 8. Component responsibilities

| Component | Kind | Responsibility |
|---|---|---|
| `app/items/[type]/page.tsx` | Server | Resolve the slug, check auth, fetch the list, type and open item, then compose the page. |
| `ItemListHeader` | Server | Type icon/color, plural label, count, and a "New {label}" link (`?new=1`). |
| `ItemList` | Server | Map `ItemWithType[]` to `ItemCard`s, each linked to `?item=<id>`. Handles grid/list layout and the empty state. |
| `ItemCard` (existing) | Server | Compact row: icon, title, description, tags, favorite/pin markers, date. |
| `ItemDrawer` | Client | shadcn `Sheet`, open while `item` or `new` is in the URL. Closing clears the params with `router.replace`. Shows `ItemDetail` or `ItemForm` for the current mode. |
| `ItemDetail` | Server-renderable | Title, type badge, description, tags, collection, dates, `<ItemContentView>`, `<ItemActionsMenu>`. |
| `ItemContentView` | Switch | Chooses `CodeView` / `TextView` / `MarkdownView` / `ImageView` / `FileView` / `LinkView` by type. |
| `ItemForm` | Client | One form for create and edit, using `useActionState(createItem \| updateItem)`. Shared fields plus `<ItemContentFields>`. Hidden `type`/`id` inputs. Shows a toast on result and closes or refreshes the drawer. |
| `ItemContentFields` | Client switch | Renders `CodeField` / `TextField` / `FileField` / `UrlField` for the content class. Field names match the Zod schema. |
| `ItemActionsMenu` | Client | Dropdown: favorite/pin (`useTransition` + toggle actions), Edit (`?edit=1`), Delete. |
| `DeleteItemDialog` | Client | shadcn `Dialog` confirmation that calls `deleteItem(id)`, then shows a toast and closes the drawer. |

Server vs client: only the drawer, form, field inputs, menus and dialog are `'use client'`. Lists, cards and read views stay server components, per the coding standards.

---

## 9. Implementation order (suggested)

1. `lib/item-types.ts` and `lib/validations/items.ts`
2. Scope the existing `lib/db/items.ts` queries by `userId`, then add `getItemsByType`, `getItemById` and `getItemTypeByName`
3. `app/items/layout.tsx`, `[type]/page.tsx` and the proxy update. List view working.
4. Drawer and read view (`ItemDetail` + content views, Shiki later)
5. `actions/items.ts` with create/update/delete and toggles, plus `ItemForm` and content fields (text, code, url first)
6. File/image fields after the R2 upload route exists
