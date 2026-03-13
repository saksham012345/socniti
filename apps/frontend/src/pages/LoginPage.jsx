import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    otp: ""
  });
  const [message, setMessage] = useState("");

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (mode === "register") {
      await api.post("/api/auth/register", form);
      setMessage("Registered. Use login or verify your OTP if you signed up with phone.");
      return;
    }

    if (mode === "otp-send") {
      const response = await api.post("/api/auth/send-otp", { phone: form.phone });
      setMessage(
        response.data.otpPreview
          ? `OTP generated for development: ${response.data.otpPreview}`
          : "OTP sent."
      );
      return;
    }

    if (mode === "otp-verify") {
      const response = await api.post("/api/auth/verify-otp", {
        phone: form.phone,
        otp: form.otp
      });
      saveSession(response.data.token, response.data.user);
      navigate(response.data.user.role === "organizer" ? "/organizer" : "/dashboard");
      return;
    }

    const response = await api.post("/api/auth/login", {
      email: form.email,
      password: form.password
    });
    saveSession(response.data.token, response.data.user);
    navigate(response.data.user.role === "organizer" ? "/organizer" : "/dashboard");
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="rounded-[2rem] bg-white p-8 shadow-soft">
        <h1 className="font-display text-4xl font-bold text-ink">Login or create your account</h1>
        <p className="mt-3 text-ink/70">
          Start with email and password today. OTP-based login is also wired for development.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {[
            ["login", "Email login"],
            ["register", "Register"],
            ["otp-send", "Send OTP"],
            ["otp-verify", "Verify OTP"]
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                mode === value ? "bg-ink text-white" : "bg-mist text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form className="mt-8 grid gap-4" onSubmit={submit}>
          {mode === "register" && (
            <input
              name="fullName"
              value={form.fullName}
              onChange={updateField}
              placeholder="Full name"
              className="rounded-2xl border border-ink/15 px-4 py-3"
            />
          )}
          {(mode === "register" || mode === "login") && (
            <input
              name="email"
              value={form.email}
              onChange={updateField}
              placeholder="Email"
              className="rounded-2xl border border-ink/15 px-4 py-3"
            />
          )}
          {(mode === "register" || mode.includes("otp")) && (
            <input
              name="phone"
              value={form.phone}
              onChange={updateField}
              placeholder="Phone number"
              className="rounded-2xl border border-ink/15 px-4 py-3"
            />
          )}
          {(mode === "register" || mode === "login") && (
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="Password"
              className="rounded-2xl border border-ink/15 px-4 py-3"
            />
          )}
          {mode === "register" && (
            <select
              name="role"
              value={form.role}
              onChange={updateField}
              className="rounded-2xl border border-ink/15 px-4 py-3"
            >
              <option value="user">User</option>
              <option value="organizer">Organizer</option>
            </select>
          )}
          {mode === "otp-verify" && (
            <input
              name="otp"
              value={form.otp}
              onChange={updateField}
              placeholder="Enter OTP"
              className="rounded-2xl border border-ink/15 px-4 py-3"
            />
          )}
          <button type="submit" className="rounded-2xl bg-ink px-4 py-3 font-semibold text-white">
            Continue
          </button>
        </form>

        {message ? <p className="mt-4 text-sm font-semibold text-leaf">{message}</p> : null}
      </div>
    </div>
  );
}
