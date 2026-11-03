export type StaticPage = {
  handle: string;
  title: string;
  description: string;
  eyebrow?: string;
  updated?: string;
  content: string;
};

export const contentPages: Record<string, StaticPage> = {
  about: {
    handle: "about",
    title: "About Youmi Beauty",
    description:
      "A Dubai-born beauty house creating salon-grade hair tools, human hair extensions, coloured lenses and body rituals for everyday life.",
    eyebrow: "Our story",
    content: `
      <p>Youmi Beauty began in Dubai with a simple idea: the rituals that make you feel most like yourself should be easy to reach, beautifully made and genuinely effective.</p>
      <p>We work with stylists, lens specialists and formulators to build a focused collection — high-performance hair tools, ethically sourced human hair, coloured contact lenses and mineral-rich body care. Every product is chosen for how it performs in real life, not just how it looks on a shelf.</p>
      <h2>Made for the way you get ready</h2>
      <p>Our pieces are designed to travel: from a quick morning blowout in a small Dubai apartment to a wedding in Riyadh or a long weekend in Europe. Universal voltage, compact cases and straightforward instructions come as standard.</p>
      <h2>Quality, without the theatre</h2>
      <p>We keep the range small so we can stand behind every item. If a tool does not feel salon-grade in the hand, it does not make the collection. If a shade does not look natural in daylight, we keep working on it.</p>
      <h2>Here when you need us</h2>
      <p>Our team is based in Dubai and answers on WhatsApp within one business day. Colour matching for extensions, prescription checks for lenses and styling advice are all part of the service — before and after you order.</p>
      <p>Questions? Write to <a href="mailto:Support@youmibeauty.com">Support@youmibeauty.com</a> or message us on <a href="https://wa.me/+971522888834" target="_blank" rel="noopener noreferrer">WhatsApp</a>.</p>
    `,
  },
  "frequently-asked-questions": {
    handle: "frequently-asked-questions",
    title: "Frequently Asked Questions",
    description:
      "Answers about orders, delivery, hair extensions, coloured lenses, returns and product care.",
    eyebrow: "Help centre",
    content: `
      <h2>Orders &amp; delivery</h2>
      <p><strong>Where do you ship from?</strong> Every order is dispatched from Dubai, usually within one business day.</p>
      <p><strong>How long does delivery take?</strong> UAE orders arrive in 1–3 working days, GCC in 3–5 working days and worldwide in 5–9 working days. Duties may apply outside the UAE.</p>
      <p><strong>Is shipping free?</strong> Shipping is complimentary on orders over Dhs. 300. Below that, a flat Dhs. 25 applies.</p>
      <p><strong>Can I track my order?</strong> Yes. Once dispatched, you will receive a tracking link by email. You can also message us on WhatsApp with your order number.</p>

      <h2>Hair extensions</h2>
      <p><strong>Can I colour or heat-style the hair?</strong> Yes — our human hair extensions are heat-stylable up to 180°C. We recommend a professional colourist for any chemical service.</p>
      <p><strong>How do I choose the right shade?</strong> Send us a photo taken in natural daylight on WhatsApp. We colour-match before dispatch, free of charge.</p>
      <p><strong>How long do clip-ins last?</strong> With care, a set can be worn for years. Wash with sulphate-free shampoo, detangle from ends to roots and store in the pouch between wears.</p>

      <h2>Coloured contact lenses</h2>
      <p><strong>With power or without?</strong> If you do not wear a prescription, choose without power. If you already wear glasses or contacts, choose with power and send us your prescription after checkout.</p>
      <p><strong>How often should I replace them?</strong> Our coloured lenses are monthly disposables. Replace them every month, even if they still feel comfortable.</p>
      <p><strong>Can I sleep or swim in them?</strong> No. Never sleep or swim in contact lenses, and always wash and dry your hands before handling them.</p>

      <h2>Returns &amp; support</h2>
      <p><strong>What is your returns policy?</strong> Unused, unopened items can be returned within 14 days of delivery. For hygiene reasons, opened extensions, lenses and body-care products are non-returnable. See our <a href="/policies/refund-policy">Refund Policy</a> for full details.</p>
      <p><strong>What if something arrives damaged?</strong> Message us within 48 hours with a photo and your order number. We will arrange a replacement or refund.</p>
      <p><strong>How do I reach you?</strong> WhatsApp <a href="https://wa.me/+971522888834" target="_blank" rel="noopener noreferrer">+971 52 288 8834</a> or email <a href="mailto:Support@youmibeauty.com">Support@youmibeauty.com</a>.</p>
    `,
  },
  press: {
    handle: "press",
    title: "Press",
    description:
      "Brand information, product imagery and press contacts for Youmi Beauty.",
    eyebrow: "Press room",
    content: `
      <p>Youmi Beauty is a Dubai-based beauty house creating salon-grade hair tools, human hair extensions, coloured contact lenses and body rituals. The collection is sold online and through selected stylists in the UAE and GCC.</p>
      <h2>Brand facts</h2>
      <ul>
        <li>Founded in Dubai, United Arab Emirates.</li>
        <li>Focused on hair tools, extensions, coloured lenses and body care.</li>
        <li>Dispatch from Dubai to the UAE, GCC and worldwide.</li>
        <li>Support and colour matching available on WhatsApp.</li>
      </ul>
      <h2>Press enquiries</h2>
      <p>For interviews, product samples or high-resolution imagery, contact <a href="mailto:Support@youmibeauty.com">Support@youmibeauty.com</a> with your outlet, deadline and request. We answer within one business day.</p>
      <h2>Using our imagery</h2>
      <p>Images from this site may be used for editorial coverage of Youmi Beauty with credit. Please do not alter product colours or remove the brand name from lifestyle imagery.</p>
    `,
  },
  wholesale: {
    handle: "wholesale",
    title: "Wholesale",
    description:
      "Trade pricing for salons, stylists and retailers across the UAE and GCC.",
    eyebrow: "Trade programme",
    content: `
      <p>We partner with salons, stylists and selected retailers who want salon-grade hair tools, extensions and lenses with reliable stock and local support.</p>
      <h2>Who we work with</h2>
      <ul>
        <li>Hair and beauty salons in the UAE and GCC.</li>
        <li>Independent stylists with an established client base.</li>
        <li>Concept stores and beauty retailers with a curated assortment.</li>
      </ul>
      <h2>How it works</h2>
      <ol>
        <li>Send us your trade licence, salon details and the lines you are interested in.</li>
        <li>We will share the wholesale price list and minimum order quantities.</li>
        <li>Approved accounts receive a dedicated order contact and restock reminders.</li>
      </ol>
      <h2>Start a conversation</h2>
      <p>Email <a href="mailto:Support@youmibeauty.com">Support@youmibeauty.com</a> with the subject “Wholesale” or message <a href="https://wa.me/+971522888834" target="_blank" rel="noopener noreferrer">+971 52 288 8834</a>.</p>
    `,
  },
  affiliate: {
    handle: "affiliate",
    title: "Affiliate Programme",
    description:
      "Earn commission by sharing Youmi Beauty products with your audience.",
    eyebrow: "Creators",
    content: `
      <p>Our affiliate programme is for creators, stylists and publishers whose audience genuinely loves hair, beauty and self-care.</p>
      <h2>What you get</h2>
      <ul>
        <li>A personal discount code for your community.</li>
        <li>Commission on qualifying orders tracked to your code or link.</li>
        <li>Early access to launches and selected campaign assets.</li>
      </ul>
      <h2>What we look for</h2>
      <ul>
        <li>An engaged audience in beauty, hair, lenses or lifestyle.</li>
        <li>Content that is honest, well-lit and true to the product.</li>
        <li>Respect for our hygiene and lens-safety guidelines.</li>
      </ul>
      <h2>Apply</h2>
      <p>Send your name, social handle, audience size and a short note about how you would feature Youmi Beauty to <a href="mailto:Support@youmibeauty.com">Support@youmibeauty.com</a>.</p>
    `,
  },
};

export const policyPages: Record<string, StaticPage> = {
  "privacy-policy": {
    handle: "privacy-policy",
    title: "Privacy Policy",
    description:
      "How Youmi Beauty collects, uses and protects your personal information.",
    updated: "3 November 2026",
    content: `
      <p>This policy explains what information we collect when you visit the Youmi Beauty storefront, place an order or contact us, and how that information is used.</p>
      <h2>Information we collect</h2>
      <ul>
        <li><strong>Order details:</strong> name, email address, phone number, delivery address and order contents.</li>
        <li><strong>Contact messages:</strong> anything you send us by email, WhatsApp or the newsletter form.</li>
        <li><strong>Technical data:</strong> pages visited and basic device information, used to keep the site secure and improve the experience.</li>
      </ul>
      <h2>How we use it</h2>
      <p>We use your information to process and deliver orders, answer enquiries, confirm prescriptions or colour matches, prevent fraud and — where you have opted in — send occasional newsletters.</p>
      <h2>Sharing</h2>
      <p>We share only what is necessary with delivery partners, payment providers and the service providers that host our storefront. We do not sell your personal information.</p>
      <h2>Cookies and local storage</h2>
      <p>The site uses local storage to remember your bag and wishlist on your device. Analytics, where enabled, is used in aggregate to understand which pages are useful.</p>
      <h2>Your choices</h2>
      <p>You can ask us to access, correct or delete your personal information, or unsubscribe from marketing at any time, by emailing <a href="mailto:Support@youmibeauty.com">Support@youmibeauty.com</a>.</p>
      <h2>Retention</h2>
      <p>Order records are kept for as long as required for accounting, warranty and legal purposes. Marketing preferences are kept until you withdraw consent.</p>
      <h2>Contact</h2>
      <p>Questions about privacy can be sent to <a href="mailto:Support@youmibeauty.com">Support@youmibeauty.com</a> or <a href="https://wa.me/+971522888834" target="_blank" rel="noopener noreferrer">+971 52 288 8834</a>.</p>
    `,
  },
  "refund-policy": {
    handle: "refund-policy",
    title: "Refund Policy",
    description:
      "Returns, exchanges and refunds for Youmi Beauty orders.",
    updated: "3 November 2026",
    content: `
      <p>We want you to love what you ordered. If something is not right, contact us and we will do our best to resolve it quickly.</p>
      <h2>Change of mind</h2>
      <p>Unused, unopened items can be returned within 14 days of delivery for a refund or exchange. Items must be in their original packaging with seals intact. Return shipping is the customer's responsibility unless the item is faulty.</p>
      <h2>Hygiene exceptions</h2>
      <p>For health and hygiene reasons, opened hair extensions, coloured contact lenses, lens solution, lashes and body-care products cannot be returned once opened. This does not affect your rights if an item arrives damaged or faulty.</p>
      <h2>Faulty or damaged items</h2>
      <p>Message us within 48 hours of delivery with your order number and a photo of the issue. We will arrange a replacement, repair or refund, including return shipping where appropriate.</p>
      <h2>How to start a return</h2>
      <ol>
        <li>Email <a href="mailto:Support@youmibeauty.com">Support@youmibeauty.com</a> with your order number and reason for return.</li>
        <li>We will confirm whether the item is eligible and share return instructions.</li>
        <li>Once the item is received and inspected, we will process the refund to the original payment method.</li>
      </ol>
      <h2>Refund timing</h2>
      <p>Approved refunds are usually processed within 5–10 business days. Your bank may take additional time to show the credit.</p>
    `,
  },
  "shipping-policy": {
    handle: "shipping-policy",
    title: "Shipping Policy",
    description:
      "Dispatch times, delivery estimates and duties for Youmi Beauty orders.",
    updated: "3 November 2026",
    content: `
      <p>All orders are packed and dispatched from Dubai, United Arab Emirates.</p>
      <h2>Dispatch</h2>
      <p>Orders placed before 2pm GST, Sunday to Thursday, are usually dispatched the same day. Orders placed later, or on Fridays and public holidays, are dispatched the next business day.</p>
      <h2>Delivery estimates</h2>
      <ul>
        <li><strong>United Arab Emirates:</strong> 1–3 working days.</li>
        <li><strong>GCC (Saudi Arabia, Kuwait, Qatar, Bahrain, Oman):</strong> 3–5 working days.</li>
        <li><strong>Rest of the world:</strong> 5–9 working days.</li>
      </ul>
      <p>These are estimates from the courier and can be affected by customs, public holidays or remote destinations.</p>
      <h2>Shipping cost</h2>
      <p>Shipping is complimentary on orders over Dhs. 300. Below that, a flat Dhs. 25 applies. Any duties or taxes charged on delivery outside the UAE are the responsibility of the recipient.</p>
      <h2>Tracking</h2>
      <p>You will receive a tracking link by email once your parcel leaves our studio. If you do not see it, check your spam folder or message us on WhatsApp with your order number.</p>
      <h2>Address changes</h2>
      <p>Contact us as soon as possible if you need to change a delivery address. Once a parcel is with the courier, changes may not be possible.</p>
    `,
  },
};

export function getContentPage(handle: string): StaticPage | undefined {
  return contentPages[handle];
}

export function getPolicyPage(handle: string): StaticPage | undefined {
  return policyPages[handle];
}
