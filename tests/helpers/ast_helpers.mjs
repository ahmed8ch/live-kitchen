import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();

// Unicode emoji ranges covering all standard pictographs, emoticons, and symbols
export const EMOJI_REGEX = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

export function readSourceFile(relPath) {
  const absPath = path.resolve(ROOT_DIR, relPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`File not found: ${relPath}`);
  }
  return fs.readFileSync(absPath, 'utf8');
}

export function sourceFileExists(relPath) {
  const absPath = path.resolve(ROOT_DIR, relPath);
  return fs.existsSync(absPath);
}

export function findAllFiles(dirRel, extensions = ['.tsx', '.ts', '.css', '.html', '.json']) {
  const dirAbs = path.resolve(ROOT_DIR, dirRel);
  const results = [];

  function walk(current) {
    if (!fs.existsSync(current)) return;
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist'].includes(entry.name)) {
          walk(full);
        }
      } else {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          results.push(path.relative(ROOT_DIR, full));
        }
      }
    }
  }

  walk(dirAbs);
  return results;
}

export function scanForEmojis(text) {
  const matches = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(EMOJI_REGEX);
    if (match) {
      matches.push({
        line: i + 1,
        match: match[0],
        snippet: line.trim().slice(0, 80),
      });
    }
  }
  return matches;
}

export function executeCommand(cmd, options = {}) {
  try {
    const stdout = execSync(cmd, {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: options.timeout || 60000,
      ...options,
    });
    return { exitCode: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      exitCode: err.status || 1,
      stdout: err.stdout ? err.stdout.toString() : '',
      stderr: err.stderr ? err.stderr.toString() : err.message,
    };
  }
}

export function extractClasses(content) {
  const classMatches = content.match(/className=["']([^"']+)["']/g) || [];
  const classes = new Set();
  for (const m of classMatches) {
    const inside = m.slice(11, -1);
    inside.split(/\s+/).forEach((c) => {
      if (c) classes.add(c);
    });
  }
  return Array.from(classes);
}
