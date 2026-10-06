#!/usr/bin/env node

import { execSync, spawn } from "child_process";
import { createWriteStream } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKTREE_PATH = `d:\\File Defir\\Projects\\My Portfolio\\.worktrees\\final-polish`;
const OUTPUT_DIR = __dirname;

console.log("📸 Starting screenshot capture workflow...\n");

// Install Playwright if not present
console.log("Checking Playwright installation...");
try {
  require.resolve("@playwright/test");
} catch {
  console.log("Installing @playwright/test...");
  execSync("npm install --save-dev @playwright/test", { cwd: OUTPUT_DIR });
}

// Start backend and frontend servers
console.log("Starting backend server (port 3000)...");
const backendProc = spawn("bun", ["run", "dev"], {
  cwd: `${WORKTREE_PATH}\\server`,
  detached: true,
  stdio: "ignore",
});

console.log("Starting frontend dev server (port 5173)...");
const frontendProc = spawn("npm", ["run", "dev"], {
  cwd: `${WORKTREE_PATH}\\client`,
  detached: true,
  stdio: "ignore",
});

// Wait for servers to start
await new Promise((resolve) => setTimeout(resolve, 5000));

console.log("✅ Servers started. Capturing screenshots...\n");

// Now use Playwright to capture screenshots
const { chromium } = await import("@playwright/test");

const browser = await chromium.launch();
const context = await browser.createContext();
const page = await context.newPage();

const captures = [
  {
    name: "desktop-1440",
    width: 1440,
    height: 900,
    description: "Desktop view (1440px width)",
  },
  {
    name: "mobile-390",
    width: 390,
    height: 844,
    description: "Mobile view (390px width, iPhone 12)",
  },
];

try {
  // Set viewport and navigate
  for (const capture of captures) {
    console.log(`📱 Capturing ${capture.description}...`);
    await page.setViewportSize({
      width: capture.width,
      height: capture.height,
    });

    await page.goto("http://localhost:5173/", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Wait a bit for animations to settle
    await page.waitForTimeout(1000);

    // Capture full page screenshot
    const filename = `verification-${capture.name}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);
    await page.screenshot({
      path: filepath,
      fullPage: true,
    });
    console.log(`✅ Saved: ${filename}\n`);
  }

  // Capture specific sections for better review
  console.log("📱 Capturing hero section (desktop)...");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
  const heroLocator = await page.locator('[data-section="hero"]');
  await heroLocator.screenshot({
    path: path.join(OUTPUT_DIR, "verification-hero-desktop.png"),
  });
  console.log("✅ Saved: verification-hero-desktop.png\n");

  console.log("📱 Capturing contact section (desktop)...");
  const contactLocator = await page.locator('[data-section="contact"]');
  await contactLocator.screenshot({
    path: path.join(OUTPUT_DIR, "verification-contact-desktop.png"),
  });
  console.log("✅ Saved: verification-contact-desktop.png\n");

  console.log("✅ All screenshots captured successfully!");
} catch (error) {
  console.error("❌ Screenshot capture failed:", error.message);
  process.exit(1);
} finally {
  await browser.close();

  // Cleanup: terminate servers
  console.log("\nCleaning up servers...");
  process.kill(-backendProc.pid);
  process.kill(-frontendProc.pid);
}
