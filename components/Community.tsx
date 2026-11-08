import { communityVideos } from "@/lib/catalog";

export function Community() {
  return (
    <section className="community-section">
      <div className="community-container">
        <h2 className="community-heading">The Community</h2>
        <div className="community-grid">
          {communityVideos.map((video, index) => (
            <div className="community-card" key={video.src}>
              <div className="community-media">
                <video
                  playsInline
                  autoPlay
                  loop
                  muted
                  preload="metadata"
                  poster={video.poster}
                  aria-label={`Roman Beauty community video ${index + 1}`}
                >
                  <source src={video.src} type="video/mp4" />
                  <img src={video.poster} alt="" loading="lazy" />
                </video>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
