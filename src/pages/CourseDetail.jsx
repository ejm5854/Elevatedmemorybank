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
          <button className="btn-primary" style={{ marginTop: 24, display: "inline-flex" }} onClick={() => navigate("/courses")}>
            Browse All Courses
          </button>
        </div>
      </div>
    );
  }

  const tee = course.tees[selectedTee];
  const typeClass = course.type === "Public" ? "badge-public" : course.type === "Private" ? "badge-private" : "badge-semi";

  // Split holes into front/back 9
  const front9 = course.holes_data.slice(0, 9);
  const back9 = course.holes_data.slice(9);
  const teeKey = tee.name.toLowerCase().replace(" ", "");

  function getTeeYards(hole, key) {
    // Try exact key, then fallback keys
    const keys = [key, "blue", "white", "championship", "red"];
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
          </div>
          <h1 className="detail-title">{course.name}</h1>
          <div className="detail-location">
            📍 {course.address}
          </div>
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
              <div className="overview-key">Course Rating</div>
            </div>
            <div className="overview-card">
              <div className="overview-val">{tee.slope}</div>
              <div className="overview-key">Slope Rating</div>
            </div>
            <div className="overview-card">
              <div className="overview-val">{course.established}</div>
              <div className="overview-key">Established</div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="detail-body">
        {/* Main column */}
        <div className="detail-main">

          {/* Description */}
          <div className="card">
            <div className="card-header">About This Course</div>
            <div className="card-body">
              <p className="description-text">{course.description}</p>
            </div>
          </div>

          {/* Scorecard */}
          <div className="card">
            <div className="card-header">Scorecard</div>
            <div className="card-body">
              {/* Tee selector */}
              <div className="tee-selector">
                {course.tees.map((t, i) => (
                  <button
                    key={t.name}
                    className={`tee-btn ${selectedTee === i ? "active" : ""}`}
                    onClick={() => setSelectedTee(i)}
                  >
                    <span className="tee-dot" style={{ background: t.color }} />
                    {t.name} Tees — {t.yards.toLocaleString()} yds
                  </button>
                ))}
              </div>

              {/* Front 9 */}
              {front9.length > 0 && (
                <div style={{ marginBottom: 16, overflowX: "auto" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gray-400)", marginBottom: 8 }}>Front Nine</div>
                  <table className="scorecard-table">
                    <thead>
                      <tr>
                        <th>Hole</th>
                        {front9.map((h) => <th key={h.hole}>{h.hole}</th>)}
                        <th>OUT</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Par</td>
                        {front9.map((h) => (
                          <td key={h.hole} className={h.par === 3 ? "par-3" : h.par === 5 ? "par-5" : ""}>{h.par}</td>
                        ))}
                        <td>{sumPar(front9)}</td>
                      </tr>
                      <tr>
                        <td>Yards</td>
                        {front9.map((h) => (
                          <td key={h.hole}>{getTeeYards(h, teeKey)}</td>
                        ))}
                        <td>{sumYards(front9).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Back 9 */}
              {back9.length > 0 && (
                <div style={{ overflowX: "auto" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gray-400)", marginBottom: 8 }}>Back Nine</div>
                  <table className="scorecard-table">
                    <thead>
                      <tr>
                        <th>Hole</th>
                        {back9.map((h) => <th key={h.hole}>{h.hole}</th>)}
                        <th>IN</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Par</td>
                        {back9.map((h) => (
                          <td key={h.hole} className={h.par === 3 ? "par-3" : h.par === 5 ? "par-5" : ""}>{h.par}</td>
                        ))}
                        <td>{sumPar(back9)}</td>
                      </tr>
                      <tr>
                        <td>Yards</td>
                        {back9.map((h) => (
                          <td key={h.hole}>{getTeeYards(h, teeKey)}</td>
                        ))}
                        <td>{sumYards(back9).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totals row */}
              <div style={{
                display: "flex",
                gap: 12,
                marginTop: 16,
                padding: "14px 16px",
                background: "var(--green-50)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--green-100)"
              }}>
                {[
                  { label: "Total Par", val: course.par },
                  { label: "Total Yards", val: tee.yards.toLocaleString() },
                  { label: "Course Rating", val: tee.rating },
                  { label: "Slope", val: tee.slope },
                ].map((item) => (
                  <div key={item.label} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--green-800)" }}>{item.val}</div>
                    <div style={{ fontSize: "0.68rem", color: "var(--green-600)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginTop: 3 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tee Ratings Comparison */}
          <div className="card">
            <div className="card-header">Tee Ratings Comparison</div>
            <div className="card-body">
              <div className="ratings-grid">
                {course.tees.map((t) => (
                  <div className="rating-row" key={t.name}>
                    <div className="rating-tee-label">
                      <span className="tee-dot" style={{ background: t.color, width: 12, height: 12 }} />
                      {t.name}
                    </div>
                    <div className="rating-bar-wrap">
                      <div className="rating-bar-track">
                        <div
                          className="rating-bar-fill"
                          style={{
                            width: `${(t.slope / maxSlope) * 100}%`,
                            background: t.color === "#9ca3af" ? "var(--gray-400)" : t.color === "#dc2626" ? "#dc2626" : "var(--green-500)"
                          }}
                        />
                      </div>
                      <div className="rating-vals">
                        <span>{t.yards.toLocaleString()} yds</span>
                        <span style={{ color: "var(--gray-300)" }}>·</span>
                        Rating <span>{t.rating}</span>
                        <span style={{ color: "var(--gray-300)" }}>·</span>
                        Slope <span>{t.slope}</span>
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
          {/* Start Round */}
          <div className="start-round-card">
            <h3>Ready to Play?</h3>
            <p>Start a live round at {course.name} and invite your crew.</p>
            <button className="btn-gold" onClick={() => navigate("/new-round")}>
              ⛳ Start a Round Here
            </button>
          </div>

          {/* Course Info */}
          <div className="card">
            <div className="card-header">Course Info</div>
            <div className="card-body">
              {course.phone && (
                <div className="info-row">
                  <div className="info-icon">📞</div>
                  <div>
                    <div className="info-label">Phone</div>
                    <div className="info-val">{course.phone}</div>
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
              <div className="info-row">
                <div className="info-icon">🏛️</div>
                <div>
                  <div className="info-label">Established</div>
                  <div className="info-val">{course.established}</div>
                </div>
              </div>
              <div className="info-row">
                <div className="info-icon">🔓</div>
                <div>
                  <div className="info-label">Access</div>
                  <div className="info-val">{course.type}</div>
                </div>
              </div>
              <div className="info-row">
                <div className="info-icon">⛳</div>
                <div>
                  <div className="info-label">Holes</div>
                  <div className="info-val">{course.holes} holes · Par {course.par}</div>
                </div>
              </div>
              {course.website && (
                <div className="info-row">
                  <div className="info-icon">🌐</div>
                  <div>
                    <div className="info-label">Website</div>
                    <div className="info-val">
                      <a href={`https://${course.website}`} target="_blank" rel="noreferrer"
                        style={{ color: "var(--green-600)", textDecoration: "underline" }}>
                        {course.website}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Other courses in region */}
          <div className="card">
            <div className="card-header">More in {course.city}</div>
            <div className="card-body" style={{ padding: "8px 24px 16px" }}>
              {courses
                .filter((c) => c.region === course.region && c.id !== course.id)
                .slice(0, 4)
                .map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/courses/${c.id}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px solid var(--gray-100)",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.87rem", color: "var(--gray-900)" }}>{c.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: 2 }}>{c.type} · Par {c.par}</div>
                    </div>
                    <span style={{ color: "var(--green-600)", fontSize: "0.85rem" }}>→</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
