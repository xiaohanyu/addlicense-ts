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
 * Detects license headers, generated files, and hashbang lines.
 */

const goGenerated = /^(?:.{1,2}) Code generated .* DO NOT EDIT\.$/m;
const cargoRazeGenerated = /^DO NOT EDIT! Replaced on runs of cargo-raze$/m;

const headPrefixes = [
  "#!",
  "<?xml",
  "<!doctype",
  "# encoding:",
  "# frozen_string_literal:",
  "#\\",
  "<?php",
  "# escape",
  "# syntax",
];

/**
 * Returns true if the file contents contain a license header or SPDX identifier
 * in the first 1000 bytes.
 */
export function hasLicense(b: Buffer): boolean {
  const n = Math.min(b.length, 1000);
  const prefix = b.subarray(0, n).toString("utf-8").toLowerCase();
  return (
    /(?:^|\n)\s*(?:\/\/|\/\*|#|\*)?\s*copyright\s+(?:\(c\)|©|\d)/.test(prefix) ||
    /(?:^|\n)\s*(?:\/\/|\/\*|#|\*)?\s*mozilla public license/.test(prefix) ||
    /(?:^|\n)\s*(?:\/\/|\/\*|#|\*)?\s*spdx-license-identifier:/.test(prefix)
  );
}

/**
 * Returns true if the file contents imply it was generated.
 */
export function isGenerated(b: Buffer): boolean {
  const text = b.toString("utf-8");
  return goGenerated.test(text) || cargoRazeGenerated.test(text);
}

/**
 * Extracts the hashbang/shebang line or other special first line if present.
 * Returns the line as a string (including newline) or null.
 */
export function hashBang(b: Buffer): string | null {
  const newlineIdx = b.indexOf("\n");
  const line =
    newlineIdx >= 0 ? b.subarray(0, newlineIdx + 1).toString("utf-8") : b.toString("utf-8");

  const first = line.toLowerCase();
  for (const h of headPrefixes) {
    if (first.startsWith(h)) {
      return line;
    }
  }
  return null;
}
