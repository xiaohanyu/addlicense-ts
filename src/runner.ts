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

import { promises as fs } from "node:fs";
import { type FileEntry, fileMatches, walk } from "./file.js";
import { licenseHeader } from "./header.js";
import { fetchTemplate, type LicenseData, resolveLegacyLicense, type SpdxMode } from "./license.js";

export type { SpdxMode };

import { hashBang, hasLicense, isGenerated } from "./detect.js";

export interface Options {
  /** Copyright holder. */
  holder: string;
  /** License type or SPDX ID. */
  license: string;
  /** Path to custom license template file. */
  licenseFile: string;
  /** Copyright year(s). */
  year: string;
  /** Verbose output. */
  verbose: boolean;
  /** Check-only mode (do not modify). */
  check: boolean;
  /** SPDX mode. */
  spdx: SpdxMode;
  /** Glob patterns of files to ignore. */
  ignore: string[];
  /** File extensions to skip. */
  skip: string[];
  /** Directory/file patterns to scan. */
  patterns: string[];
}

export interface Result {
  /** Number of files modified. */
  modified: number;
  /** Number of files skipped (already have license or unsupported). */
  skipped: number;
  /** Number of files with missing licenses in check mode. */
  missing: number;
}

/**
 * Runs addlicense on the given patterns.
 */
export async function run(options: Options): Promise<Result> {
  const resolvedLicense = resolveLegacyLicense(options.license);

  const data: LicenseData = {
    Year: options.year,
    Holder: options.holder,
    SPDXID: resolvedLicense,
  };

  const template = await fetchTemplate(resolvedLicense, options.licenseFile, options.spdx);

  const ignorePatterns = [...options.ignore];
  for (const s of options.skip ?? []) {
    ignorePatterns.push(`**/*.${s}`);
  }

  const result: Result = { modified: 0, skipped: 0, missing: 0 };
  const missingFiles: string[] = [];

  for (const pattern of options.patterns) {
    for await (const entry of walk(pattern)) {
      if (fileMatches(entry.path, ignorePatterns)) {
        if (options.verbose) {
          console.log(`skipping: ${entry.path}`);
        }
        continue;
      }

      if (options.check) {
        const missing = await checkFile(entry, template, data);
        if (missing) {
          result.missing++;
          missingFiles.push(entry.path);
          console.log(entry.path);
        }
      } else {
        const modified = await addLicense(entry, template, data);
        if (modified) {
          result.modified++;
          if (options.verbose) {
            console.log(`${entry.path} modified`);
          }
        } else {
          result.skipped++;
        }
      }
    }
  }

  if (result.missing > 0) {
    throw new MissingLicenseError(result.missing, missingFiles);
  }

  return result;
}

/**
 * Checks whether a file has a license header (for check mode).
 * Returns true if the file is missing a license.
 */
async function checkFile(entry: FileEntry, template: string, data: LicenseData): Promise<boolean> {
  const lic = licenseHeader(entry.path, template, data);
  if (lic === null) {
    // Unknown file extension — not our concern
    return false;
  }

  const b = await fs.readFile(entry.path);
  return !hasLicense(b) && !isGenerated(b);
}

/**
 * Adds a license header to a file if it's missing.
 * Returns true if the file was modified.
 */
async function addLicense(entry: FileEntry, template: string, data: LicenseData): Promise<boolean> {
  const lic = licenseHeader(entry.path, template, data);
  if (lic === null) {
    return false;
  }

  const b = await fs.readFile(entry.path);
  if (hasLicense(b) || isGenerated(b)) {
    return false;
  }

  const hb = hashBang(b);
  let body: Buffer;
  let prefix = "";

  if (hb !== null) {
    const hbBuf = Buffer.from(hb, "utf-8");
    body = b.subarray(hbBuf.length);
    prefix = hb.endsWith("\n") ? hb : `${hb}\n`;
  } else {
    body = b;
  }

  const output = Buffer.concat([Buffer.from(prefix + lic, "utf-8"), body]);
  await fs.writeFile(entry.path, output, { mode: entry.mode });
  return true;
}

export class MissingLicenseError extends Error {
  missingFiles: string[];

  constructor(count: number, missingFiles: string[]) {
    super(`missing license header in ${count} file(s)`);
    this.name = "MissingLicenseError";
    this.missingFiles = missingFiles;
  }
}
