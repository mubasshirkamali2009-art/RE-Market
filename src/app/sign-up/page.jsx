"use client";
import { useState } from "react";

export default function SignUp({ onSwitchToSignIn, onSignUpSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    photoUrl: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in name, email, and password.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError("");
    console.log("Sign up data:", formData);

    // Hand the data up to whatever handles real account creation.
    if (onSignUpSuccess) onSignUpSuccess(formData);
  }

  function handleGoogleClick() {
    console.log("Continue with Google clicked");
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.sidePanel}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path
                d="M12 2L4 6V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V6L12 2Z"
                stroke="white"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span style={styles.brandName}>ReSell Hub</span>
        </div>

        <div style={styles.sideContent}>
          <h1 style={styles.sideHeading}>Buy smart. Sell easy.</h1>
          <p style={styles.sideText}>
            Join ReSell Hub and give your used items a new home. List
            products, chat with buyers, and earn from things you no longer
            need.
          </p>
        </div>

        <div style={styles.illustration}>
          <svg width="140" height="160" viewBox="0 0 140 160" fill="none">
            <path d="M30 50 L35 30 H105 L110 50 Z" fill="#1f4d3c" />
            <rect x="20" y="50" width="100" height="100" rx="6" fill="#2c6b4f" />
            <path
              d="M55 30 V20 a15 15 0 0 1 30 0 V30"
              stroke="#1f4d3c"
              strokeWidth="6"
              fill="none"
            />
            <g transform="translate(70 100)">
              <path
                d="M0 -28 L8 -14 L-2 -14 L6 0 L-22 -2 L-10 -14 L-20 -14 Z"
                fill="#eef3e2"
              />
              <path
                d="M0 -28 L8 -14 L-2 -14 L6 0 L-22 -2 L-10 -14 L-20 -14 Z"
                fill="#eef3e2"
                transform="rotate(120)"
              />
              <path
                d="M0 -28 L8 -14 L-2 -14 L6 0 L-22 -2 L-10 -14 L-20 -14 Z"
                fill="#eef3e2"
                transform="rotate(240)"
              />
            </g>
          </svg>
        </div>
      </div>

      <div style={styles.formPanel}>
        <div style={styles.formContainer}>
          <h2 style={styles.heading}>Create account</h2>
          <p style={styles.subtitle}>Start buying and selling in minutes.</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="name">Full name</label>
              <input
                style={styles.input}
                id="name"
                name="name"
                type="text"
                placeholder="Jamie Rahman"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label} htmlFor="photoUrl">Photo URL</label>
              <input
                style={styles.input}
                id="photoUrl"
                name="photoUrl"
                type="text"
                placeholder="https://example.com/your-photo.jpg"
                value={formData.photoUrl}
                onChange={handleChange}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label} htmlFor="email">Email address</label>
              <input
                style={styles.input}
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label} htmlFor="password">Password</label>
              <input
                style={styles.input}
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" style={styles.btnPrimary}>
              Sign up
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>or</span>
            <span style={styles.dividerLine}></span>
          </div>

          <button type="button" style={styles.btnGoogle} onClick={handleGoogleClick}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <p style={styles.footerText}>
            Already have an account?{" "}
            <span style={styles.link} onClick={onSwitchToSignIn}>
              Log in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    flexWrap: "wrap",
    fontFamily: "Inter, sans-serif",
    background: "#fff",
    color: "#1f2d22",
  },
  sidePanel: {
    flex: "1 1 380px",
    minWidth: "320px",
    background: "#eef3e2",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "48px",
    position: "relative",
  },
  brand: { display: "flex", alignItems: "center", gap: "10px", position: "absolute", top: "40px", left: "48px" },
  brandIcon: { width: "36px", height: "36px", borderRadius: "10px", background: "#1f4d3c", display: "flex", alignItems: "center", justifyContent: "center" },
  brandName: { fontSize: "18px", fontWeight: 700, color: "#1f4d3c" },
  sideContent: { maxWidth: "380px" },
  sideHeading: { fontSize: "32px", fontWeight: 700, lineHeight: 1.25, color: "#1f4d3c" },
  sideText: { marginTop: "12px", fontSize: "15px", lineHeight: 1.6, color: "#4b6354" },
  illustration: { width: "220px", height: "220px", margin: "40px auto 0", borderRadius: "32px", background: "#dce8c8", display: "flex", alignItems: "center", justifyContent: "center" },
  formPanel: { flex: "1 1 380px", minWidth: "320px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "48px 24px" },
  formContainer: { width: "100%", maxWidth: "380px" },
  heading: { fontSize: "26px", fontWeight: 700 },
  subtitle: { marginTop: "6px", fontSize: "14px", color: "#6b7a6d" },
  form: { marginTop: "28px", display: "flex", flexDirection: "column", gap: "18px" },
  field: {},
  label: { display: "block", marginBottom: "7px", fontSize: "14px", fontWeight: 600, color: "#33402f" },
  input: { width: "100%", padding: "11px 14px", border: "1px solid #d8e0cf", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", color: "#1f2d22", background: "#fff", outline: "none" },
  error: { fontSize: "13px", color: "#a13a3a", background: "#fbeaea", padding: "8px 12px", borderRadius: "8px" },
  btnPrimary: { marginTop: "4px", width: "100%", padding: "12px", border: "none", borderRadius: "10px", background: "#2c6b4f", color: "#fff", fontSize: "15px", fontWeight: 600, fontFamily: "inherit", cursor: "pointer" },
  divider: { display: "flex", alignItems: "center", gap: "12px", margin: "22px 0" },
  dividerLine: { flex: 1, height: "1px", background: "#e4e9dc" },
  dividerText: { fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#9ca99a" },
  btnGoogle: { width: "100%", padding: "11px", border: "1px solid #d8e0cf", borderRadius: "10px", background: "#fff", color: "#2c3e2d", fontSize: "14px", fontWeight: 600, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
  footerText: { marginTop: "26px", textAlign: "center", fontSize: "14px", color: "#6b7a6d" },
  link: { color: "#2c6b4f", fontWeight: 600, cursor: "pointer" },
};