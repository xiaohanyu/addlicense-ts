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
import { licenseHeader } from "./header.js";

describe("licenseHeader", () => {
  it("returns null for unsupported file types", () => {
    const result = licenseHeader("test.unknown", "Copyright", {
      Year: "2024",
      Holder: "Test",
      SPDXID: "MIT",
    });
    expect(result).toBeNull();
  });

  it("generates C-style header", () => {
    const result = licenseHeader("test.c", "Copyright {{Holder}}", {
      Year: "",
      Holder: "Test Corp",
      SPDXID: "",
    });
    expect(result).toBe("/*\n * Copyright Test Corp\n */\n\n");
  });

  it("generates JSDoc-style header", () => {
    const result = licenseHeader("test.js", "Copyright {{Holder}}", {
      Year: "",
      Holder: "Test Corp",
      SPDXID: "",
    });
    expect(result).toBe("/**\n * Copyright Test Corp\n */\n\n");
  });

  it("generates C++-style header", () => {
    const result = licenseHeader("test.go", "Copyright {{Holder}}", {
      Year: "",
      Holder: "Test Corp",
      SPDXID: "",
    });
    expect(result).toBe("// Copyright Test Corp\n\n");
  });

  it("generates hash-style header", () => {
    const result = licenseHeader("test.py", "Copyright {{Holder}}", {
      Year: "",
      Holder: "Test Corp",
      SPDXID: "",
    });
    expect(result).toBe("# Copyright Test Corp\n\n");
  });

  it("generates HTML-style header", () => {
    const result = licenseHeader("test.html", "Copyright {{Holder}}", {
      Year: "",
      Holder: "Test Corp",
      SPDXID: "",
    });
    expect(result).toBe("<!--\n Copyright Test Corp\n-->\n\n");
  });

  it("handles multi-line templates", () => {
    const result = licenseHeader("test.c", "Line 1\nLine 2", {
      Year: "",
      Holder: "",
      SPDXID: "",
    });
    expect(result).toBe("/*\n * Line 1\n * Line 2\n */\n\n");
  });

  it("handles empty template", () => {
    const result = licenseHeader("test.js", "", {
      Year: "",
      Holder: "",
      SPDXID: "",
    });
    expect(result).toBe("/**\n * \n */\n\n");
  });

  it("renders template variables", () => {
    const result = licenseHeader("test.ts", "Copyright{{#if Year}} {{Year}}{{/if}} {{Holder}}", {
      Year: "2024",
      Holder: "Test Corp",
      SPDXID: "MIT",
    });
    expect(result).toBe("/**\n * Copyright 2024 Test Corp\n */\n\n");
  });

  it("handles SPDX template", () => {
    const result = licenseHeader("test.go", "SPDX-License-Identifier: {{SPDXID}}", {
      Year: "",
      Holder: "",
      SPDXID: "Apache-2.0",
    });
    expect(result).toBe("// SPDX-License-Identifier: Apache-2.0\n\n");
  });
});
