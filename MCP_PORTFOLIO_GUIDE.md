## Building Your Portfolio Site with MCPs

Use MCPs as an end-to-end workflow, not just for coding.

### 1) Scaffold fast (Filesystem tools)
- Create folders/files for `components`, `sections`, `data`, `assets`.
- Generate starter components: Hero, About, Projects, Skills, Contact, Footer.
- Keep content in data files so updates are easy.

### 2) Design-to-code (Figma MCP)
- Use `get_figma_data` to pull page structure and text.
- Use `download_figma_images` to export icons/images to your project.
- Map Figma sections to reusable React/Tailwind components.

### 3) Implement + iterate (Code editing tools)
- Build reusable cards for projects/skills.
- Add responsive breakpoints and accessibility (semantic headings, alt text, focus states).
- Keep motion subtle and performance-friendly.

### 4) Validate UI automatically (Playwright MCP)
- Open local app, click nav, test buttons/forms, verify links.
- Capture screenshots at mobile/tablet/desktop sizes.
- Use this as your quick regression test after each major change.

### 5) Optional visual differentiation (Blender MCP)
- Create custom 3D hero visuals/renders.
- Export optimized assets for web and use as hero background/accent.

### 6) Launch checklist
- SEO: title, description, OG tags, favicon.
- Performance: optimized images, lazy loading, chunk splitting where needed.
- Accessibility: keyboard nav, contrast, labels/aria.
- Deploy: Vercel / Netlify / GitHub Pages.

---

## Recommended order
1. Define sections + content
2. Pull Figma design/assets
3. Scaffold components
4. Implement responsive styling
5. Run Playwright QA checks
6. Ship + iterate

## For your current local setup
- Use: **http://127.0.0.1:4174/**