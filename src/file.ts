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
 * File walking and pattern matching utilities.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { minimatch } from "minimatch";

export interface FileEntry {
  path: string;
  mode: number;
}

/**
 * Recursively walks a directory and yields file entries.
 * If the start path is a file, yields just that file.
 */
export async function* walk(start: string): AsyncGenerator<FileEntry> {
  const stat = await fs.stat(start).catch(() => null);
  if (!stat) {
    console.error(`${start}: not found`);
    return;
  }

  if (stat.isFile()) {
    yield { path: start, mode: stat.mode };
    return;
  }

  if (!stat.isDirectory()) {
    return;
  }

  const entries = await fs.readdir(start, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(start, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry.isFile()) {
      const s = await fs.stat(fullPath);
      yield { path: fullPath, mode: s.mode };
    }
  }
}

/**
 * Checks if a path matches any of the provided glob patterns.
 */
export function fileMatches(pathStr: string, patterns: string[]): boolean {
  const normalized = pathStr.replace(/\\/g, "/");
  for (const p of patterns) {
    if (minimatch(normalized, p, { dot: true })) {
      return true;
    }
  }
  return false;
}
