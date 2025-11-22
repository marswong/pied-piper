# claude-code-web-template

The most reliable web template for Claude Code.

## Usage

```bash
npx degit marswong/claude-code-web-template app
cd app
npm install
npm run dev
```

for realtime preview:
```bash
npm run build
npm start
```

port is set to `3000` by default, to set a custom port, please add the `--port` args:
```bash
npm start -- --port 1989
```

## Philosophy

- To avoid unknown issues, only use `next`, `shadcn`, `lucide-react` and `tailwindcss@3`, don't introduce any other package
- Build for model `claude-sonnet-4-5-20250929`, so all package versions and documentations should be published before the date `20250929`
- Leverage local MCP servers to search for resources

## Reference

- [next](https://nextjs.org)
- [shadcn](https://ui.shadcn.com)
- [lucide-react](https://lucide.dev/guide/packages/lucide-react)
- [tailwindcss](https://v3.tailwindcss.com)
