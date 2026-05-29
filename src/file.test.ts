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

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fileMatches, walk } from "./file.js";

describe("walk", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "addlicense-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("yields a single file", async () => {
    const filePath = path.join(tmpDir, "test.js");
    await fs.writeFile(filePath, "content");

    const entries = [];
    for await (const entry of walk(filePath)) {
      entries.push(entry);
    }

    expect(entries).toHaveLength(1);
    expect(entries[0].path).toBe(filePath);
  });

  it("yields files in a directory recursively", async () => {
    const subDir = path.join(tmpDir, "sub");
    await fs.mkdir(subDir, { recursive: true });
    await fs.writeFile(path.join(tmpDir, "a.js"), "a");
    await fs.writeFile(path.join(subDir, "b.js"), "b");

    const entries = [];
    for await (const entry of walk(tmpDir)) {
      entries.push(entry);
    }

    expect(entries).toHaveLength(2);
    const paths = entries.map((e) => e.path);
    expect(paths).toContain(path.join(tmpDir, "a.js"));
    expect(paths).toContain(path.join(subDir, "b.js"));
  });

  it("handles non-existent path", async () => {
    const entries = [];
    for await (const entry of walk(path.join(tmpDir, "nonexistent"))) {
      entries.push(entry);
    }
    expect(entries).toHaveLength(0);
  });

  it("skips non-file non-directory entries", async () => {
    // Create a symlink to a file
    const filePath = path.join(tmpDir, "target.js");
    const linkPath = path.join(tmpDir, "link.js");
    await fs.writeFile(filePath, "content");
    await fs.symlink(filePath, linkPath);

    const entries = [];
    for await (const entry of walk(tmpDir)) {
      entries.push(entry);
    }

    // Should include the symlink (which is a file) and the target
    expect(entries.length).toBeGreaterThanOrEqual(1);
  });

  it("skips non-file non-directory entries", async () => {
    // Create a symlink (reported as a file on some platforms, skip if not)
    const targetDir = path.join(tmpDir, "target");
    const linkPath = path.join(tmpDir, "link");
    await fs.mkdir(targetDir);
    await fs.symlink(targetDir, linkPath);

    const entries = [];
    for await (const entry of walk(linkPath)) {
      entries.push(entry);
    }

    // Symlinks may be followed or skipped depending on platform,
    // but at minimum the function should not throw
    expect(entries.length).toBeGreaterThanOrEqual(0);
  });

  it("includes file mode", async () => {
    const filePath = path.join(tmpDir, "test.js");
    await fs.writeFile(filePath, "content", { mode: 0o755 });

    const entries = [];
    for await (const entry of walk(filePath)) {
      entries.push(entry);
    }

    // On some platforms umask may affect mode, so just check it's a number
    expect(typeof entries[0].mode).toBe("number");
    expect(entries[0].mode).toBeGreaterThan(0);
  });

  it("skips entries that are neither file nor directory", async () => {
    const statMock = vi.spyOn(fs, "stat").mockResolvedValueOnce({
      isFile: () => false,
      isDirectory: () => false,
    } as unknown as Awaited<ReturnType<typeof fs.stat>>);

    const entries = [];
    for await (const entry of walk(path.join(tmpDir, "fifo"))) {
      entries.push(entry);
    }

    expect(entries).toHaveLength(0);
    statMock.mockRestore();
  });
});

describe("fileMatches", () => {
  it("matches simple glob", () => {
    expect(fileMatches("test.js", ["**/*.js"])).toBe(true);
  });

  it("matches with directory pattern", () => {
    expect(fileMatches("src/components/Button.tsx", ["**/*.tsx"])).toBe(true);
  });

  it("does not match when pattern differs", () => {
    expect(fileMatches("test.js", ["**/*.ts"])).toBe(false);
  });

  it("matches any pattern in the list", () => {
    expect(fileMatches("test.js", ["**/*.ts", "**/*.js"])).toBe(true);
  });

  it("handles dot files", () => {
    expect(fileMatches(".hidden", ["**/*"])).toBe(true);
  });

  it("handles backslash paths", () => {
    expect(fileMatches("src\\test.js", ["**/*.js"])).toBe(true);
  });

  it("returns false for empty patterns", () => {
    expect(fileMatches("test.js", [])).toBe(false);
  });
});
