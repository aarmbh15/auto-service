/**
 * include.js – universal component loader
 * Works with file:// AND http(s)://
 */
document.addEventListener("DOMContentLoaded", async () => {
  // --------------------------------------------------------------
  // 1. Find every element that has include-html="path/to/file.html"
  // --------------------------------------------------------------
  const includeEls = document.querySelectorAll("[include-html]");

  // Helper: load a file – tries fetch() first, then falls back to file:// via <link>
  const loadFile = async (path, element) => {
    // ----- A. Try modern fetch (works on http(s) and modern browsers on file://) -----
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (res.ok) {
        element.innerHTML = await res.text();
        return true;
      }
    } catch (_) { /* ignore – will try fallback */ }

    // ----- B. Fallback for pure file:// (no CORS) -----
    // Create a hidden <link rel="import"> (HTML Imports – still works in Chrome/Edge)
    return new Promise((resolve) => {
      const link = document.createElement("link");
      link.rel = "import";
      link.href = path;
      link.onload = () => {
        const content = link.import?.body?.innerHTML || "";
        element.innerHTML = content;
        resolve(true);
      };
      link.onerror = () => {
        element.innerHTML = `<p class="text-red-500 text-xs">Failed to load: ${path}</p>`;
        resolve(false);
      };
      document.head.appendChild(link);
    });
  };

  // --------------------------------------------------------------
  // 2. Load all includes in parallel
  // --------------------------------------------------------------
  const loadPromises = Array.from(includeEls).map(async (el) => {
    const file = el.getAttribute("include-html");
    if (!file) return;
    await loadFile(file, el);
  });

  try {
    await Promise.all(loadPromises);
  } catch (err) {
    console.warn("Some includes failed to load:", err);
  }

  // --------------------------------------------------------------
  // 3. Mobile menu toggle – runs AFTER header is injected
  // --------------------------------------------------------------
  const menuBtn = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  } else if (!menuBtn || !mobileMenu) {
    // Optional: warn if IDs are missing (helps debugging)
    console.warn("Mobile menu elements not found. Check #mobile-menu-button and #mobile-menu");
  }

  // --------------------------------------------------------------
  // 4. Optional: Re-initialize any scripts inside loaded components
  // --------------------------------------------------------------
  // If your header/footer contains <script> tags, re-execute them:
  includeEls.forEach((el) => {
    const scripts = el.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  });
});