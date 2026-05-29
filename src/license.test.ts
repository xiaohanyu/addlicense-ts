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
import { describe, expect, it } from "vitest";
import { fetchTemplate, renderTemplate, resolveLegacyLicense, SpdxMode } from "./license.js";

describe("resolveLegacyLicense", () => {
  it("resolves legacy apache to Apache-2.0", () => {
    expect(resolveLegacyLicense("apache")).toBe("Apache-2.0");
  });

  it("resolves legacy mit to MIT", () => {
    expect(resolveLegacyLicense("mit")).toBe("MIT");
  });

  it("resolves legacy mpl to MPL-2.0", () => {
    expect(resolveLegacyLicense("mpl")).toBe("MPL-2.0");
  });

  it("returns the license as-is if not legacy", () => {
    expect(resolveLegacyLicense("Apache-2.0")).toBe("Apache-2.0");
    expect(resolveLegacyLicense("custom")).toBe("custom");
  });

  it("is case-insensitive for legacy names", () => {
    expect(resolveLegacyLicense("APACHE")).toBe("Apache-2.0");
    expect(resolveLegacyLicense("MIT")).toBe("MIT");
  });
});

describe("fetchTemplate", () => {
  it("returns SPDX-only template when spdx is Only", async () => {
    const tmpl = await fetchTemplate("Apache-2.0", "", SpdxMode.Only);
    expect(tmpl).toContain("SPDX-License-Identifier");
    expect(tmpl).not.toContain("Apache License");
  });

  it("reads custom template file", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "addlicense-"));
    const tmpFile = path.join(tmpDir, "custom.txt");
    await fs.writeFile(tmpFile, "Custom License {{Holder}}");

    const tmpl = await fetchTemplate("", tmpFile, SpdxMode.Off);
    expect(tmpl).toBe("Custom License {{Holder}}");

    await fs.rm(tmpDir, { recursive: true });
  });

  it("returns built-in Apache template", async () => {
    const tmpl = await fetchTemplate("Apache-2.0", "", SpdxMode.Off);
    expect(tmpl).toContain("Apache License");
  });

  it("returns built-in MIT template", async () => {
    const tmpl = await fetchTemplate("MIT", "", SpdxMode.Off);
    expect(tmpl).toContain("Permission is hereby granted");
  });

  it("returns built-in BSD template", async () => {
    const tmpl = await fetchTemplate("bsd", "", SpdxMode.Off);
    expect(tmpl).toContain("BSD-style");
  });

  it("returns built-in MPL template", async () => {
    const tmpl = await fetchTemplate("MPL-2.0", "", SpdxMode.Off);
    expect(tmpl).toContain("Mozilla Public");
  });

  it("throws on unknown license without SPDX mode", async () => {
    await expect(fetchTemplate("unknown", "", SpdxMode.Off)).rejects.toThrow(
      'unknown license: "unknown"',
    );
  });

  it("returns SPDX template for unknown license when spdx is On", async () => {
    const tmpl = await fetchTemplate("unknown", "", SpdxMode.On);
    expect(tmpl).toContain("SPDX-License-Identifier");
  });

  it("appends SPDX suffix for known license when spdx is On", async () => {
    const tmpl = await fetchTemplate("Apache-2.0", "", SpdxMode.On);
    expect(tmpl).toContain("Apache License");
    expect(tmpl).toContain("SPDX-License-Identifier");
  });
});

describe("renderTemplate", () => {
  it("replaces simple variables", () => {
    const result = renderTemplate("Hello {{Holder}}", {
      Year: "",
      Holder: "Test Corp",
      SPDXID: "",
    });
    expect(result).toBe("Hello Test Corp");
  });

  it("replaces multiple variables", () => {
    const result = renderTemplate("{{Year}} {{Holder}} {{SPDXID}}", {
      Year: "2024",
      Holder: "Test",
      SPDXID: "MIT",
    });
    expect(result).toBe("2024 Test MIT");
  });

  it("handles {{#if}} blocks when variable is truthy", () => {
    const result = renderTemplate("{{#if Year}}Year: {{Year}}{{/if}}", {
      Year: "2024",
      Holder: "",
      SPDXID: "",
    });
    expect(result).toBe("Year: 2024");
  });

  it("handles {{#if}} blocks when variable is falsy", () => {
    const result = renderTemplate("{{#if Year}}Year: {{Year}}{{/if}}", {
      Year: "",
      Holder: "",
      SPDXID: "",
    });
    expect(result).toBe("");
  });

  it("handles missing variables gracefully", () => {
    const result = renderTemplate("Hello {{Holder}}", {
      Year: "",
      Holder: "",
      SPDXID: "",
    });
    expect(result).toBe("Hello ");
  });

  it("handles empty template", () => {
    const result = renderTemplate("", {
      Year: "2024",
      Holder: "Test",
      SPDXID: "MIT",
    });
    expect(result).toBe("");
  });

  it("handles unknown variable keys", () => {
    const result = renderTemplate("Hello {{Unknown}}", {
      Year: "",
      Holder: "",
      SPDXID: "",
    });
    expect(result).toBe("Hello ");
  });
});
