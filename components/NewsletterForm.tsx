"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Something went wrong.");
      setStatus("success");
      setMessage(payload.message ?? "Thank you — you're on the list.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage((error as Error).message);
    }
  }

  return (
    <form className="footer__form" onSubmit={onSubmit}>
      <label className="visually-hidden" htmlFor="footer-email">
        Email address
      </label>
      <input
        id="footer-email"
        type="email"
        name="email"
        placeholder="Email address"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <div className="newsletter__text">
        <p>
          By registering, I agree to receive emails from Youmi and selected partners. Read our
          Privacy Policy for details.
        </p>
      </div>
      <label className="newsletter__checkbox" htmlFor="footer-consent">
        <input
          id="footer-consent"
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
        />
        <span>Yes YOUMI! Send me your newsletters.</span>
      </label>
      <button type="submit" className="btn btn--primary newsletter__submit" disabled={status === "loading"}>
        {status === "loading" ? "Subscribing…" : "Subscribe"}
      </button>
      {message && (
        <p className={`newsletter__message ${status === "error" ? "is-error" : ""}`} role="status">
          {message}
        </p>
      )}
    </form>
  );
}
