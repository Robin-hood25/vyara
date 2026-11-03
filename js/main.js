import { SITE } from "./config.js";
import { initApp } from "./app.js";
import { initGunLoader } from "./components/gunLoader.js";

// Launch cinematic FPS gun firing & reloading sequence immediately
initGunLoader();

function bootstrap() {
  const root = document.getElementById("app");
  if (!root) {
    console.error("Fatal: #app element not found");
    return;
  }
  initApp(root, SITE);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}

