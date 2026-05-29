# addlicense-ts

A TypeScript port of [Google's addlicense](https://github.com/google/addlicense) — adds copyright license headers to source code files.

## Installation

```bash
npm install -g addlicense-ts
```

Or use directly with npx:

```bash
npx addlicense-ts <pattern...>
```

## Usage

```bash
addlicense <pattern...> [options]
```

### Arguments

- `<pattern...>` — File or directory patterns to scan (e.g., `src/**/*.ts`)

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `-c, --copyright <holder>` | Copyright holder name | `Google LLC` |
| `-l, --license <type>` | License type: `apache`, `bsd`, `mit`, `mpl` | `apache` |
| `-f, --license-file <file>` | Path to a custom license file | — |
| `-y, --year <year>` | Copyright year(s) | Current year |
| `-v, --verbose` | Print names of modified or skipped files | `false` |
| `-C, --check` | Check-only mode: exit non-zero if headers are missing | `false` |
| `-s, --spdx <mode>` | SPDX identifier mode: `only`, `top`, `replace` | `off` |
| `-i, --ignore <pattern>` | Ignore pattern (repeatable) | `[]` |
| `-S, --skip <ext>` | File extension to skip (repeatable) | `[]` |
| `-h, --help` | Display help | — |

### Examples

Add Apache 2.0 headers to all TypeScript files:

```bash
addlicense "src/**/*.ts" -c "Acme Inc."
```

Check if all files have headers (CI-friendly):

```bash
addlicense "src/**/*.ts" --check
```

Use MIT license with a custom year range:

```bash
addlicense "src/**/*.ts" -l mit -y "2020-2025" -c "Jane Doe"
```

Add SPDX identifiers only:

```bash
addlicense "src/**/*.ts" -s only
```

Ignore `node_modules` and test files:

```bash
addlicense "**/*.ts" -i "node_modules/**" -i "**/*.test.ts"
```

## Supported Licenses

- **Apache 2.0** (`apache`)
- **BSD 3-Clause** (`bsd`)
- **MIT** (`mit`)
- **Mozilla Public License 2.0** (`mpl`)

## Supported File Types

The tool automatically detects the correct comment style for supported file types, including:

- JavaScript / TypeScript (`//`)
- Python / Ruby / Shell (`#`)
- HTML / XML / SVG (`<!-- -->`)
- CSS / SCSS (`/* */`)
- C / C++ / Go / Java / Rust (`/* */` or `//`)
- And many more

## Programmatic API

```typescript
import { run, type Options } from "addlicense-ts";

const options: Options = {
  patterns: ["src/**/*.ts"],
  holder: "Acme Inc.",
  license: "mit",
  year: "2025",
  verbose: false,
  check: false,
  spdx: 0, // SpdxMode.Off
  ignore: [],
  skip: [],
  licenseFile: "",
};

await run(options);
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm run build

# Run tests
pnpm run test

# Run tests with coverage
pnpm run test:cov

# Lint
pnpm run lint

# Format
pnpm run lint:format

# Type check
pnpm run lint:tsc
```

## License

MIT
