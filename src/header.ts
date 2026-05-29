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
 * Generates license headers with appropriate comment styles for files.
 */

import { type CommentStyle, getCommentStyle } from "./comment.js";
import { type LicenseData, renderTemplate } from "./license.js";

/**
 * Generates a license header for the given file path using the provided
 * template and data. Returns null if the file type is unsupported.
 */
export function licenseHeader(path: string, template: string, data: LicenseData): string | null {
  const style = getCommentStyle(path);
  if (!style) return null;

  return executeTemplate(template, data, style);
}

/**
 * Renders a license template with data and wraps it in comment delimiters.
 */
function executeTemplate(template: string, data: LicenseData, style: CommentStyle): string {
  const rendered = renderTemplate(template, data);
  const lines = rendered.split("\n");

  const out: string[] = [];

  if (style.top) {
    out.push(style.top);
  }

  for (const line of lines) {
    out.push(style.mid + line);
  }

  if (style.bot) {
    out.push(style.bot);
  }

  out.push("");
  return `${out.join("\n")}\n`;
}
