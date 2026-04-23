import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { ArrowRight, Zap, Layers, Globe, Palette, Sparkles, ChevronRight, Play, Star, Users, Layout } from "lucide-react";

const ARTIST_TYPES = ["music artists", "digital artists", "photographers", "designers", "influencers", "creators"];

function Typewriter({ words }) {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[idx];
    let timeout;
    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIdx((i) => (i + 1) % words.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, idx, words]);
  return (
    <span style={{ color: "var(--accent)" }}>
      {displayed}
      <span className="animate-blink" style={{ borderRight: "2px solid var(--accent)", marginLeft: 1 }}></span>
    </span>
  );
}

function NavBar({ user }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 clamp(16px, 4vw, 48px)",
      background: "rgba(12,12,13,0.85)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--line)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 10px var(--accent)" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, letterSpacing: "0.14em", fontSize: 14, color: "var(--text)" }}>STAKKED</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-mute)" }}>
        <Link to="/gallery" style={{ transition: "color 0.15s" }} onMouseEnter={e => e.target.style.color = "var(--text)"} onMouseLeave={e => e.target.style.color = "var(--text-mute)"}>gallery</Link>
        {user ? (
          <>
            <Link to="/workspace" style={{ transition: "color 0.15s" }} onMouseEnter={e => e.target.style.color = "var(--text)"} onMouseLeave={e => e.target.style.color = "var(--text-mute)"}>workspace</Link>
            <button
              data-testid="landing-logout-btn"
              onClick={logout}
              style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-mute)" }}
            >logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ transition: "color 0.15s" }} onMouseEnter={e => e.target.style.color = "var(--text)"} onMouseLeave={e => e.target.style.color = "var(--text-mute)"}>sign in</Link>
            <button
              data-testid="landing-start-free-btn"
              onClick={() => navigate("/register")}
              style={{
                padding: "7px 14px", borderRadius: "var(--r-sm)",
                background: "var(--accent)", color: "var(--accent-ink)",
                fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 12,
                transition: "filter 0.15s"
              }}
              onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
              onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
            >START FREE ↗</button>
          </>
        )}
      </div>
    </nav>
  );
}

function HeroSlab({ delay, rot, tx, ty, tz, children, accent }) {
  return (
    <div style={{
      position: "absolute",
      background: accent
        ? `linear-gradient(135deg, color-mix(in oklab, var(--accent) 30%, var(--surface)), var(--surface-2))`
        : "linear-gradient(135deg, var(--surface), var(--surface-2))",
      border: `1px solid ${accent ? "var(--accent)" : "var(--line)"}`,
      borderRadius: 12,
      padding: "20px 24px",
      backdropFilter: "blur(8px)",
      boxShadow: accent
        ? "0 20px 60px -20px rgba(0,0,0,0.5), 0 0 0 1px var(--accent) inset"
        : "0 20px 60px -20px rgba(0,0,0,0.5)",
      transform: `rotate(${rot}deg) translate(${tx}px, ${ty}px) translateZ(${tz}px)`,
      animation: `slab-enter 1.2s cubic-bezier(0.16,1,0.3,1) ${delay}s both`,
    }}>
      {children}
    </div>
  );
}

const FEATURES = [
  { icon: <Layers size={18} />, title: "Drag & Drop Editor", desc: "Pixel-perfect canvas with nodes, handles, guides and real-time snap." },
  { icon: <Palette size={18} />, title: "5 Dynamic Themes", desc: "Ghost · Neon · Brutal · Paper · Sunset — each with dark & light variants." },
  { icon: <Sparkles size={18} />, title: "AI-Powered Layout", desc: "Describe your page in plain English and watch it build itself live." },
  { icon: <Globe size={18} />, title: "Instant Publish", desc: "One click to publish your page with a custom URL. No code needed." },
  { icon: <Layout size={18} />, title: "Responsive Breakpoints", desc: "Design for desktop, tablet, and mobile in one canvas." },
  { icon: <Zap size={18} />, title: "Offline + Cached", desc: "IndexedDB caching means your work is never lost — even offline." },
];

const SHOWCASE = [
  { type: "music",     title: "neon-arcade",     theme: "neon",   author: "DJ Fade",   color: "#ff2e9a" },
  { type: "portfolio", title: "brutalist-folio",  theme: "brutal", author: "K.Visual",  color: "#ffee00" },
  { type: "gallery",   title: "paper-gallery",    theme: "paper",  author: "Muse",      color: "#d4a574" },
  { type: "bio",       title: "sunset-links",     theme: "sunset", author: "@creator",  color: "#ff8e53" },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", overflowX: "hidden" }}>
      <div className="scanline-overlay" />
      <NavBar user={user} />

      {/* ── Hero ── */}
      <section ref={heroRef} style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        padding: "80px clamp(16px,5vw,80px) 60px",
        position: "relative", overflow: "hidden"
      }}>
        {/* Background grid */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.12,
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)"
        }} />
        {/* Accent glow */}
        <div style={{
          position: "absolute", top: "20%", left: "60%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, color-mix(in oklab, var(--accent) 20%, transparent) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, width: "100%", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          {/* Left: text */}
          <div>
            <div className="stagger animate-fadeInUp" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em",
              color: "var(--text-mute)", textTransform: "uppercase",
              padding: "4px 10px", border: "1px solid var(--line)", borderRadius: 999,
              marginBottom: 24
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }} />
              FOR · MUSIC · PHOTO · DESIGN · CREATORS
            </div>

            <h1 className="stagger animate-fadeInUp delay-100" style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: "clamp(42px, 6vw, 72px)",
              lineHeight: 0.95, letterSpacing: "-0.03em",
              marginBottom: 20
            }}>
              Build pages for{" "}
              <Typewriter words={ARTIST_TYPES} />
            </h1>

            <p className="stagger animate-fadeInUp delay-200" style={{
              fontSize: 18, color: "var(--text-mute)", maxWidth: 520, lineHeight: 1.55, marginBottom: 36
            }}>
              Stakked is a drag-and-drop creative OS for artists. Not a generic site builder.
              Your music, art, brand — one stunning page, zero code.
            </p>

            <div className="stagger animate-fadeInUp delay-300" style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                data-testid="hero-start-free-btn"
                onClick={() => navigate(user ? "/workspace" : "/register")}
                style={{
                  padding: "12px 24px", borderRadius: "var(--r-sm)",
                  background: "var(--accent)", color: "var(--accent-ink)",
                  fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13,
                  display: "flex", alignItems: "center", gap: 8,
                  transition: "filter 0.15s, transform 0.15s"
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.12)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {user ? "OPEN WORKSPACE" : "START FREE"} <ArrowRight size={14} />
              </button>
              <Link to="/gallery" style={{
                padding: "12px 24px", borderRadius: "var(--r-sm)",
                border: "1px solid var(--line)", color: "var(--text-mute)",
                fontFamily: "var(--font-mono)", fontSize: 12,
                display: "flex", alignItems: "center", gap: 8,
                transition: "border-color 0.15s, color 0.15s"
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text-mute)"; e.currentTarget.style.color = "var(--text)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text-mute)"; }}
              >
                <Play size={12} /> SEE GALLERY
              </Link>
            </div>

            <div className="stagger animate-fadeInUp delay-400" style={{ marginTop: 48, display: "flex", gap: 32 }}>
              {[["500+", "creators"], ["12K+", "pages built"], ["5", "themes"]].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--text)" }}>{n}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.1em" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: 3D slab art */}
          <div style={{ position: "relative", height: 480 }} className="stagger animate-fadeIn delay-200">
            <div className="hero-slab-wrap" style={{ position: "relative", width: "100%", height: "100%" }}>
              <HeroSlab delay={0.2} rot={-4} tx={-10} ty={30} tz={-20} accent>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", letterSpacing: "0.12em", marginBottom: 10 }}>// NEON-ARCADE · MUSIC PAGE</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>New Album Out Now</div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  {["SP","IG","TT","YT"].map(p => (
                    <div key={p} style={{ width: 32, height: 32, borderRadius: 6, background: "var(--surface-2)", border: "1px solid var(--line-2)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-mute)" }}>{p}</div>
                  ))}
                </div>
              </HeroSlab>
              <HeroSlab delay={0.4} rot={3} tx={60} ty={120} tz={-10}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 10 }}>// PORTFOLIO · VISUAL ARTIST</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {["#ff2e9a","#ffee00","#d4a574","#ff8e53"].map(c => (
                    <div key={c} style={{ height: 50, borderRadius: 6, background: c, opacity: 0.8 }} />
                  ))}
                </div>
              </HeroSlab>
              <HeroSlab delay={0.6} rot={1} tx={20} ty={240} tz={0}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--accent)", display: "grid", placeItems: "center" }}>
                    <Sparkles size={16} style={{ color: "var(--accent-ink)" }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-mute)" }}>AI is generating…</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ok)", marginTop: 4 }}>✓ hero section placed</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ok)" }}>✓ music player added</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)" }}>▸ social links…</div>
                  </div>
                </div>
              </HeroSlab>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "80px clamp(16px,5vw,80px)", borderTop: "1px solid var(--line)", position: "relative" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.14em", marginBottom: 12 }}>02 / FEATURES</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(28px,4vw,44px)", letterSpacing: "-0.02em" }}>
              Everything a creator needs.
              <br /><span style={{ color: "var(--accent)" }}>Nothing they don't.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title}
                data-testid={`feature-card-${i}`}
                style={{
                  padding: "28px 24px",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r-md)",
                  background: "var(--surface)",
                  margin: 4,
                  transition: "border-color 0.2s, transform 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ color: "var(--accent)", marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 15 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: "var(--text-mute)", lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery Preview ── */}
      <section style={{ padding: "80px clamp(16px,5vw,80px)", background: "var(--bg-2)", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 40 }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.14em", marginBottom: 8 }}>03 / SHOWCASE</div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, letterSpacing: "-0.02em" }}>Pages made with Stakked</h2>
            </div>
            <Link to="/gallery" style={{
              fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-mute)",
              display: "flex", alignItems: "center", gap: 4,
              padding: "8px 14px", border: "1px solid var(--line)", borderRadius: "var(--r-sm)",
              transition: "color 0.15s, border-color 0.15s"
            }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--text-mute)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-mute)"; e.currentTarget.style.borderColor = "var(--line)"; }}
            >
              VIEW ALL <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {SHOWCASE.map((item, i) => (
              <div key={item.title}
                data-testid={`showcase-card-${i}`}
                style={{
                  border: "1px solid var(--line)", borderRadius: "var(--r-lg)", overflow: "hidden",
                  background: "var(--surface)", cursor: "pointer",
                  transition: "border-color 0.2s, transform 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{
                  height: 140,
                  background: `linear-gradient(135deg, color-mix(in oklab, ${item.color} 30%, var(--bg)) 0%, var(--surface-2) 100%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", overflow: "hidden"
                }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: item.color, textAlign: "center", padding: "0 16px", letterSpacing: "-0.02em" }}>
                    {item.title}
                  </div>
                </div>
                <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{item.title}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>{item.author} · {item.type}</div>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: item.color, padding: "2px 6px", border: `1px solid ${item.color}`, borderRadius: 4 }}>{item.theme}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "100px clamp(16px,5vw,80px)", borderTop: "1px solid var(--line)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, color-mix(in oklab, var(--accent) 15%, transparent) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.14em", marginBottom: 16 }}>04 / GET STARTED</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(32px,5vw,60px)", letterSpacing: "-0.03em", marginBottom: 20, lineHeight: 1 }}>
            Stack your <span style={{ color: "var(--accent)" }}>everything</span>.<br />Ship a page today.
          </h2>
          <p style={{ fontSize: 18, color: "var(--text-mute)", marginBottom: 36, maxWidth: 500, margin: "0 auto 36px" }}>
            Join hundreds of creators building stunning pages on Stakked.
          </p>
          <button
            data-testid="cta-start-free-btn"
            onClick={() => navigate(user ? "/workspace" : "/register")}
            style={{
              padding: "14px 32px", borderRadius: "var(--r-sm)",
              background: "var(--accent)", color: "var(--accent-ink)",
              fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14,
              display: "inline-flex", alignItems: "center", gap: 10,
              transition: "filter 0.15s, transform 0.15s"
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {user ? "OPEN WORKSPACE" : "CREATE FREE ACCOUNT"} <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        height: 56, borderTop: "1px solid var(--line)", background: "var(--bg-2)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(16px,4vw,48px)",
        fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)"
      }}>
        <span>STAKKED · v1.0 · 2026</span>
        <span>FOR CREATORS · BY CREATORS</span>
      </footer>
    </div>
  );
}
