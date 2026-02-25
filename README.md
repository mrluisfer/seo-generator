# SEO Generator

SEO Generator is a **Next.js-based application** designed to create and preview SEO metadata with real-time platform previews and copy-ready HTML meta tag generation.

The tool enables developers and content creators to:

- Input and validate SEO metadata (title, description, URL, images)
- Add LLM-focused content context (TL;DR, Key Facts, FAQ, HowTo, references, author/dates)
- Preview content across major platforms (Google, Twitter/X, Facebook, Slack, LinkedIn, Pinterest)
- Generate production-ready HTML meta tags including **Open Graph** and **Twitter Card** markup
- Generate **JSON-LD** schemas (Article, FAQ, Breadcrumbs, optional HowTo)
- Generate crawlability artifacts snippets (`robots.txt`, `sitemap.xml`) and a compliance checklist
- Upload and manage SEO images with drag-and-drop support
- Maintain real-time synchronization between form inputs and platform previews

## 📌 Purpose & Scope

SEO Generator provides an end-to-end workflow for SEO optimization:

1. **Metadata Input** – Define titles, descriptions, URLs, and images.
2. **Live Previews** – Instantly see how content appears on multiple platforms.
3. **Meta Tag Generation** – Produce HTML tags ready for production use.
4. **Image Management** – Upload, validate, and preview SEO images.

## 🏛 High-Level System Architecture

The application follows a **hub-and-spoke architecture**:

- `SeoForm` serves as the central data input system.
- Shared state management (via Zustand) propagates input data to:
  - Preview components (Google, Twitter, etc.)
  - Meta tag generation module.

## 🔄 Data Flow & State Management

SEO Generator uses **Zustand** for centralized state management.

**Flow:**

![Structure](/public/seo-preview-structure.png)

1. User inputs SEO data in `SeoForm`.
2. State updates propagate reactively to preview components.
3. Meta tag generation consumes the same state to produce HTML tags.

## 🔗 Core Component Relationships

- **SeoForm** → Collects and validates user input.
- **Preview Components** → Render platform-specific previews in real time.
- **GenerateTagsModal** → Generates copyable HTML meta tags.
- **CopyButton** → Provides one-click copy functionality.

## ⚙️ Technology Stack

| Category              | Technology             | Purpose                          | Key Files                            |
| --------------------- | ---------------------- | -------------------------------- | ------------------------------------ |
| **Framework**         | Next.js 15.5.2         | React framework with SSR support | `app/page.tsx`, `app/layout.tsx`     |
| **State Management**  | Zustand 5.0.8          | Lightweight global store         | `store/use-seo-form-store.ts`        |
| **Form Handling**     | React Hook Form 7.62.0 | Form state & validation          | `app/_components/seo-form/index.tsx` |
| **Schema Validation** | Zod 4.1.5              | Type-safe schema validation      | `app/_components/seo-form/index.tsx` |
| **UI Components**     | Radix UI               | Accessible UI primitives         | `components/ui/dialog.tsx`           |
| **Styling**           | Tailwind CSS 4         | Utility-first CSS framework      | `app/globals.css`                    |
| **File Upload**       | Custom Hook            | Drag-and-drop image handling     | `hooks/use-file-upload.ts`           |
| **Icons**             | Lucide React           | Icon library                     | Preview components                   |
| **Code Highlighting** | Shiki                  | Syntax highlighting              | `lib/highlight-code.ts`              |

## 📂 File Structure & Organization

The project follows the **Next.js 13+ app directory structure**, ensuring modular and maintainable organization:

```bash
app/
├── \_components/
│   ├── seo-form/
│   ├── preview/
│   ├── generate-tags/
│   └── ...
├── layout.tsx
├── page.tsx
└── globals.css
store/
├── use-seo-form-store.ts
├── use-meta-tags-store.ts
└── use-settings-store.ts
hooks/
└── use-file-upload.ts
components/
├── ui/
└── copy-button.tsx
lib/
└── highlight-code.ts
```

## 🗃 Key State Management Patterns

SEO Generator uses **three primary Zustand stores**:

| Store              | Purpose                               | Key State                                  | Consumers                            |
| ------------------ | ------------------------------------- | ------------------------------------------ | ------------------------------------ |
| `useSeoFormStore`  | Core SEO data management              | `title`, `description`, `url`, `imageFile` | SeoForm, Previews, GenerateTagsModal |
| `useMetaTagsStore` | Stores generated HTML tag code        | `code`                                     | GenerateTagsModal, CopyButton        |
| `useSettingsStore` | Validation and configuration settings | `titleMaxLength`, `descriptionMaxLength`   | SeoForm                              |

**State Flow Pattern:**

1. Input updates → `useSeoFormStore`
2. Previews render → Consume `useSeoFormStore`
3. Meta tags generated → Written to `useMetaTagsStore`
4. Validation rules → Provided by `useSettingsStore`

## 🖼 Preview System

The preview system provides **real-time representations** of how SEO content appears across platforms.

**Pattern:**

- Import platform-specific icons
- Consume SEO data from `useSeoFormStore`
- Render platform-specific HTML structure
- Handle fallbacks (e.g., `/placeholder.jpg`)

Preview Components:

- `google-preview.tsx`
- `twitter-preview.tsx`
- `facebook-preview.tsx`
- `slack-preview.tsx`
- `linkedin-preview.tsx`
- `pinterest-preview.tsx`

## 📖 Sources

- `app/page.tsx`
- `app/_components/seo-form/index.tsx`
- `app/_components/preview/*`
- `app/_components/generate-tags/*`
- `store/use-seo-form-store.ts`
- `store/use-meta-tags-store.ts`
- `hooks/use-file-upload.ts`
- `lib/highlight-code.ts`

## 📌 Conclusion

This document provides a **technical overview of the SEO Generator architecture, data flow, and component relationships**.

For implementation details, refer to:

- [SEO Form Input System]
- [Platform Preview System]
- [Meta Tag Generation]
- [Architecture & Implementation]

## SEO for LLMs documentation

- Playbook: [`docs/seo-for-llms-playbook.md`](docs/seo-for-llms-playbook.md)
- Review checklist: [`docs/seo-llm-review-checklist.md`](docs/seo-llm-review-checklist.md)
- Automated check: `npm run check:llm-seo`
