// Measures layout metrics for a list of routes at mobile + desktop widths using CDP.
// Usage: node scripts/qa-layout.mjs [baseUrl]
const base = process.argv[2] ?? "http://localhost:3000";
const port = 9222;

const routes = [
  "/",
  "/collections/best-sellers",
  "/products/youmi-beauty-glamdry",
  "/search?q=lenses",
  "/cart",
  "/checkout",
  "/account",
  "/wishlist",
  "/blogs/organization-blog",
  "/blogs/organization-blog/colored-lenses-with-power-vs-without",
  "/pages/about",
  "/policies/shipping-policy",
];

const viewports = [
  { name: "mobile", width: 390, height: 844, mobile: true },
  { name: "tablet", width: 820, height: 1180, mobile: true },
  { name: "desktop", width: 1440, height: 900, mobile: false },
];

async function getTarget() {
  const res = await fetch(`http://127.0.0.1:${port}/json/list`);
  const list = await res.json();
  const page = list.find((t) => t.type === "page");
  if (!page) throw new Error("no page target");
  return page.webSocketDebuggerUrl;
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let id = 0;
    const pending = new Map();
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    });
    ws.addEventListener("error", reject);
    ws.addEventListener("open", () =>
      resolve({
        send(method, params = {}) {
          const messageId = ++id;
          ws.send(JSON.stringify({ id: messageId, method, params }));
          return new Promise((res, rej) => pending.set(messageId, { resolve: res, reject: rej }));
        },
        close: () => ws.close(),
      }),
    );
  });
}

const metricScript = `(() => {
  const doc = document.documentElement;
  const vw = window.innerWidth;
  const q = (sel) => document.querySelector(sel);
  const rect = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y + window.scrollY), w: Math.round(b.width), h: Math.round(b.height) }; };
  const overflowers = [...document.querySelectorAll('body *')].filter((el) => {
    const b = el.getBoundingClientRect();
    return b.width > 0 && (b.right > vw + 2 || b.left < -2);
  }).slice(0, 6).map((el) => ({ tag: el.tagName, cls: String(el.className).slice(0, 60), right: Math.round(el.getBoundingClientRect().right), left: Math.round(el.getBoundingClientRect().left) }));
  return {
    title: document.title,
    vw,
    docWidth: doc.scrollWidth,
    overflowX: doc.scrollWidth - vw,
    overflowers,
    h1: q('h1') ? { text: q('h1').textContent.trim().slice(0, 40), ...rect(q('h1')), font: getComputedStyle(q('h1')).fontSize } : null,
    header: rect(q('.m-mobile-header')),
    sidebar: rect(q('.m-sidebar')),
    main: rect(q('main')),
    footer: rect(q('.footer')),
    brokenImages: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
    images: document.images.length,
    bodyBg: getComputedStyle(document.body).backgroundColor,
  };
})()`;

const run = async () => {
  const wsUrl = await getTarget();
  const client = await connect(wsUrl);
  await client.send("Page.enable");
  await client.send("Runtime.enable");

  const results = [];
  for (const vp of viewports) {
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.mobile,
    });
    for (const route of routes) {
      await client.send("Page.navigate", { url: base + route });
      await new Promise((resolve) => setTimeout(resolve, 900));
      const { result } = await client.send("Runtime.evaluate", {
        expression: metricScript,
        returnByValue: true,
        awaitPromise: false,
      });
      results.push({ viewport: vp.name, route, ...result.value });
    }
  }

  client.close();
  for (const row of results) {
    const flags = [];
    if (row.overflowX > 1) flags.push("OVERFLOW " + row.overflowX);
    if (row.brokenImages) flags.push("BROKEN " + row.brokenImages);
    if (!row.h1) flags.push("NO H1");
    const h1 = row.h1 ? `${row.h1.font} "${row.h1.text}"` : "-";
    console.log(
      `${row.viewport.padEnd(7)} ${String(row.overflowX).padStart(3)}px  h1:${h1.padEnd(52)} main-x:${String(row.main?.x ?? "-").padStart(4)} ${row.route} ${flags.join(" ")}`,
    );
    if (row.overflowers.length) console.log("        overflowers:", JSON.stringify(row.overflowers));
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
