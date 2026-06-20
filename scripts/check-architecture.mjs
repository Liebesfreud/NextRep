import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const textExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".json"]);
const sourceRoots = ["app", "components", "constants", "db", "hooks", "lib"];
const errors = [];

const allowedHexFiles = new Set([
    "constants/colors.ts",
    "constants/themeColors.ts",
    "global.css",
    "tailwind.config.js",
    "tailwind.theme.json",
    "tokens.json",
]);

const allowedStyleSheetFiles = new Set([
    "components/ui/BottomSheetModal.tsx",
]);

function toPosix(filePath) {
    return filePath.split(path.sep).join("/");
}

function walk(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) return walk(fullPath);
        return [fullPath];
    });
}

function lineOf(content, index) {
    return content.slice(0, index).split(/\r?\n/).length;
}

function addError(file, message) {
    errors.push(`${file}: ${message}`);
}

for (const sourceRoot of sourceRoots) {
    for (const absoluteFile of walk(path.join(root, sourceRoot))) {
        const relativeFile = toPosix(path.relative(root, absoluteFile));
        if (!textExtensions.has(path.extname(relativeFile))) continue;

        const content = fs.readFileSync(absoluteFile, "utf8");
        const isAppOrComponent = relativeFile.startsWith("app/") || relativeFile.startsWith("components/");
        const isRootLayout = relativeFile === "app/_layout.tsx";

        if (isAppOrComponent) {
            const forbiddenImports = [
                { pattern: /from\s+["']@\/db\/schema["']/g, label: "@/db/schema" },
                { pattern: /from\s+["']drizzle-orm["']/g, label: "drizzle-orm" },
                { pattern: /from\s+["']@\/db\/client["']/g, label: "@/db/client" },
            ];

            for (const rule of forbiddenImports) {
                for (const match of content.matchAll(rule.pattern)) {
                    if (isRootLayout && rule.label === "@/db/client") continue;
                    addError(relativeFile, `forbidden import ${rule.label} at line ${lineOf(content, match.index ?? 0)}`);
                }
            }
        }

        if (!allowedHexFiles.has(relativeFile)) {
            for (const match of content.matchAll(/#[0-9A-Fa-f]{3,8}\b/g)) {
                addError(relativeFile, `hardcoded hex ${match[0]} at line ${lineOf(content, match.index ?? 0)}`);
            }
        }

        if (!allowedStyleSheetFiles.has(relativeFile) && /StyleSheet\.create\s*\(/.test(content)) {
            addError(relativeFile, "StyleSheet.create is only allowed in the bottom-sheet primitive");
        }
    }
}

if (errors.length > 0) {
    console.error("Architecture check failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
}

console.log("Architecture check passed.");

