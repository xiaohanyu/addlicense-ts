/**
 * MIT License
 *
 * Copyright (c) 2026–Present Xiao Hanyu (https://xiaohanyu.me)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 */

/**
 * Maps file extensions and names to their comment styles.
 */

export interface CommentStyle {
  top: string;
  mid: string;
  bot: string;
}

// Build a map from extension/name -> CommentStyle
const commentStyles = new Map<string, CommentStyle>();

function addStyle(extensions: string[], style: CommentStyle): void {
  for (const ext of extensions) {
    commentStyles.set(ext.toLowerCase(), style);
  }
}

// C-style block comments (/* ... */)
addStyle([".c", ".h", ".gv", ".java", ".kt", ".kts", ".scala"], {
  top: "/*",
  mid: " * ",
  bot: " */",
});

// JSDoc-style block comments (/** ... */)
addStyle([".css", ".scss", ".sass", ".less", ".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx"], {
  top: "/**",
  mid: " * ",
  bot: " */",
});

// C++-style line comments (//)
addStyle(
  [
    ".cc",
    ".cpp",
    ".hh",
    ".hpp",
    ".cs",
    ".dart",
    ".go",
    ".groovy",
    ".gradle",
    ".hcl",
    ".m",
    ".mm",
    ".php",
    ".proto",
    ".rs",
    ".swift",
    ".v",
    ".sv",
  ],
  { top: "", mid: "// ", bot: "" },
);

// Hash-style line comments (#)
addStyle(
  [
    ".awk",
    ".buckconfig",
    "buck",
    ".bzl",
    ".bazel",
    "build",
    ".build",
    ".dockerfile",
    "dockerfile",
    ".ex",
    ".exs",
    ".fpp",
    ".graphql",
    ".jl",
    ".nix",
    ".pl",
    ".pp",
    ".py",
    ".pyx",
    ".pxd",
    ".raku",
    ".rb",
    ".ru",
    "gemfile",
    ".sh",
    ".bash",
    ".zsh",
    ".tcl",
    ".tf",
    ".toml",
    ".yaml",
    ".yml",
  ],
  { top: "", mid: "# ", bot: "" },
);

// Lisp-style line comments (;;)
addStyle([".el", ".lisp", ".scm"], { top: "", mid: ";; ", bot: "" });

// Erlang-style line comments (%)
addStyle([".erl"], { top: "", mid: "% ", bot: "" });

// SQL/Haskell/Lua-style line comments (--)
addStyle([".hs", ".lua", ".sql", ".sdl"], { top: "", mid: "-- ", bot: "" });

// HTML/XML-style block comments (<!-- ... -->)
addStyle([".html", ".htm", ".vue", ".svelte", ".wxi", ".wxl", ".wxs", ".xml"], {
  top: "<!--",
  mid: " ",
  bot: "-->",
});

// Jinja2-style comments ({# ... #})
addStyle([".j2"], { top: "{#", mid: "", bot: "#}" });

// OCaml-style comments ((** ... *)
addStyle([".ml", ".mli", ".mll", ".mly"], { top: "(**", mid: "   ", bot: "*)" });

// PowerShell-style comments (<# ... #>)
addStyle([".ps1", ".psm1"], { top: "<#", mid: " ", bot: "#>" });

// Vim-style comments (" )
addStyle([".vim"], { top: "", mid: '" ', bot: "" });

/**
 * Returns the comment style for a given file path, or null if unsupported.
 */
export function getCommentStyle(path: string): CommentStyle | null {
  const base = path.toLowerCase().split(/[\\/]/).pop() || "";
  const ext = getExtension(base);

  const style = commentStyles.get(ext);
  if (style) return style;

  // Special handling for CMake files
  if (base === "cmakelists.txt" || base.endsWith(".cmake.in") || base.endsWith(".cmake")) {
    return { top: "", mid: "# ", bot: "" };
  }

  return null;
}

/**
 * Returns the file extension, or the full name if there is no extension.
 */
function getExtension(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx > 0 ? name.slice(idx) : name;
}
