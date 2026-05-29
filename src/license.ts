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
 * License templates and data structures.
 */

export interface LicenseData {
  Year: string;
  Holder: string;
  SPDXID: string;
}

export enum SpdxMode {
  Off,
  On,
  Only,
}

const tmplApache = `Copyright{{#if Year}} {{Year}}{{/if}} {{Holder}}

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`;

const tmplBSD = `Copyright (c){{#if Year}} {{Year}}{{/if}} {{Holder}} All rights reserved.
Use of this source code is governed by a BSD-style
license that can be found in the LICENSE file.`;

const tmplMIT = `Copyright (c){{#if Year}} {{Year}}{{/if}} {{Holder}}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

const tmplMPL = `This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.`;

const tmplSPDX = `{{#if Holder}}Copyright{{#if Year}} {{Year}}{{/if}} {{Holder}}
{{/if}}SPDX-License-Identifier: {{SPDXID}}`;

const spdxSuffix = "\n\nSPDX-License-Identifier: {{SPDXID}}";

const licenseTemplates: Record<string, string> = {
  "Apache-2.0": tmplApache,
  MIT: tmplMIT,
  bsd: tmplBSD,
  "MPL-2.0": tmplMPL,
};

const legacyLicenseTypes: Record<string, string> = {
  apache: "Apache-2.0",
  mit: "MIT",
  mpl: "MPL-2.0",
};

/**
 * Resolves a legacy license name to its SPDX equivalent.
 */
export function resolveLegacyLicense(license: string): string {
  const resolved = legacyLicenseTypes[license.toLowerCase()];
  return resolved ?? license;
}

/**
 * Fetches the license template string based on the license type, optional
 * template file, and SPDX mode.
 */
export async function fetchTemplate(
  license: string,
  templateFile: string,
  spdx: SpdxMode,
): Promise<string> {
  if (spdx === SpdxMode.Only) {
    return tmplSPDX;
  }

  if (templateFile) {
    const fs = await import("node:fs/promises");
    const data = await fs.readFile(templateFile, "utf-8");
    return data;
  }

  let tmpl = licenseTemplates[license];
  if (!tmpl) {
    if (spdx === SpdxMode.On) {
      return tmplSPDX;
    }
    throw new Error(
      `unknown license: "${license}". Include the '-s' flag to request SPDX style headers using this license`,
    );
  }

  if (spdx === SpdxMode.On) {
    tmpl += spdxSuffix;
  }

  return tmpl;
}

/**
 * A simple Handlebars-like template engine that supports {{variable}} and
 * {{#if variable}}...{{/if}}.
 */
export function renderTemplate(template: string, data: LicenseData): string {
  // First, process {{#if Variable}}...{{/if}} blocks
  let result = template;
  const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  result = result.replace(ifRegex, (_match, key, content) => {
    const value = data[key as keyof LicenseData];
    return value ? content : "";
  });

  // Then replace simple {{Variable}} placeholders
  result = result.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
    const value = data[key as keyof LicenseData];
    return value ?? "";
  });

  return result;
}
