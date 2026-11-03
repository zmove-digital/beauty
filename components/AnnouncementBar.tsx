import { announcementMessages } from "@/lib/catalog";

export function AnnouncementBar() {
  return (
    <div className="announcement-bar" role="region" aria-label="Store announcements">
      <div className="announcement-track">
        {[0, 1, 2].map((group) => (
          <div className="announcement-group" key={group} aria-hidden={group > 0}>
            {announcementMessages.map((message) => (
              <span className="announcement-item" key={message}>
                {message}
                <span className="announcement-dot" aria-hidden>
                  ✦
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
