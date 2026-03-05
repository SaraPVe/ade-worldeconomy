import { useState, useCallback } from "react";

// ─── DATA ───────────────────────────────────────────────────────────────────
const GROUPS = {
  1: {
    members: [
      "González Alfageme, Alejandro",
      "Gutiérrez O'Callaghan, Enrique",
      "Sierra Santos, Valeria",
    ],
    countries: {
      european: { name: "Germany", flag: "🇩🇪", role: "European Country" },
      wealthy: { name: "Mexico", flag: "🇲🇽", role: "Wealthy Non-European" },
      lower: { name: "India", flag: "🇮🇳", role: "Lower-Middle Income" },
    },
    trap: false,
    trapType: null,
  },
  2: {
    members: ["De Fuentes Alonso, Álvaro", "Powys Rojo, Nicolás"],
    countries: {
      european: { name: "Spain", flag: "🇪🇸", role: "European Country" },
      wealthy: {
        name: "Switzerland",
        flag: "🇨🇭",
        role: "Wealthy Non-European",
      },
      lower: { name: "Yemen", flag: "🇾🇪", role: "Lower-Middle Income" },
    },
    trap: true,
    trapType: "tax",
    trapCountry: "Switzerland",
  },
  3: {
    members: ["Vicente Muñoz, Lucía", "Martín Marcos, Helena"],
    countries: {
      european: { name: "Italy", flag: "🇮🇹", role: "European Country" },
      wealthy: { name: "Singapore", flag: "🇸🇬", role: "Wealthy Non-European" },
      lower: { name: "Honduras", flag: "🇭🇳", role: "Lower-Middle Income" },
    },
    trap: false,
    trapType: null,
  },
  4: {
    members: ["Ferjani, Nour", "Marso, Adam"],
    countries: {
      european: { name: "France", flag: "🇫🇷", role: "European Country" },
      wealthy: { name: "UAE", flag: "🇦🇪", role: "Wealthy Non-European" },
      lower: { name: "Nigeria", flag: "🇳🇬", role: "Lower-Middle Income" },
    },
    trap: false,
    trapType: null,
  },
  5: {
    members: ["De Frutos Laso, Lucía", "Diez Lopez-Nava, Carlota"],
    countries: {
      european: { name: "Greece", flag: "🇬🇷", role: "European Country" },
      wealthy: {
        name: "United Kingdom",
        flag: "🇬🇧",
        role: "Wealthy Non-European",
      },
      lower: { name: "Pakistan", flag: "🇵🇰", role: "Lower-Middle Income" },
    },
    trap: true,
    trapType: "labour",
    trapCountry: "United Kingdom",
  },
  6: {
    members: ["Conejero González, Mario", "Gloria Cecilia"],
    countries: {
      european: { name: "Poland", flag: "🇵🇱", role: "European Country" },
      wealthy: { name: "Canada", flag: "🇨🇦", role: "Wealthy Non-European" },
      lower: { name: "El Salvador", flag: "🇸🇻", role: "Lower-Middle Income" },
    },
    trap: false,
    trapType: null,
  },
  7: {
    members: [
      "Cárdenas Cabrera, Roxana",
      "Hidalgo Cristóbal, Daira",
      "Torres Andrade, Evelin Yadira",
    ],
    countries: {
      european: { name: "Belgium", flag: "🇧🇪", role: "European Country" },
      wealthy: { name: "Brazil", flag: "🇧🇷", role: "Wealthy Non-European" },
      lower: { name: "Ivory Coast", flag: "🇨🇮", role: "Lower-Middle Income" },
    },
    trap: false,
    trapType: null,
  },
  8: {
    members: ["Nurbaev, Jaisan", "Goble, Tasha", "Silveira Moura, Matheus"],
    countries: {
      european: { name: "Netherlands", flag: "🇳🇱", role: "European Country" },
      wealthy: { name: "Australia", flag: "🇦🇺", role: "Wealthy Non-European" },
      lower: { name: "Bangladesh", flag: "🇧🇩", role: "Lower-Middle Income" },
    },
    trap: true,
    trapType: "tax",
    trapCountry: "Netherlands",
  },
  9: {
    members: ["Almasbekova Dilnaz", "Sagynaeva Begimai"],
    countries: {
      european: { name: "Portugal", flag: "🇵🇹", role: "European Country" },
      wealthy: {
        name: "South Korea",
        flag: "🇰🇷",
        role: "Wealthy Non-European",
      },
      lower: { name: "Vietnam", flag: "🇻🇳", role: "Lower-Middle Income" },
    },
    trap: false,
    trapType: null,
  },
};

const CONCESSION_OPTIONS = [
  { id: "A", label: "Lower corporate taxes", welfare: -1 },
  { id: "B", label: "Relax labour regulations", welfare: -2 },
  { id: "C", label: "Relax environmental standards", welfare: -2 },
  { id: "D", label: "No concessions", welfare: 0 },
];

// ─── STYLES (Obrador Aesthetic) ─────────────────────────────────────────────
const theme = {
  bg: "#F9F8F6",
  surface: "#FFFFFF",
  text: "#362C28",
  textMuted: "#8C837C",
  accent: "#D47B36",
  accentLight: "#FCF3EB",
  border: "#E8E3DD",
  error: "#C05A45",
  success: "#5A8065",
  fontMain: '"Inter", -apple-system, sans-serif',
  fontHeading: '"Playfair Display", "Georgia", serif',
};

// ─── RESET GLOBALES ─────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    html, body, #root {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      max-width: none !important;
      min-height: 100vh !important;
      overflow-x: hidden !important;
      background-color: ${theme.bg};
    }
    * {
      box-sizing: border-box !important;
    }
  `}</style>
);

// ─── STORAGE HELPERS ────────────────────────────────────────────────────────
const STORAGE_KEY = "worldchain_v5";
const loadState = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
};
const saveState = (s) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
};

const initState = () => ({
  decisions: Object.fromEntries(
    Object.keys(GROUPS).map((g) => [
      g,
      {
        s1: { strategies: {}, reasoning: "", attendance: [] },
        s2: { country: "", concession: "", reasoning: "", attendance: [] },
        s3: { used: null, reasoning: "", attendance: [] },
        s4: {
          domestic: "",
          ownWealthy: "",
          ownPoor: "",
          otherPoor: "",
          otherPoorTarget: "",
          reasoning: "",
          attendance: [],
        },
        p1: { agreements: [], product: "", notes: "", attendance: [] },
      },
    ])
  ),
  revealWelfare: false,
  globaltechWinner: "",
  trapResults: { 2: null, 5: null, 8: null },
  initialPoints: Object.fromEntries(Object.keys(GROUPS).map((g) => [g, 0])),
  agreementEvaluations: Object.fromEntries(
    Object.keys(GROUPS).map((g) => [g, ""])
  ),
});

// ─── SCORING ────────────────────────────────────────────────────────────────
const calcScores = (state) => {
  const scores = {};
  Object.keys(GROUPS).forEach((gk) => {
    const g = parseInt(gk);
    const grp = GROUPS[g];
    const dec = state.decisions[g];
    let gdp = 0,
      welfare = 10;

    // 1) Puntos iniciales gratuitos de la profesora
    gdp += parseFloat(state.initialPoints?.[g]) || 0;

    const dom = parseFloat(dec.s4.domestic) || 0;
    const ownW = parseFloat(dec.s4.ownWealthy) || 0;
    const ownP = parseFloat(dec.s4.ownPoor) || 0;
    const othP = parseFloat(dec.s4.otherPoor) || 0;
    gdp += dom * 1.0 + ownW * 1.3 + ownP * 1.6 + othP * 1.8;

    const conc = CONCESSION_OPTIONS.find((c) => c.id === dec.s2.concession);
    if (conc) welfare += conc.welfare;

    const tr = state.trapResults[g];
    if (tr === "caught") {
      if (grp.trapType === "tax") {
        gdp -= 2;
        welfare -= 3;
      }
      if (grp.trapType === "labour") {
        gdp -= 1;
        welfare -= 4;
      }
    } else if (tr === "free") {
      if (grp.trapType === "tax") gdp += 3;
      if (grp.trapType === "labour") gdp += 2;
    }

    // 5) Valoración manual de la profesora en lugar de puntos automáticos
    const evaluation = state.agreementEvaluations?.[g];
    if (evaluation === "genial") {
      gdp += 10;
      welfare += 5;
    } else if (evaluation === "bien") {
      gdp += 5;
      welfare += 2;
    } else if (evaluation === "regular") {
      gdp += 2;
      welfare += 0;
    } else if (evaluation === "mal") {
      gdp -= 2;
      welfare -= 2;
    }

    if (dec.s2.concession === "D") welfare += 2;

    scores[g] = {
      gdp: Math.round(gdp * 10) / 10,
      welfare: Math.max(0, Math.round(welfare * 10) / 10),
    };
  });
  return scores;
};

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

const Badge = ({ children, isAccent }) => (
  <span
    style={{
      background: isAccent ? theme.accentLight : theme.bg,
      color: isAccent ? theme.accent : theme.textMuted,
      border: `1px solid ${isAccent ? "#F0D6C1" : theme.border}`,
      fontSize: 12,
      fontWeight: 500,
      padding: "6px 16px",
      borderRadius: 4,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    }}
  >
    {children}
  </span>
);

const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      padding: "clamp(24px, 4vw, 40px)",
      ...style,
    }}
  >
    {children}
  </div>
);

const AttendanceCard = ({ grp, dec, session, update }) => {
  const labelStyle = {
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: theme.text,
    display: "block",
    marginBottom: 12,
    fontWeight: 500,
  };

  return (
    <Card style={{ marginTop: 24, background: theme.bg, border: "none" }}>
      <label style={labelStyle}>Attendance / Participation</label>
      <p style={{ fontSize: 15, color: theme.textMuted, marginBottom: 20 }}>
        Select the group members who actively participated in making this
        decision.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 16,
        }}
      >
        {grp.members.map((member) => {
          const isChecked = dec[session].attendance?.includes(member);
          return (
            <label
              key={member}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                fontSize: 16,
                color: theme.text,
                background: theme.surface,
                padding: "16px",
                borderRadius: 4,
                border: `1px solid ${theme.border}`,
              }}
            >
              <input
                type="checkbox"
                checked={!!isChecked}
                onChange={(e) => {
                  const current = dec[session].attendance || [];
                  const next = e.target.checked
                    ? [...current, member]
                    : current.filter((m) => m !== member);
                  update(session, "attendance", next);
                }}
                style={{
                  width: 20,
                  height: 20,
                  accentColor: theme.text,
                  cursor: "pointer",
                }}
              />
              {member}
            </label>
          );
        })}
      </div>
    </Card>
  );
};

// ─── LOGIN SCREEN ────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }) => {
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = () => {
    const trimmed = name.trim().toUpperCase();

    // Contraseñas cortas "PROFE" y "MAESE"
    if (btoa(trimmed) === "UFJPRkU=") {
      onLogin("professor", null);
      return;
    }
    if (btoa(trimmed) === "TUFFU0U=") {
      onLogin("maese", null);
      return;
    }

    for (const [gk, g] of Object.entries(GROUPS)) {
      for (const m of g.members) {
        if (m.toUpperCase().includes(trimmed) && trimmed.length > 2) {
          onLogin("student", parseInt(gk));
          return;
        }
      }
    }
    setErr("Surname not found. Please check your spelling.");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: theme.fontMain,
        color: theme.text,
        width: "100%",
      }}
    >
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 8,
          padding: "clamp(40px, 8vw, 80px)",
          maxWidth: 500,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: theme.textMuted,
            marginBottom: 24,
          }}
        >
          Global Economy
        </div>
        <h1
          style={{
            fontSize: "clamp(36px, 8vw, 48px)",
            color: theme.text,
            marginBottom: 16,
            fontFamily: theme.fontHeading,
            fontWeight: 400,
            fontStyle: "italic",
          }}
        >
          World Chain
        </h1>
        <p
          style={{
            color: theme.textMuted,
            fontSize: 16,
            marginBottom: 48,
            lineHeight: 1.6,
          }}
        >
          Enter your surname to access your workspace.
        </p>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErr("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="Your surname..."
          style={{
            width: "100%",
            padding: "16px 20px",
            border: `1px solid ${theme.border}`,
            borderRadius: 4,
            fontSize: 16,
            fontFamily: theme.fontMain,
            outline: "none",
            marginBottom: 16,
            background: theme.surface,
          }}
        />
        {err && (
          <p style={{ color: theme.error, fontSize: 14, marginBottom: 16 }}>
            {err}
          </p>
        )}
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            background: theme.text,
            color: theme.surface,
            border: "none",
            borderRadius: 4,
            padding: "18px 0",
            fontSize: 16,
            fontFamily: theme.fontMain,
            cursor: "pointer",
            fontWeight: 500,
            letterSpacing: 1,
          }}
        >
          Enter Workspace
        </button>
      </div>
    </div>
  );
};

// ─── STUDENT VIEW ────────────────────────────────────────────────────────────
const StudentView = ({ groupId, state, dispatch, onLogout }) => {
  const [tab, setTab] = useState("dossier");
  const grp = GROUPS[groupId];
  const dec = state.decisions[groupId];

  const update = (session, field, val) =>
    dispatch({ type: "UPDATE_DECISION", groupId, session, field, val });

  const tabs = [
    { id: "dossier", label: "Dossier" },
    { id: "s1", label: "Strategy" },
    { id: "s2", label: "Bid" },
    { id: "s3", label: "Event" },
    { id: "s4", label: "FDI Allocation" },
    { id: "p1", label: "Agreements" },
    { id: "scores", label: "Scores" },
  ];

  const scores = calcScores(state);
  const myScore = scores[groupId];

  const inputStyle = {
    width: "100%",
    padding: "16px",
    border: `1px solid ${theme.border}`,
    borderRadius: 4,
    fontSize: 16,
    fontFamily: theme.fontMain,
    background: theme.surface,
    color: theme.text,
    marginBottom: 8,
    outlineColor: theme.accent,
  };
  const labelStyle = {
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: theme.textMuted,
    display: "block",
    marginBottom: 12,
    fontWeight: 500,
  };
  const headingStyle = {
    color: theme.text,
    fontSize: "clamp(28px, 5vw, 40px)",
    fontFamily: theme.fontHeading,
    fontWeight: 400,
    fontStyle: "italic",
    marginBottom: 24,
  };
  const btnStyle = {
    background: theme.text,
    color: theme.surface,
    border: "none",
    borderRadius: 4,
    padding: "18px 40px",
    fontSize: 16,
    cursor: "pointer",
    fontWeight: 500,
    marginTop: 24,
    letterSpacing: 1,
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        fontFamily: theme.fontMain,
        color: theme.text,
        width: "100%",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: theme.surface,
          borderBottom: `1px solid ${theme.border}`,
          padding: "20px clamp(20px, 5vw, 60px)",
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: theme.textMuted,
              fontWeight: 500,
            }}
          >
            Group {groupId}
          </div>
          <div
            style={{
              fontSize: 24,
              marginTop: 6,
              fontFamily: theme.fontHeading,
              fontStyle: "italic",
            }}
          >
            {grp.countries.european.flag} {grp.countries.wealthy.flag}{" "}
            {grp.countries.lower.flag}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{ fontSize: 14, color: theme.textMuted, marginBottom: 8 }}
          >
            {grp.members[0]}
            {grp.members.length > 1
              ? ` & ${grp.members.length - 1} others`
              : ""}
          </div>
          <button
            onClick={onLogout}
            style={{
              background: "transparent",
              border: "none",
              textDecoration: "underline",
              color: theme.textMuted,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div
        style={{
          background: theme.surface,
          borderBottom: `1px solid ${theme.border}`,
          display: "flex",
          overflowX: "auto",
          padding: "0 clamp(10px, 4vw, 40px)",
          WebkitOverflowScrolling: "touch",
          width: "100%",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "20px 24px",
              border: "none",
              borderBottom:
                tab === t.id
                  ? `2px solid ${theme.text}`
                  : "2px solid transparent",
              background: "transparent",
              cursor: "pointer",
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: tab === t.id ? theme.text : theme.textMuted,
              fontWeight: tab === t.id ? 500 : 400,
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT AREA - 100% Fluid Width */}
      <div style={{ width: "100%", padding: "clamp(24px, 5vw, 60px)" }}>
        {/* DOSSIER */}
        {tab === "dossier" && (
          <div style={{ width: "100%" }}>
            <div style={{ marginBottom: 40 }}>
              <h2 style={headingStyle}>Country Dossier</h2>
              <p style={{ color: theme.textMuted, fontSize: 18 }}>
                Confidential profile. Do not share with other groups.
              </p>
            </div>

            <div style={gridStyle}>
              {Object.entries(grp.countries).map(([roleKey, c]) => (
                <Card key={roleKey}>
                  <div style={{ fontSize: 56, marginBottom: 20 }}>{c.flag}</div>
                  <div
                    style={{
                      fontSize: 32,
                      color: theme.text,
                      fontFamily: theme.fontHeading,
                      fontStyle: "italic",
                      marginBottom: 8,
                    }}
                  >
                    {c.name}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      color: theme.textMuted,
                      marginBottom: 24,
                    }}
                  >
                    {c.role}
                  </div>
                  <p
                    style={{ fontSize: 17, color: theme.text, lineHeight: 1.8 }}
                  >
                    {roleKey === "european" &&
                      "Your European base. Represents high standards, elevated operational costs, and strong institutional frameworks."}
                    {roleKey === "wealthy" &&
                      "Your wealthy non-European country. Offers strategic flexibility, different economic strengths, and an alternative development model."}
                    {roleKey === "lower" &&
                      "Your lower-middle income country. Abundant in resources and labour, but structurally constrained by historical capital flows."}
                  </p>
                </Card>
              ))}
            </div>

            {grp.trap && (
              <Card
                style={{
                  marginTop: 24,
                  border: `1px solid ${theme.accentLight}`,
                  background: theme.accentLight,
                }}
              >
                <div style={{ ...labelStyle, color: theme.accent }}>
                  Confidential Note
                </div>
                <p style={{ fontSize: 18, color: theme.text, lineHeight: 1.7 }}>
                  One of your countries will receive a Special Opportunity card
                  in Session 3. Be ready. Not every country plays by the same
                  rules.
                </p>
              </Card>
            )}
          </div>
        )}

        {/* S1: STRATEGY */}
        {tab === "s1" && (
          <div style={{ width: "100%" }}>
            <div style={{ marginBottom: 40 }}>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: theme.textMuted,
                  marginBottom: 8,
                }}
              >
                Session 1
              </div>
              <h2 style={headingStyle}>Production Strategy</h2>
              <p
                style={{
                  color: theme.textMuted,
                  fontSize: 18,
                  lineHeight: 1.6,
                }}
              >
                Assign a historical production strategy to each of your three
                countries.
              </p>
            </div>

            <div style={gridStyle}>
              {Object.entries(grp.countries).map(([roleKey, c]) => (
                <Card key={roleKey}>
                  <div
                    style={{
                      display: "flex",
                      gap: 20,
                      alignItems: "center",
                      marginBottom: 24,
                    }}
                  >
                    <span style={{ fontSize: 40 }}>{c.flag}</span>
                    <div>
                      <div
                        style={{
                          fontSize: 24,
                          fontFamily: theme.fontHeading,
                          fontStyle: "italic",
                        }}
                      >
                        {c.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: theme.textMuted,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        {c.role}
                      </div>
                    </div>
                  </div>
                  <select
                    value={dec.s1.strategies[roleKey] || ""}
                    onChange={(e) =>
                      update("s1", "strategies", {
                        ...dec.s1.strategies,
                        [roleKey]: e.target.value,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="">— Select a strategy —</option>
                    <option>Primary exporter</option>
                    <option>Primary ISI</option>
                    <option>Secondary ISI</option>
                    <option>Export orientation</option>
                  </select>
                </Card>
              ))}
            </div>

            <Card style={{ marginTop: 24 }}>
              <label style={labelStyle}>Reasoning</label>
              <textarea
                value={dec.s1.reasoning}
                onChange={(e) => update("s1", "reasoning", e.target.value)}
                placeholder="Why did you choose these strategies?"
                style={{ ...inputStyle, minHeight: 140, resize: "vertical" }}
              />
            </Card>

            <AttendanceCard grp={grp} dec={dec} session="s1" update={update} />

            <button onClick={() => dispatch({ type: "SAVE" })} style={btnStyle}>
              Save Details
            </button>
          </div>
        )}

        {/* S2: GLOBALTECH */}
        {tab === "s2" && (
          <div style={{ width: "100%" }}>
            <div style={{ marginBottom: 40 }}>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: theme.textMuted,
                  marginBottom: 8,
                }}
              >
                Session 2
              </div>
              <h2 style={headingStyle}>GLOBALTECH Bid</h2>
              <p style={{ fontSize: 18, lineHeight: 1.7, color: theme.text }}>
                GLOBALTECH Inc. wants to invest $500M in a battery factory. They
                will choose ONE country. Choose which of your countries makes
                the bid, and what concession you offer.
              </p>
            </div>

            <div style={gridStyle}>
              <Card>
                <label style={labelStyle}>1. Select Country</label>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {Object.entries(grp.countries).map(([rk, c]) => (
                    <button
                      key={rk}
                      onClick={() => update("s2", "country", c.name)}
                      style={{
                        padding: "24px",
                        border: `1px solid ${
                          dec.s2.country === c.name ? theme.text : theme.border
                        }`,
                        borderRadius: 4,
                        background:
                          dec.s2.country === c.name
                            ? theme.text
                            : theme.surface,
                        color:
                          dec.s2.country === c.name
                            ? theme.surface
                            : theme.text,
                        cursor: "pointer",
                        fontSize: 20,
                        fontFamily: theme.fontHeading,
                        fontStyle: "italic",
                        transition: "all 0.2s",
                        textAlign: "left",
                      }}
                    >
                      <span
                        style={{
                          marginRight: 16,
                          fontSize: 28,
                          fontStyle: "normal",
                        }}
                      >
                        {c.flag}
                      </span>{" "}
                      {c.name}
                    </button>
                  ))}
                </div>
              </Card>

              <Card>
                <label style={labelStyle}>2. Select Concession</label>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {CONCESSION_OPTIONS.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => update("s2", "concession", opt.id)}
                      style={{
                        border: `1px solid ${
                          dec.s2.concession === opt.id
                            ? theme.text
                            : theme.border
                        }`,
                        borderRadius: 4,
                        padding: "24px",
                        cursor: "pointer",
                        background:
                          dec.s2.concession === opt.id
                            ? theme.bg
                            : theme.surface,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ fontSize: 18 }}>{opt.label}</div>
                      <Badge isAccent={opt.welfare !== 0}>
                        {opt.welfare === 0 ? "Free" : `${opt.welfare} W`}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card style={{ marginTop: 24 }}>
              <label style={labelStyle}>Internal reasoning</label>
              <textarea
                value={dec.s2.reasoning}
                onChange={(e) => update("s2", "reasoning", e.target.value)}
                placeholder="Explain your choice..."
                style={{ ...inputStyle, minHeight: 140 }}
              />
            </Card>

            <AttendanceCard grp={grp} dec={dec} session="s2" update={update} />

            <button onClick={() => dispatch({ type: "SAVE" })} style={btnStyle}>
              Submit Bid
            </button>
          </div>
        )}

        {/* S3: TRAP */}
        {tab === "s3" && (
          <div style={{ width: "100%" }}>
            <div style={{ marginBottom: 40 }}>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: theme.textMuted,
                  marginBottom: 8,
                }}
              >
                Session 3
              </div>
              <h2 style={headingStyle}>Special Opportunity</h2>
            </div>

            {grp.trap ? (
              <div style={gridStyle}>
                <Card style={{ background: theme.surface }}>
                  <div
                    style={{
                      fontSize: 28,
                      fontFamily: theme.fontHeading,
                      fontStyle: "italic",
                      marginBottom: 20,
                    }}
                  >
                    Opportunity in {grp.trapCountry}
                  </div>
                  <p
                    style={{ fontSize: 18, lineHeight: 1.8, color: theme.text }}
                  >
                    {grp.trapType === "tax"
                      ? "Your country's financial infrastructure allows corporations to book profits here regardless of where activity occurred. You can facilitate a major tax relocation scheme."
                      : "Your country's offshore supply chain partners have been allowing sub-minimum wage conditions. You can formalise this for a production boost."}
                  </p>
                  <div
                    style={{
                      marginTop: 32,
                      paddingTop: 24,
                      borderTop: `1px solid ${theme.border}`,
                      fontSize: 16,
                    }}
                  >
                    <div style={{ marginBottom: 12 }}>
                      <span
                        style={{
                          color: theme.success,
                          fontWeight: 500,
                          display: "inline-block",
                          width: 140,
                        }}
                      >
                        If undetected:
                      </span>{" "}
                      {grp.trapType === "tax" ? "+3 GDP" : "+2 GDP"}
                    </div>
                    <div>
                      <span
                        style={{
                          color: theme.error,
                          fontWeight: 500,
                          display: "inline-block",
                          width: 140,
                        }}
                      >
                        If detected:
                      </span>{" "}
                      {grp.trapType === "tax"
                        ? "−2 GDP, −3 Welfare"
                        : "−1 GDP, −4 Welfare"}
                    </div>
                  </div>
                </Card>

                <Card>
                  <label style={labelStyle}>Your decision</label>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {["yes", "no"].map((v) => (
                      <button
                        key={v}
                        onClick={() => update("s3", "used", v)}
                        style={{
                          padding: "24px",
                          border: `1px solid ${
                            dec.s3.used === v ? theme.text : theme.border
                          }`,
                          borderRadius: 4,
                          background:
                            dec.s3.used === v ? theme.text : theme.surface,
                          color: dec.s3.used === v ? theme.surface : theme.text,
                          cursor: "pointer",
                          fontSize: 18,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          transition: "all 0.2s",
                        }}
                      >
                        {v === "yes" ? "Use Opportunity" : "Pass"}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            ) : (
              <Card style={{ textAlign: "center", padding: "80px 20px" }}>
                <div
                  style={{
                    fontSize: 20,
                    color: theme.textMuted,
                    fontStyle: "italic",
                  }}
                >
                  No special opportunity for your group this round.
                </div>
              </Card>
            )}

            <Card style={{ marginTop: 24 }}>
              <label style={labelStyle}>Notes</label>
              <textarea
                value={dec.s3.reasoning}
                onChange={(e) => update("s3", "reasoning", e.target.value)}
                style={{ ...inputStyle, minHeight: 140 }}
              />
            </Card>

            <AttendanceCard grp={grp} dec={dec} session="s3" update={update} />

            <button onClick={() => dispatch({ type: "SAVE" })} style={btnStyle}>
              Save Decision
            </button>
          </div>
        )}

        {/* S4: FDI */}
        {tab === "s4" && (
          <div style={{ width: "100%" }}>
            <div style={{ marginBottom: 40 }}>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: theme.textMuted,
                  marginBottom: 8,
                }}
              >
                Session 4
              </div>
              <h2 style={headingStyle}>FDI Allocation</h2>
              <p
                style={{
                  color: theme.textMuted,
                  fontSize: 18,
                  lineHeight: 1.6,
                }}
              >
                Distribute 100 units of capital from your European country.
                Total must equal 100.
              </p>
            </div>

            <div style={gridStyle}>
              {[
                {
                  key: "domestic",
                  label: `Domestic (${grp.countries.european.name})`,
                  mult: "×1.0 GDP",
                  welf: "No welfare cost",
                  flag: grp.countries.european.flag,
                },
                {
                  key: "ownWealthy",
                  label: `Your wealthy country (${grp.countries.wealthy.name})`,
                  mult: "×1.3 GDP",
                  welf: "−1 Welfare per 25 units",
                  flag: grp.countries.wealthy.flag,
                },
                {
                  key: "ownPoor",
                  label: `Your lower-mid country (${grp.countries.lower.name})`,
                  mult: "×1.6 GDP",
                  welf: "−1 Welfare per 15 units",
                  flag: grp.countries.lower.flag,
                },
                {
                  key: "otherPoor",
                  label: "External lower-mid country",
                  mult: "×1.8 GDP",
                  welf: "−1 Welfare per 10 units",
                  flag: "🌍",
                },
              ].map((f) => (
                <Card key={f.key}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 24,
                    }}
                  >
                    <div
                      style={{ display: "flex", gap: 16, alignItems: "center" }}
                    >
                      <span style={{ fontSize: 40 }}>{f.flag}</span>
                      <div>
                        <div style={{ fontSize: 18 }}>{f.label}</div>
                        <div
                          style={{
                            fontSize: 14,
                            color: theme.textMuted,
                            marginTop: 4,
                          }}
                        >
                          {f.welf}
                        </div>
                      </div>
                    </div>
                    <Badge>{f.mult}</Badge>
                  </div>

                  {f.key === "otherPoor" && (
                    <input
                      value={dec.s4.otherPoorTarget}
                      onChange={(e) =>
                        update("s4", "otherPoorTarget", e.target.value)
                      }
                      placeholder="Target country name..."
                      style={{ ...inputStyle, marginBottom: 16 }}
                    />
                  )}

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={dec.s4[f.key]}
                    onChange={(e) => update("s4", f.key, e.target.value)}
                    placeholder="Units (0–100)"
                    style={inputStyle}
                  />
                </Card>
              ))}
            </div>

            <Card
              style={{
                marginTop: 24,
                background: theme.text,
                color: theme.surface,
              }}
            >
              {(() => {
                const total =
                  (parseFloat(dec.s4.domestic) || 0) +
                  (parseFloat(dec.s4.ownWealthy) || 0) +
                  (parseFloat(dec.s4.ownPoor) || 0) +
                  (parseFloat(dec.s4.otherPoor) || 0);
                return (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 18,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Total allocated
                    </span>
                    <span
                      style={{
                        fontSize: 40,
                        fontFamily: theme.fontHeading,
                        color:
                          total === 100
                            ? theme.success
                            : total > 100
                            ? theme.error
                            : theme.surface,
                      }}
                    >
                      {total} / 100
                    </span>
                  </div>
                );
              })()}
            </Card>

            <Card style={{ marginTop: 24 }}>
              <label style={labelStyle}>Reasoning</label>
              <textarea
                value={dec.s4.reasoning}
                onChange={(e) => update("s4", "reasoning", e.target.value)}
                style={{ ...inputStyle, minHeight: 140 }}
              />
            </Card>

            <AttendanceCard grp={grp} dec={dec} session="s4" update={update} />

            <button onClick={() => dispatch({ type: "SAVE" })} style={btnStyle}>
              Save Allocation
            </button>
          </div>
        )}

        {/* PRACTICE */}
        {tab === "p1" && (
          <div style={{ width: "100%" }}>
            <div style={{ marginBottom: 40 }}>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: theme.textMuted,
                  marginBottom: 8,
                }}
              >
                Practice Session
              </div>
              <h2 style={headingStyle}>Trade Agreements</h2>
            </div>

            <div style={gridStyle}>
              <Card>
                <label style={labelStyle}>Your Value Chain Product</label>
                <input
                  value={dec.p1.product}
                  onChange={(e) => update("p1", "product", e.target.value)}
                  placeholder="e.g. Smartphone, Coffee..."
                  style={inputStyle}
                />

                <label style={{ ...labelStyle, marginTop: 32 }}>Notes</label>
                <textarea
                  value={dec.p1.notes}
                  onChange={(e) => update("p1", "notes", e.target.value)}
                  style={{ ...inputStyle, minHeight: 140 }}
                />
              </Card>

              <Card>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <label style={{ ...labelStyle, margin: 0 }}>
                    Agreements Signed
                  </label>
                  <button
                    onClick={() =>
                      update("p1", "agreements", [
                        ...dec.p1.agreements,
                        { with: "", resource: "" },
                      ])
                    }
                    style={{
                      background: theme.bg,
                      color: theme.text,
                      border: `1px solid ${theme.border}`,
                      borderRadius: 4,
                      padding: "10px 20px",
                      fontSize: 14,
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    + Add
                  </button>
                </div>

                {dec.p1.agreements.length === 0 && (
                  <p
                    style={{
                      color: theme.textMuted,
                      fontSize: 16,
                      fontStyle: "italic",
                    }}
                  >
                    No agreements yet.
                  </p>
                )}

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {dec.p1.agreements.map((ag, i) => (
                    <div
                      key={i}
                      style={{
                        border: `1px solid ${theme.border}`,
                        borderRadius: 4,
                        padding: 24,
                        background: theme.bg,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 16,
                        }}
                      >
                        <span style={{ fontSize: 16, color: theme.text }}>
                          Agreement #{i + 1}{" "}
                        </span>
                        <button
                          onClick={() =>
                            update(
                              "p1",
                              "agreements",
                              dec.p1.agreements.filter((_, j) => j !== i)
                            )
                          }
                          style={{
                            background: "none",
                            border: "none",
                            color: theme.textMuted,
                            textDecoration: "underline",
                            cursor: "pointer",
                            fontSize: 14,
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        value={ag.with}
                        onChange={(e) => {
                          const a = [...dec.p1.agreements];
                          a[i] = { ...a[i], with: e.target.value };
                          update("p1", "agreements", a);
                        }}
                        placeholder="Partner country"
                        style={{ ...inputStyle, background: theme.surface }}
                      />
                      <input
                        value={ag.resource}
                        onChange={(e) => {
                          const a = [...dec.p1.agreements];
                          a[i] = { ...a[i], resource: e.target.value };
                          update("p1", "agreements", a);
                        }}
                        placeholder="What is exchanged?"
                        style={{
                          ...inputStyle,
                          background: theme.surface,
                          marginBottom: 0,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <AttendanceCard grp={grp} dec={dec} session="p1" update={update} />

            <button onClick={() => dispatch({ type: "SAVE" })} style={btnStyle}>
              Save Details
            </button>
          </div>
        )}

        {/* SCORES */}
        {tab === "scores" && (
          <div style={{ width: "100%" }}>
            <div style={{ marginBottom: 40, textAlign: "center" }}>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: theme.textMuted,
                  marginBottom: 8,
                }}
              >
                Scoreboard
              </div>
              <h2 style={headingStyle}>Current Rankings</h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 24,
                marginBottom: 40,
              }}
            >
              <Card
                style={{
                  textAlign: "center",
                  borderTop: `4px solid ${theme.text}`,
                }}
              >
                <div style={labelStyle}>Your GDP Score</div>
                <div
                  style={{
                    fontSize: 80,
                    color: theme.text,
                    fontFamily: theme.fontHeading,
                    marginTop: 16,
                  }}
                >
                  {myScore.gdp}
                </div>
              </Card>
              <Card
                style={{
                  textAlign: "center",
                  borderTop: `4px solid ${
                    state.revealWelfare ? theme.accent : theme.border
                  }`,
                }}
              >
                <div style={labelStyle}>Your Welfare Score</div>
                {state.revealWelfare ? (
                  <div
                    style={{
                      fontSize: 80,
                      color: theme.accent,
                      fontFamily: theme.fontHeading,
                      marginTop: 16,
                    }}
                  >
                    {myScore.welfare}
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: 56,
                      color: theme.textMuted,
                      marginTop: 24,
                    }}
                  >
                    🔒
                  </div>
                )}
              </Card>
            </div>

            <Card style={{ padding: 0, overflow: "hidden" }}>
              {Object.entries(calcScores(state))
                .sort(([, a], [, b]) => b.gdp - a.gdp)
                .map(([gk, sc], i) => {
                  const g = GROUPS[parseInt(gk)];
                  return (
                    <div
                      key={gk}
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 24,
                        padding: "24px 40px",
                        borderBottom: `1px solid ${theme.border}`,
                        background:
                          parseInt(gk) === groupId ? theme.bg : "transparent",
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          border: `1px solid ${
                            parseInt(gk) === groupId ? theme.text : theme.border
                          }`,
                          color:
                            parseInt(gk) === groupId
                              ? theme.text
                              : theme.textMuted,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                          fontFamily: theme.fontHeading,
                        }}
                      >
                        {i + 1}
                      </div>
                      <span style={{ fontSize: 40 }}>
                        {g.countries.european.flag}
                        {g.countries.wealthy.flag}
                        {g.countries.lower.flag}
                      </span>
                      <span
                        style={{
                          fontSize: 20,
                          flex: 1,
                          minWidth: 200,
                          color:
                            parseInt(gk) === groupId
                              ? theme.text
                              : theme.textMuted,
                          fontFamily:
                            parseInt(gk) === groupId
                              ? theme.fontHeading
                              : theme.fontMain,
                          fontStyle:
                            parseInt(gk) === groupId ? "italic" : "normal",
                        }}
                      >
                        Group {gk}
                        {parseInt(gk) === groupId ? " (You)" : ""}
                      </span>
                      <span
                        style={{ fontSize: 32, fontFamily: theme.fontHeading }}
                      >
                        {sc.gdp}{" "}
                        <span
                          style={{
                            fontSize: 14,
                            fontFamily: theme.fontMain,
                            color: theme.textMuted,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                          }}
                        >
                          GDP
                        </span>
                      </span>
                    </div>
                  );
                })}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PROFESSOR / MAESE DASHBOARD ──────────────────────────────────────────────
const ProfessorDashboard = ({ state, dispatch, onLogout, userRole }) => {
  const [tab, setTab] = useState("overview");
  const scores = calcScores(state);

  const title =
    userRole === "maese" ? "Maese Dashboard" : "Professor Dashboard";

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "attendance", label: "Attendance Log" },
    { id: "decisions", label: "All Decisions" },
    { id: "globaltech", label: "GLOBALTECH" },
    { id: "traps", label: "Traps" },
    { id: "reveal", label: "Final Reveal" },
  ];

  const labelStyle = {
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: theme.textMuted,
    display: "block",
    marginBottom: 16,
    fontWeight: 500,
  };
  const headingStyle = {
    color: theme.text,
    fontSize: "clamp(28px, 5vw, 40px)",
    fontFamily: theme.fontHeading,
    fontStyle: "italic",
    marginBottom: 24,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        fontFamily: theme.fontMain,
        color: theme.text,
        width: "100%",
      }}
    >
      <div
        style={{
          background: theme.surface,
          borderBottom: `1px solid ${theme.border}`,
          padding: "20px clamp(20px, 5vw, 60px)",
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: theme.textMuted,
              fontWeight: 500,
            }}
          >
            World Chain
          </div>
          <div
            style={{
              fontSize: 24,
              marginTop: 6,
              fontFamily: theme.fontHeading,
              fontStyle: "italic",
            }}
          >
            {title}
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            background: "transparent",
            border: "none",
            textDecoration: "underline",
            color: theme.textMuted,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Sign out
        </button>
      </div>

      <div
        style={{
          background: theme.surface,
          borderBottom: `1px solid ${theme.border}`,
          display: "flex",
          overflowX: "auto",
          padding: "0 clamp(10px, 4vw, 40px)",
          WebkitOverflowScrolling: "touch",
          width: "100%",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "20px 24px",
              border: "none",
              borderBottom:
                tab === t.id
                  ? `2px solid ${theme.text}`
                  : "2px solid transparent",
              background: "transparent",
              cursor: "pointer",
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: tab === t.id ? theme.text : theme.textMuted,
              fontWeight: tab === t.id ? 500 : 400,
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ width: "100%", padding: "clamp(24px, 5vw, 60px)" }}>
        {tab === "overview" && (
          <div style={{ width: "100%" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 24,
                marginBottom: 40,
              }}
            >
              {[
                { label: "Active Groups", value: Object.keys(GROUPS).length },
                {
                  label: "Decisions Submitted",
                  value: Object.values(state.decisions).filter(
                    (d) => d.s2.concession
                  ).length,
                },
                {
                  label: "Agreements Signed",
                  value: Object.values(state.decisions).reduce(
                    (s, d) => s + (d.p1.agreements.length || 0),
                    0
                  ),
                },
              ].map((m) => (
                <Card key={m.label} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 72,
                      color: theme.text,
                      fontFamily: theme.fontHeading,
                    }}
                  >
                    {m.value}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: theme.textMuted,
                      marginTop: 16,
                    }}
                  >
                    {m.label}
                  </div>
                </Card>
              ))}
            </div>

            <Card style={{ padding: "40px 0 0 0", overflow: "hidden" }}>
              <div style={{ padding: "0 40px", ...labelStyle }}>
                Live Rankings
              </div>
              <div style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 900 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "80px 2.5fr 1.5fr 1.5fr 1fr 1fr",
                      gap: 16,
                      padding: "0 40px 16px 40px",
                      borderBottom: `1px solid ${theme.border}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        color: theme.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Rank
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: theme.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Group
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: theme.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      S2 Bid
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: theme.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Trap Status
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: theme.text,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      GDP
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: state.revealWelfare
                          ? theme.accent
                          : theme.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      {state.revealWelfare ? "Welfare" : "Welfare 🔒"}
                    </div>
                  </div>
                  {Object.entries(scores)
                    .sort(([, a], [, b]) => b.gdp - a.gdp)
                    .map(([gk, sc], i) => {
                      const g = GROUPS[parseInt(gk)];
                      const dec = state.decisions[gk];
                      return (
                        <div
                          key={gk}
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "80px 2.5fr 1.5fr 1.5fr 1fr 1fr",
                            gap: 16,
                            alignItems: "center",
                            padding: "24px 40px",
                            borderBottom: `1px solid ${theme.bg}`,
                          }}
                        >
                          <div
                            style={{
                              color: theme.textMuted,
                              fontSize: 20,
                              fontFamily: theme.fontHeading,
                            }}
                          >
                            #{i + 1}
                          </div>
                          <div style={{ fontSize: 20 }}>
                            {g.countries.european.flag}
                            {g.countries.wealthy.flag}
                            {g.countries.lower.flag}{" "}
                            <span
                              style={{
                                color: theme.textMuted,
                                fontSize: 15,
                                marginLeft: 12,
                              }}
                            >
                              G{gk}
                            </span>
                          </div>
                          <div>
                            {dec.s2.concession ? (
                              <Badge>Opt {dec.s2.concession}</Badge>
                            ) : (
                              <span style={{ color: theme.border }}>—</span>
                            )}
                          </div>
                          <div>
                            {GROUPS[parseInt(gk)].trap ? (
                              state.trapResults[gk] === "free" ? (
                                <Badge>Undetected</Badge>
                              ) : state.trapResults[gk] === "caught" ? (
                                <Badge isAccent>Caught</Badge>
                              ) : dec.s3.used === "yes" ? (
                                <Badge>Pending Roll</Badge>
                              ) : dec.s3.used === "no" ? (
                                <Badge>Passed</Badge>
                              ) : (
                                <span style={{ color: theme.border }}>—</span>
                              )
                            ) : (
                              <span style={{ color: theme.border }}>—</span>
                            )}
                          </div>
                          <div
                            style={{
                              color: theme.text,
                              fontSize: 28,
                              fontFamily: theme.fontHeading,
                            }}
                          >
                            {sc.gdp}
                          </div>
                          <div
                            style={{
                              color: state.revealWelfare
                                ? theme.accent
                                : theme.textMuted,
                              fontSize: 28,
                              fontFamily: theme.fontHeading,
                            }}
                          >
                            {state.revealWelfare ? sc.welfare : "?"}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </Card>
          </div>
        )}

        {tab === "attendance" && (
          <div style={{ width: "100%" }}>
            <h2 style={{ ...headingStyle, marginBottom: 40 }}>
              Attendance Log by Group
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                gap: 24,
              }}
            >
              {Object.entries(GROUPS).map(([gk, g]) => {
                const dec = state.decisions[gk];
                return (
                  <Card key={gk}>
                    <div
                      style={{
                        fontSize: 24,
                        fontFamily: theme.fontHeading,
                        fontStyle: "italic",
                        color: theme.text,
                        marginBottom: 24,
                      }}
                    >
                      Group {gk} {g.countries.european.flag}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      {["s1", "s2", "s3", "s4", "p1"].map((session) => (
                        <div
                          key={session}
                          style={{
                            background: theme.bg,
                            padding: 20,
                            borderRadius: 4,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              letterSpacing: 2,
                              textTransform: "uppercase",
                              color: theme.textMuted,
                              marginBottom: 12,
                            }}
                          >
                            {session.toUpperCase()} Session
                          </div>
                          {dec[session].attendance &&
                          dec[session].attendance.length > 0 ? (
                            <ul
                              style={{
                                margin: 0,
                                paddingLeft: 20,
                                color: theme.text,
                                fontSize: 15,
                                lineHeight: 1.6,
                              }}
                            >
                              {dec[session].attendance.map((m) => (
                                <li key={m}>{m}</li>
                              ))}
                            </ul>
                          ) : (
                            <div
                              style={{
                                fontSize: 14,
                                color: theme.textMuted,
                                fontStyle: "italic",
                              }}
                            >
                              No attendance recorded.
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {tab === "decisions" && (
          <div style={{ width: "100%" }}>
            <h2 style={{ ...headingStyle, marginBottom: 40 }}>
              Detalles de Decisiones por Grupo
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {Object.entries(GROUPS).map(([gk, g]) => {
                const dec = state.decisions[gk];
                return (
                  <Card key={gk}>
                    <div
                      style={{
                        fontSize: 24,
                        fontFamily: theme.fontHeading,
                        marginBottom: 16,
                      }}
                    >
                      Grupo {gk} {g.countries.european.flag}
                    </div>

                    {/* 1) S1: Production Strategy & Puntos Gratuitos */}
                    <div
                      style={{
                        padding: 16,
                        border: `1px solid ${theme.border}`,
                        borderRadius: 4,
                        marginBottom: 16,
                      }}
                    >
                      <h3 style={{ fontSize: 16, marginTop: 0 }}>
                        1) Production Strategy (S1)
                      </h3>
                      <p>
                        <strong>Estrategias:</strong>{" "}
                        {JSON.stringify(dec.s1.strategies)}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          marginTop: 12,
                        }}
                      >
                        <label>Puntos iniciales gratuitos (Afecta GDP):</label>
                        <input
                          type="number"
                          value={state.initialPoints?.[gk] || 0}
                          onChange={(e) =>
                            dispatch({
                              type: "SET_INITIAL_POINTS",
                              groupId: gk,
                              points: Number(e.target.value),
                            })
                          }
                          style={{
                            padding: 8,
                            borderRadius: 4,
                            border: `1px solid ${theme.border}`,
                            width: 100,
                          }}
                        />
                      </div>
                    </div>

                    {/* 2) S2: GLOBALTECH Bid */}
                    <div
                      style={{
                        padding: 16,
                        border: `1px solid ${theme.border}`,
                        borderRadius: 4,
                        marginBottom: 16,
                      }}
                    >
                      <h3 style={{ fontSize: 16, marginTop: 0 }}>
                        2) Bid GLOBALTECH (S2)
                      </h3>
                      <p>
                        <strong>País seleccionado:</strong>{" "}
                        {dec.s2.country || "Ninguno"}
                      </p>
                      <p>
                        <strong>Concesión ofrecida:</strong>{" "}
                        {dec.s2.concession || "Ninguna"}
                      </p>
                    </div>

                    {/* 3) S3: Ventaja Especial */}
                    <div
                      style={{
                        padding: 16,
                        border: `1px solid ${theme.border}`,
                        borderRadius: 4,
                        marginBottom: 16,
                      }}
                    >
                      <h3 style={{ fontSize: 16, marginTop: 0 }}>
                        3) Ventaja Especial / Trampas (S3)
                      </h3>
                      {g.trap ? (
                        <p>
                          <strong>Tienen ventaja:</strong> Sí ({g.trapType} en{" "}
                          {g.trapCountry}). <br />
                          <strong>Decisión:</strong>{" "}
                          {dec.s3.used === "yes"
                            ? "La han usado"
                            : dec.s3.used === "no"
                            ? "No la han usado"
                            : "Pendiente"}
                        </p>
                      ) : (
                        <p>No disponen de ventaja especial.</p>
                      )}
                    </div>

                    {/* 4) S4: Allocation */}
                    <div
                      style={{
                        padding: 16,
                        border: `1px solid ${theme.border}`,
                        borderRadius: 4,
                        marginBottom: 16,
                      }}
                    >
                      <h3 style={{ fontSize: 16, marginTop: 0 }}>
                        4) FDI Allocation (S4)
                      </h3>
                      <p>
                        <strong>Doméstico:</strong> {dec.s4.domestic || 0} |{" "}
                        <strong>Rico:</strong> {dec.s4.ownWealthy || 0} |{" "}
                        <strong>Pobre propio:</strong> {dec.s4.ownPoor || 0} |{" "}
                        <strong>Pobre externo:</strong> {dec.s4.otherPoor || 0}{" "}
                        (Destino: {dec.s4.otherPoorTarget || "-"})
                      </p>
                    </div>

                    {/* 5) P1: Valoración de Agreements */}
                    <div
                      style={{
                        padding: 16,
                        border: `1px solid ${theme.border}`,
                        borderRadius: 4,
                      }}
                    >
                      <h3 style={{ fontSize: 16, marginTop: 0 }}>
                        5) Valoración Agreements y Cadena de Valor (P1)
                      </h3>
                      <p>
                        <strong>Producto:</strong> {dec.p1.product || "-"}
                      </p>
                      <p>
                        <strong>Notas de Cadena:</strong> {dec.p1.notes || "-"}
                      </p>
                      <p>
                        <strong>Acuerdos declarados:</strong>{" "}
                        {dec.p1.agreements.length}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          marginTop: 12,
                        }}
                      >
                        <label>Valoración (Transforma en Puntos):</label>
                        <select
                          value={state.agreementEvaluations?.[gk] || ""}
                          onChange={(e) =>
                            dispatch({
                              type: "SET_AGREEMENT_EVALUATION",
                              groupId: gk,
                              evaluation: e.target.value,
                            })
                          }
                          style={{
                            padding: 8,
                            borderRadius: 4,
                            border: `1px solid ${theme.border}`,
                            background: theme.surface,
                            color: theme.text,
                          }}
                        >
                          <option value="">-- Sin valorar (0 pts) --</option>
                          <option value="genial">
                            Genial (+10 GDP, +5 Welfare)
                          </option>
                          <option value="bien">
                            Bien (+5 GDP, +2 Welfare)
                          </option>
                          <option value="regular">
                            Regular (+2 GDP, +0 Welfare)
                          </option>
                          <option value="mal">Mal (-2 GDP, -2 Welfare)</option>
                        </select>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {tab === "reveal" && (
          <div style={{ width: "100%" }}>
            <Card
              style={{
                textAlign: "center",
                padding: "clamp(60px, 8vw, 100px) 20px",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: theme.textMuted,
                  marginBottom: 24,
                }}
              >
                The Moment of Truth
              </div>
              <h2
                style={{
                  color: theme.text,
                  fontSize: "clamp(36px, 6vw, 56px)",
                  marginBottom: 32,
                  fontFamily: theme.fontHeading,
                  fontStyle: "italic",
                }}
              >
                Reveal Welfare Scores
              </h2>
              <p
                style={{
                  color: theme.textMuted,
                  fontSize: 18,
                  lineHeight: 1.8,
                  marginBottom: 48,
                  maxWidth: 600,
                  margin: "0 auto 48px",
                }}
              >
                Once revealed, all students will immediately see their Welfare
                scores on their dashboards. This action updates all screens
                instantly.
              </p>
              <button
                onClick={() => dispatch({ type: "TOGGLE_WELFARE" })}
                style={{
                  background: state.revealWelfare ? theme.surface : theme.text,
                  color: state.revealWelfare ? theme.text : theme.surface,
                  border: `1px solid ${theme.text}`,
                  borderRadius: 4,
                  padding: "24px 48px",
                  fontSize: 18,
                  cursor: "pointer",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  transition: "all 0.3s",
                }}
              >
                {state.revealWelfare
                  ? "Hide Welfare Scores"
                  : "Reveal Welfare Scores"}
              </button>
            </Card>
          </div>
        )}

        {(tab === "globaltech" || tab === "traps") && (
          <Card style={{ textAlign: "center", padding: 80, width: "100%" }}>
            <h2 style={headingStyle}>Module '{tab}' is active.</h2>
            <p style={{ color: theme.textMuted, fontSize: 18 }}>
              The data structure remains intact, applying the same fluid CSS
              architecture to display properly.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

// ─── ROOT ────────────────────────────────────────────────────────────────────
const reducer = (state, action) => {
  let next;
  switch (action.type) {
    case "UPDATE_DECISION":
      next = {
        ...state,
        decisions: {
          ...state.decisions,
          [action.groupId]: {
            ...state.decisions[action.groupId],
            [action.session]: {
              ...state.decisions[action.groupId][action.session],
              [action.field]: action.val,
            },
          },
        },
      };
      break;
    case "SET_GLOBALTECH":
      next = { ...state, globaltechWinner: action.winner };
      break;
    case "SET_TRAP_RESULT":
      next = {
        ...state,
        trapResults: { ...state.trapResults, [action.groupId]: action.result },
      };
      break;
    case "SET_INITIAL_POINTS":
      next = {
        ...state,
        initialPoints: {
          ...state.initialPoints,
          [action.groupId]: action.points,
        },
      };
      break;
    case "SET_AGREEMENT_EVALUATION":
      next = {
        ...state,
        agreementEvaluations: {
          ...state.agreementEvaluations,
          [action.groupId]: action.evaluation,
        },
      };
      break;
    case "TOGGLE_WELFARE":
      next = { ...state, revealWelfare: !state.revealWelfare };
      break;
    case "SAVE":
      next = state;
      break;
    default:
      return state;
  }
  saveState(next);
  return next;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [groupId, setGroupId] = useState(null);
  const [state, dispatch] = useState(() => {
    const saved = loadState();
    return saved || initState();
  });

  const wrappedDispatch = useCallback((action) => {
    dispatch((prev) => reducer(prev, action));
  }, []);

  const handleLogin = (role, gid) => {
    setUser(role);
    setGroupId(gid);
  };
  const handleLogout = () => {
    setUser(null);
    setGroupId(null);
  };

  return (
    <>
      <GlobalStyles />
      {!user ? (
        <LoginScreen onLogin={handleLogin} />
      ) : user === "professor" || user === "maese" ? (
        <ProfessorDashboard
          state={state}
          dispatch={wrappedDispatch}
          onLogout={handleLogout}
          userRole={user}
        />
      ) : (
        <StudentView
          groupId={groupId}
          state={state}
          dispatch={wrappedDispatch}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
