"use client";

import { useState } from "react";

export type AccordionSection = {
  title: string;
  content: string;
};

export function ProductAccordion({ sections }: { sections: AccordionSection[] }) {
  const [active, setActive] = useState<number | null>(0);

  if (!sections.length) return null;

  return (
    <div className="product-accordions">
      {sections.map((section, index) => {
        const isActive = active === index;
        return (
          <div className={`accordion-item ${isActive ? "active" : ""}`} key={`${section.title}-${index}`}>
            <button
              type="button"
              className="accordion-trigger"
              onClick={() => setActive(isActive ? null : index)}
              aria-expanded={isActive}
            >
              <span>{section.title}</span>
              <span className="toggle-icon" aria-hidden />
            </button>
            <div className="accordion-content" role="region">
              <div className="rte" dangerouslySetInnerHTML={{ __html: section.content }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
