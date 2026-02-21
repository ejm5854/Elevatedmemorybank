import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { courses } from "../courses.js";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = courses.find((c) => c.id === id);
  const [selectedTee, setSelectedTee] = useState(0);

  if (!course) {
    return (
      <div className="page">
        <div className="empty-state" style={{ paddingTop: 120 }}>
          <div className="empty-icon">⛳</div>
          <h3>Course not found</h3>
          <p>That course doesn't exist in our directory.</p>
          <button
            className="btn-primary"
            style={{ marginTop: 24, display: "inline-flex" }}
            onClick={() => navigate("/courses")}
          >
            Browse All Courses
          </button>
        </div>
      </div>
    );
  }

  const tee = course.tees[selectedTee];
  const typeClass =
    course.type === "Public"
      ? "badge-public"
      : course.type === "Private"
      ? "badge-private"
      : "badge-semi";

  const front9 = course.holes_data.slice(0, 9);
  const back9  = course.holes_data.slice(9);
  const teeKey = tee.name.toLowerCase().replace(/\s+/g, "");

  function getTeeYards(hole, key) {
    const keys = [key, "blue", "white", "championship", "black", "silver", "red"];
    for (const k of keys) {
      if (hole[k] !== undefined) return hole[k];
    }
    return "-";
  }
  function sumYards(holes) {
    return holes.reduce((acc, h) => acc + (getTeeYards(h, teeKey) || 0), 0);
  }
  function sumPar(holes) {
    return holes.reduce((acc, h) => acc + h.par, 0);
  }

  const maxSlope = Math.max(...course.tees.map((t) => t.slope));

  // Google Maps embed URL from address
  const mapQuery = encodeURIComponent(course.address);
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY&q=${mapQuery}&zoom=15`;
  // Fallback: open street map iframe (no API key needed)
  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=-0.1&layer=mapnik&marker=0,0&query=${mapQuery}`;

  return (
    <div className="detail-page">
      {/* Hero */}
      <div className="detail-hero">
        <div className="detail-hero-inner">
          <button className="back-btn" onClick={() => navigate("/courses")}>
            ← Back to Courses
          </button>
          <div className="detail-meta">
            <span className={`badge ${typeClass}`}>{course.type}</span>
            <span className="badge badge-holes">{course.holes} Holes</span>
            <span className="badge badge-holes">Par {course.par}</span>
            {course.established && (
              <span className="badge badge-holes">Est. {course.established}</span>
            )}
          </div>
          <h1 className="detail-title">{course.name}</h1>
          <div className="detail-location">📍 {course.address}</div>
          <div className="detail-overview">
            <div className="overview-card">
              <div className="overview-val">{course.par}</div>
              <div className="overview-key">Par</div>
            </div>
            <div className="overview-card">
              <div className="overview-val">{tee.yards.toLocaleString()}</div>
              <div className="overview-key">{tee.name} Yards</div>
            </div>
            <div className="overview-card">
              <div className="overview-val">{tee.rating}</div>
              <div className="overview-key">Rating</div>
            </div>
            <div className="overview-card">
              <div className="overview-val">{tee.slope}</div>
              <div className="overview-key">Slope</div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="detail-body">
        {/* Main column */}
        <div className="detail-main">

          {/* Course Map */}
          <div className="card">
            <div className="card-header">Course Map</div>
            <div style={{ padding: "16px 24px 24px" }}>
              <div className="map-embed">
                <iframe
                  title={`${course.name} map`}
                  src={`https://maps.google.com/maps?q=${mapQuery}&output=embed&z=15`}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: "0.8rem", fontWeight: 600, color: "var(--green-700)",
                    textDecoration: "none",
                  }}
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </div>

          {/* Tee selector + Scorecard */}
          <div className="card">
            <div className="card-header">Scorecard</div>
            <div className="card-body">
              <div className="tee-selector">
                {course.tees.map((t, i) => (
                  <button
                    key={t.name}
                    className={`tee-btn ${selectedTee === i ? "active" : ""}`}
                    onClick={() => setSelectedTee(i)}
                  >
                    <span
                      className="tee-dot"
                      style={{ backgroundColor: t.color }}
                    />
                    {t.name}
                  </button>
                ))}
              </div>

              {/* Front 9 */}
              <div style={{ overflowX: "auto", marginBottom: 12 }}>
                <table className="scorecard-table">
                  <thead>
                    <tr>
                      <th>Hole</th>
                      {front9.map((h) => (
                        <th key={h.hole}>{h.hole}</th>
                      ))}
                      <th>OUT</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Par</td>
                      {front9.map((h) => (
                        <td
                          key={h.hole}
                          className={
                            h.par === 3 ? "par-3" : h.par === 5 ? "par-5" : ""
                          }
                        >
                          {h.par}
                        </td>
                      ))}
                      <td>{sumPar(front9)}</td>
                    </tr>
                    <tr>
                      <td>{tee.name}</td>
                      {front9.map((h) => (
                        <td key={h.hole}>{getTeeYards(h, teeKey)}</td>
                      ))}
                      <td>{sumYards(front9)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Back 9 */}
              {back9.length > 0 && (
                <div style={{ overflowX: "auto" }}>
                  <table className="scorecard-table">
                    <thead>
                      <tr>
                        <th>Hole</th>
                        {back9.map((h) => (
                          <th key={h.hole}>{h.hole}</th>
                        ))}
                        <th>IN</th>
                        <th>TOT</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Par</td>
                        {back9.map((h) => (
                          <td
                            key={h.hole}
                            className={
                              h.par === 3 ? "par-3" : h.par === 5 ? "par-5" : ""
                            }
                          >
                            {h.par}
                          </td>
                        ))}
                        <td>{sumPar(back9)}</td>
                        <td>{sumPar(course.holes_data)}</td>
                      </tr>
                      <tr>
                        <td>{tee.name}</td>
                        {back9.map((h) => (
                          <td key={h.hole}>{getTeeYards(h, teeKey)}</td>
                        ))}
                        <td>{sumYards(back9)}</td>
                        <td>{sumYards(course.holes_data)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Tee ratings */}
          <div className="card">
            <div className="card-header">Tee Ratings</div>
            <div className="card-body">
              <div className="ratings-grid">
                {course.tees.map((t) => (
                  <div key={t.name} className="rating-row">
                    <div className="rating-tee-label">
                      <span className="tee-dot" style={{ backgroundColor: t.color }} />
                      {t.name}
                    </div>
                    <div className="rating-bar-wrap">
                      <div className="rating-bar-track">
                        <div
                          className="rating-bar-fill"
                          style={{
                            width: `${(t.slope / maxSlope) * 100}%`,
                            backgroundColor: t.color === "#9ca3af" ? "var(--gray-400)" : t.color,
                          }}
                        />
                      </div>
                      <div className="rating-vals">
                        Rating <span>{t.rating}</span> &nbsp;·&nbsp; Slope <span>{t.slope}</span> &nbsp;·&nbsp; <span>{t.yards.toLocaleString()} yds</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="detail-sidebar">
          {/* Start round CTA */}
          <div className="start-round-card">
            <h3>Ready to Play?</h3>
            <p>Start a round at {course.name} and track every stroke live.</p>
            <button
              className="btn-gold"
              onClick={() => navigate("/new-round")}
            >
              ⛳ Start a Round Here
            </button>
          </div>

          {/* Course info */}
          <div className="card">
            <div className="card-header">Course Info</div>
            <div className="card-body">
              {course.phone && (
                <div className="info-row">
                  <div className="info-icon">📞</div>
                  <div>
                    <div className="info-label">Phone</div>
                    <div className="info-val">
                      <a href={`tel:${course.phone}`} style={{ color: "var(--green-700)" }}>
                        {course.phone}
                      </a>
                    </div>
                  </div>
                </div>
              )}
              {course.website && (
                <div className="info-row">
                  <div className="info-icon">🌐</div>
                  <div>
                    <div className="info-label">Website</div>
                    <div className="info-val">
                      <a
                        href={`https://${course.website}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "var(--green-700)" }}
                      >
                        {course.website}
                      </a>
                    </div>
                  </div>
                </div>
              )}
              <div className="info-row">
                <div className="info-icon">📍</div>
                <div>
                  <div className="info-label">Address</div>
                  <div className="info-val">{course.address}</div>
                </div>
              </div>
              {course.established && (
                <div className="info-row">
                  <div className="info-icon">📅</div>
                  <div>
                    <div className="info-label">Established</div>
                    <div className="info-val">{course.established}</div>
                  </div>
                </div>
              )}
              <div className="info-row">
                <div className="info-icon">🏌️</div>
                <div>
                  <div className="info-label">Access</div>
                  <div className="info-val">{course.type}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {course.description && (
            <div className="card">
              <div className="card-header">About</div>
              <div className="card-body">
                <p className="description-text">{course.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
