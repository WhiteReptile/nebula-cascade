import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { dataDir } from "@/lib/queue";
import type { Verdict } from "@/lib/types";

function verdictPath(id: string): string {
  return path.join(dataDir(), "verdicts", `${id}.json`);
}

export async function saveVerdictRecord(verdict: Verdict): Promise<void> {
  const dir = path.join(dataDir(), "verdicts");
  await mkdir(dir, { recursive: true });
  await writeFile(verdictPath(verdict.id), `${JSON.stringify(verdict, null, 2)}\n`, "utf8");
}

export async function listVerdictRecords(): Promise<Verdict[]> {
  const dir = path.join(dataDir(), "verdicts");
  try {
    const files = await readdir(dir);
    const verdicts = await Promise.all(
      files
        .filter((file) => file.endsWith(".json"))
        .map(async (file) => {
          const raw = await readFile(path.join(dir, file), "utf8");
          return JSON.parse(raw) as Verdict;
        }),
    );
    return verdicts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch {
    return [];
  }
}

export async function getVerdictRecord(id: string): Promise<Verdict | null> {
  try {
    const raw = await readFile(verdictPath(id), "utf8");
    return JSON.parse(raw) as Verdict;
  } catch {
    return null;
  }
}
