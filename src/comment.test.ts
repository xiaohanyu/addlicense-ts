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

import { describe, expect, it } from "vitest";
import { getCommentStyle } from "./comment.js";

describe("getCommentStyle", () => {
  it("returns C-style for .c files", () => {
    const style = getCommentStyle("test.c");
    expect(style).toEqual({ top: "/*", mid: " * ", bot: " */" });
  });

  it("returns JSDoc-style for .js files", () => {
    const style = getCommentStyle("test.js");
    expect(style).toEqual({ top: "/**", mid: " * ", bot: " */" });
  });

  it("returns JSDoc-style for .ts files", () => {
    const style = getCommentStyle("test.ts");
    expect(style).toEqual({ top: "/**", mid: " * ", bot: " */" });
  });

  it("returns C++-style for .go files", () => {
    const style = getCommentStyle("test.go");
    expect(style).toEqual({ top: "", mid: "// ", bot: "" });
  });

  it("returns hash-style for .py files", () => {
    const style = getCommentStyle("test.py");
    expect(style).toEqual({ top: "", mid: "# ", bot: "" });
  });

  it("returns hash-style for .sh files", () => {
    const style = getCommentStyle("test.sh");
    expect(style).toEqual({ top: "", mid: "# ", bot: "" });
  });

  it("returns hash-style for Dockerfile", () => {
    const style = getCommentStyle("Dockerfile");
    expect(style).toEqual({ top: "", mid: "# ", bot: "" });
  });

  it("returns HTML-style for .html files", () => {
    const style = getCommentStyle("test.html");
    expect(style).toEqual({ top: "<!--", mid: " ", bot: "-->" });
  });

  it("returns HTML-style for .xml files", () => {
    const style = getCommentStyle("test.xml");
    expect(style).toEqual({ top: "<!--", mid: " ", bot: "-->" });
  });

  it("returns Lisp-style for .el files", () => {
    const style = getCommentStyle("test.el");
    expect(style).toEqual({ top: "", mid: ";; ", bot: "" });
  });

  it("returns Erlang-style for .erl files", () => {
    const style = getCommentStyle("test.erl");
    expect(style).toEqual({ top: "", mid: "% ", bot: "" });
  });

  it("returns SQL-style for .sql files", () => {
    const style = getCommentStyle("test.sql");
    expect(style).toEqual({ top: "", mid: "-- ", bot: "" });
  });

  it("returns OCaml-style for .ml files", () => {
    const style = getCommentStyle("test.ml");
    expect(style).toEqual({ top: "(**", mid: "   ", bot: "*)" });
  });

  it("returns PowerShell-style for .ps1 files", () => {
    const style = getCommentStyle("test.ps1");
    expect(style).toEqual({ top: "<#", mid: " ", bot: "#>" });
  });

  it("returns Vim-style for .vim files", () => {
    const style = getCommentStyle("test.vim");
    expect(style).toEqual({ top: "", mid: '" ', bot: "" });
  });

  it("returns Jinja2-style for .j2 files", () => {
    const style = getCommentStyle("test.j2");
    expect(style).toEqual({ top: "{#", mid: "", bot: "#}" });
  });

  it("handles paths with directories", () => {
    const style = getCommentStyle("/path/to/test.js");
    expect(style).toEqual({ top: "/**", mid: " * ", bot: " */" });
  });

  it("handles paths with backslashes", () => {
    const style = getCommentStyle("\\path\\to\\test.py");
    expect(style).toEqual({ top: "", mid: "# ", bot: "" });
  });

  it("returns null for unknown extensions", () => {
    const style = getCommentStyle("test.unknown");
    expect(style).toBeNull();
  });

  it("returns null for files without extensions", () => {
    const style = getCommentStyle("Makefile");
    expect(style).toBeNull();
  });

  it("handles CMakeLists.txt specially", () => {
    const style = getCommentStyle("CMakeLists.txt");
    expect(style).toEqual({ top: "", mid: "# ", bot: "" });
  });

  it("handles .cmake files specially", () => {
    const style = getCommentStyle("test.cmake");
    expect(style).toEqual({ top: "", mid: "# ", bot: "" });
  });

  it("handles .cmake.in files specially", () => {
    const style = getCommentStyle("test.cmake.in");
    expect(style).toEqual({ top: "", mid: "# ", bot: "" });
  });

  it("is case-insensitive for extensions", () => {
    const style = getCommentStyle("test.JS");
    expect(style).toEqual({ top: "/**", mid: " * ", bot: " */" });
  });

  it("handles empty path", () => {
    const style = getCommentStyle("");
    expect(style).toBeNull();
  });
});
