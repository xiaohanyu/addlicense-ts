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

import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { actionHandler, collect, parseSpdxMode } from "./cli.js";
import { SpdxMode } from "./license.js";

const runMock = vi.hoisted(() => vi.fn());
vi.mock("./index.js", () => ({ run: runMock }));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(__dirname, "../src/bin.ts");
const tsxPath = path.resolve(__dirname, "../node_modules/.bin/tsx");

describe("collect", () => {
  it("concatenates values", () => {
    expect(collect("a", ["b"])).toEqual(["b", "a"]);
  });

  it("handles empty previous", () => {
    expect(collect("x", [])).toEqual(["x"]);
  });
});

describe("parseSpdxMode", () => {
  it("returns Only for 'only'", () => {
    expect(parseSpdxMode("only")).toBe(SpdxMode.Only);
  });

  it("returns On for 'top'", () => {
    expect(parseSpdxMode("top")).toBe(SpdxMode.On);
  });

  it("returns On for 'replace'", () => {
    expect(parseSpdxMode("replace")).toBe(SpdxMode.On);
  });

  it("returns On for 'on'", () => {
    expect(parseSpdxMode("on")).toBe(SpdxMode.On);
  });

  it("returns On for 'true'", () => {
    expect(parseSpdxMode("true")).toBe(SpdxMode.On);
  });

  it("returns On for 'yes'", () => {
    expect(parseSpdxMode("yes")).toBe(SpdxMode.On);
  });

  it("returns On for '1'", () => {
    expect(parseSpdxMode("1")).toBe(SpdxMode.On);
  });

  it("returns Off for empty string", () => {
    expect(parseSpdxMode("")).toBe(SpdxMode.Off);
  });

  it("returns Off for unknown values", () => {
    expect(parseSpdxMode("unknown")).toBe(SpdxMode.Off);
  });

  it("is case-insensitive", () => {
    expect(parseSpdxMode("ONLY")).toBe(SpdxMode.Only);
    expect(parseSpdxMode("ON")).toBe(SpdxMode.On);
  });
});

describe("CLI", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "addlicense-cli-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("prints help", () => {
    const output = execSync(`${tsxPath} ${cliPath} --help`, { encoding: "utf-8" });
    expect(output).toContain("addlicense");
    expect(output).toContain("-c, --copyright");
    expect(output).toContain("-l, --license");
  });

  it("adds license with default options", async () => {
    const filePath = path.join(tmpDir, "test.js");
    await fs.writeFile(filePath, "console.log('hello');\n");

    execSync(`${tsxPath} ${cliPath} -c "Test Corp" -l mit -y 2024 "${filePath}"`, {
      encoding: "utf-8",
    });

    const content = await fs.readFile(filePath, "utf-8");
    expect(content).toContain("Copyright (c) 2024 Test Corp");
  });

  it("check mode exits with error when license is missing", async () => {
    const filePath = path.join(tmpDir, "test.js");
    await fs.writeFile(filePath, "console.log('hello');\n");

    expect(() => {
      execSync(`${tsxPath} ${cliPath} -c "Test Corp" -l mit -C "${filePath}"`, {
        encoding: "utf-8",
        stdio: "pipe",
      });
    }).toThrow();
  });

  it("check mode exits successfully when license exists", async () => {
    const filePath = path.join(tmpDir, "test.js");
    await fs.writeFile(filePath, "// Copyright 2020 Someone\nconsole.log('hello');\n");

    const result = execSync(`${tsxPath} ${cliPath} -c "Test Corp" -l mit -C "${filePath}"`, {
      encoding: "utf-8",
    });

    expect(result).toBe("");
  });

  it("uses custom license file", async () => {
    const licenseFile = path.join(tmpDir, "custom.txt");
    const filePath = path.join(tmpDir, "test.js");
    await fs.writeFile(licenseFile, "Custom License by {{Holder}}");
    await fs.writeFile(filePath, "console.log('hello');\n");

    execSync(`${tsxPath} ${cliPath} -c "Test Corp" -f "${licenseFile}" "${filePath}"`, {
      encoding: "utf-8",
    });

    const content = await fs.readFile(filePath, "utf-8");
    expect(content).toContain("Custom License by Test Corp");
  });

  it("handles SPDX-only mode", async () => {
    const filePath = path.join(tmpDir, "test.js");
    await fs.writeFile(filePath, "console.log('hello');\n");

    execSync(`${tsxPath} ${cliPath} -c "Test Corp" -l mit -s only "${filePath}"`, {
      encoding: "utf-8",
    });

    const content = await fs.readFile(filePath, "utf-8");
    expect(content).toContain("SPDX-License-Identifier: MIT");
  });

  it("handles verbose mode", async () => {
    const filePath = path.join(tmpDir, "test.js");
    await fs.writeFile(filePath, "console.log('hello');\n");

    const result = execSync(`${tsxPath} ${cliPath} -c "Test Corp" -l mit -v "${filePath}"`, {
      encoding: "utf-8",
    });

    expect(result).toContain("modified");
  });

  it("handles ignore patterns", async () => {
    const filePath = path.join(tmpDir, "test.js");
    await fs.writeFile(filePath, "console.log('hello');\n");

    execSync(`${tsxPath} ${cliPath} -c "Test Corp" -l mit -i "**/*.js" "${filePath}"`, {
      encoding: "utf-8",
    });

    const content = await fs.readFile(filePath, "utf-8");
    expect(content).not.toContain("Copyright");
  });

  it("handles skip extensions", async () => {
    const jsPath = path.join(tmpDir, "test.js");
    const tsPath = path.join(tmpDir, "test.ts");
    await fs.writeFile(jsPath, "// a\n");
    await fs.writeFile(tsPath, "// b\n");

    execSync(`${tsxPath} ${cliPath} -c "Test Corp" -l mit -S js "${tmpDir}"`, {
      encoding: "utf-8",
    });

    const jsContent = await fs.readFile(jsPath, "utf-8");
    const tsContent = await fs.readFile(tsPath, "utf-8");
    expect(jsContent).not.toContain("Copyright");
    expect(tsContent).toContain("Copyright");
  });

  it("handles unknown license error", async () => {
    const filePath = path.join(tmpDir, "test.js");
    await fs.writeFile(filePath, "console.log('hello');\n");

    expect(() => {
      execSync(`${tsxPath} ${cliPath} -c "Test Corp" -l unknown "${filePath}"`, {
        encoding: "utf-8",
        stdio: "pipe",
      });
    }).toThrow(/unknown license/);
  });

  it("handles multiple patterns", async () => {
    const file1 = path.join(tmpDir, "a.js");
    const file2 = path.join(tmpDir, "b.ts");
    await fs.writeFile(file1, "// a\n");
    await fs.writeFile(file2, "// b\n");

    execSync(`${tsxPath} ${cliPath} -c "Test Corp" -l mit "${file1}" "${file2}"`, {
      encoding: "utf-8",
    });

    const content1 = await fs.readFile(file1, "utf-8");
    const content2 = await fs.readFile(file2, "utf-8");
    expect(content1).toContain("Copyright");
    expect(content2).toContain("Copyright");
  });
});

describe("actionHandler", () => {
  beforeEach(() => {
    runMock.mockReset();
  });

  it("runs successfully with valid options", async () => {
    runMock.mockResolvedValueOnce({ modified: 0, skipped: 0, missing: 0 });

    await actionHandler(["src/**/*.ts"], {
      copyright: "Test Corp",
      license: "mit",
      licenseFile: undefined,
      year: "2024",
      verbose: false,
      check: false,
      spdx: "",
      ignore: [],
      skip: [],
    });

    expect(runMock).toHaveBeenCalledOnce();
    expect(runMock).toHaveBeenCalledWith(
      expect.objectContaining({
        holder: "Test Corp",
        license: "mit",
        patterns: ["src/**/*.ts"],
      }),
    );
  });

  it("logs error and exits on Error", async () => {
    runMock.mockRejectedValueOnce(new Error("something went wrong"));

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("exit");
    });

    await expect(
      actionHandler(["pattern"], {
        copyright: "Test Corp",
        license: "mit",
        licenseFile: undefined,
        year: "2024",
        verbose: false,
        check: false,
        spdx: "",
        ignore: [],
        skip: [],
      }),
    ).rejects.toThrow("exit");

    expect(errorSpy).toHaveBeenCalledWith("something went wrong");
    expect(exitSpy).toHaveBeenCalledWith(1);

    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it("re-throws non-Error values", async () => {
    runMock.mockRejectedValueOnce("string error");

    await expect(
      actionHandler(["pattern"], {
        copyright: "Test Corp",
        license: "mit",
        licenseFile: undefined,
        year: "2024",
        verbose: false,
        check: false,
        spdx: "",
        ignore: [],
        skip: [],
      }),
    ).rejects.toBe("string error");
  });
});
