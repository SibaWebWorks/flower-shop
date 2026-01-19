import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "docs");

const INCLUDE_RE = /<!--\s*@include\s+(.+?)\s*-->/g;

function ensureDir(p) {
    fs.mkdirSync(p, { recursive: true });
}

function read(filePath) {
    return fs.readFileSync(filePath, "utf8");
}

function write(filePath, content) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content, "utf8");
}

function copyDir(srcDir, outDir) {
    if (!fs.existsSync(srcDir)) return;
    ensureDir(outDir);

    for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
        const s = path.join(srcDir, entry.name);
        const d = path.join(outDir, entry.name);

        if (entry.isDirectory()) copyDir(s, d);
        else fs.copyFileSync(s, d);
    }
}

function resolveIncludes(html, fromDir, depth = 0) {
    if (depth > 25) throw new Error("Include nesting too deep.");

    return html.replace(INCLUDE_RE, (_, rel) => {
        const target = path.join(SRC, rel.trim());
        if (!fs.existsSync(target)) {
            throw new Error(`Missing include: ${rel.trim()}`);
        }
        const fragment = read(target);
        return resolveIncludes(fragment, path.dirname(target), depth + 1);
    });
}

function buildPages() {
    const pagesDir = path.join(SRC, "pages");
    const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith(".html"));

    for (const f of files) {
        const srcFile = path.join(pagesDir, f);
        const raw = read(srcFile);
        const compiled = resolveIncludes(raw, pagesDir);
        write(path.join(OUT, f), compiled);
    }
}

function cleanOut() {
    fs.rmSync(OUT, { recursive: true, force: true });
    ensureDir(OUT);
}

function main() {
    cleanOut();

    // Build HTML pages
    buildPages();

    // Copy static assets
    copyDir(path.join(SRC, "css"), path.join(OUT, "css"));
    copyDir(path.join(SRC, "js"), path.join(OUT, "js"));
    copyDir(path.join(SRC, "assets"), path.join(OUT, "assets"));
    copyDir(path.join(SRC, "static"), OUT);

    console.log("Built -> docs/");
}

main();
