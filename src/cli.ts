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
 * CLI definition for addlicense.
 */

import { Command } from "commander";
import { type Options, run } from "./index.js";
import { SpdxMode } from "./license.js";

export const program = new Command("addlicense")
  .description(
    "Ensures source code files have copyright license headers by scanning directory patterns recursively.",
  )
  .argument("<pattern...>", "file or directory patterns to scan")
  .option("-c, --copyright <holder>", "copyright holder", "Google LLC")
  .option("-l, --license <type>", "license type: apache, bsd, mit, mpl", "apache")
  .option("-f, --license-file <file>", "license file")
  .option("-y, --year <year>", "copyright year(s)", new Date().getFullYear().toString())
  .option(
    "-v, --verbose",
    "verbose mode: print the name of the files that are modified or were skipped",
  )
  .option(
    "-C, --check",
    "check only mode: verify presence of license headers and exit with non-zero if any are missing",
  )
  .option(
    "-s, --spdx <mode>",
    "include SPDX identifier in license header. Options: 'only' to only print the identifier, 'top' to print it as the first line, 'replace' to replace the license header with just the identifier",
    "",
  )
  .option(
    "-i, --ignore <pattern>",
    "pattern to ignore (can be specified multiple times)",
    collect,
    [],
  )
  .option(
    "-S, --skip <ext>",
    "file extension to skip (can be specified multiple times)",
    collect,
    [],
  )
  .action(actionHandler);

export async function actionHandler(
  patterns: string[],
  options: Record<string, unknown>,
): Promise<void> {
  const spdx = parseSpdxMode(options.spdx as string);
  const opts: Options = {
    holder: options.copyright as string,
    license: options.license as string,
    licenseFile: (options.licenseFile as string | undefined) ?? "",
    year: options.year as string,
    verbose: options.verbose as boolean,
    check: options.check as boolean,
    spdx,
    ignore: options.ignore as string[],
    skip: options.skip as string[],
    patterns,
  };

  try {
    await run(opts);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      process.exit(1);
    }
    throw err;
  }
}

export function collect(value: string, previous: string[]): string[] {
  return previous.concat(value);
}

export function parseSpdxMode(value: string): SpdxMode {
  switch (value.toLowerCase()) {
    case "only":
      return SpdxMode.Only;
    case "top":
    case "replace":
    case "on":
    case "true":
    case "yes":
    case "1":
      return SpdxMode.On;
    default:
      return SpdxMode.Off;
  }
}
