# blog.rokamaku.github.io

Personal blog built with Astro, based on the retypeset theme with a clean and modern design focused on typography.

## 🚀 Tech Stack

- [Astro](https://astro.build/) - The web framework for content-driven websites
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [UnoCSS](https://unocss.dev/) - Instant on-demand atomic CSS engine
- [MDX](https://mdxjs.com/) - Markdown for the component era
- [KaTeX](https://katex.org/) - Math typesetting library
- [PhotoSwipe](https://photoswipe.com/) - JavaScript gallery
- [Retypeset](https://github.com/radishzzz/astro-theme-retypeset) - Typography-focused Astro blog theme

## 📦 Project Structure

```
/
├── public/           # Static assets
├── src/
│   ├── assets/       # Images and other assets
│   ├── components/   # Reusable UI components
│   ├── content/      # Content collections (posts, about)
│   ├── i18n/         # Internationalization files
│   ├── layouts/      # Page layouts
│   ├── pages/        # Page components and routing
│   ├── plugins/      # Astro plugins
│   ├── styles/       # Global styles
│   ├── types/        # TypeScript type definitions
│   ├── utils/        # Utility functions
│   ├── config.ts     # Site configuration
│   └── env.d.ts      # TypeScript environment declarations
└── package.json      # Project dependencies
```

## 🧞 Commands

All commands are run from the root of the project:

| Command                    | Action                                                |
| -------------------------- | ----------------------------------------------------- |
| `yarn dev`                 | Starts local dev server at `localhost:4321`           |
| `yarn build`               | Build your production site to `./dist/`               |
| `yarn preview`             | Preview your build locally before deploying           |
| `yarn astro ...`           | Run CLI commands like `astro add`, `astro check`      |
| `yarn lint`                | Lint your code with ESLint                            |
| `yarn lint:fix`            | Fix linting issues automatically                      |
| `yarn format`              | Format your code with Prettier                        |
| `yarn format:check`        | Check if your code is properly formatted              |

## 📝 License

This project is licensed under the terms of the license file included in the repository.

## 🔗 Deployment

This blog is deployed to GitHub Pages and can be accessed at [blog.rokamaku.github.io](https://blog.rokamaku.github.io).
