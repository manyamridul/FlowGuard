import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiLock,
  FiMail,
  FiCheckCircle,
  FiArrowRight,
  FiUser,
  FiZap,
  FiTrendingUp,
  FiShield,
} from "react-icons/fi";
import { loginUser, registerUser } from "../../services/api";
import Logo from "../../components/Logo/Logo";

const ROTATING_WORDS = [
  "projects",
  "tasks",
  "bugs",
  "sprints",
  "teams",
];

const TICKER_ITEMS = [
  "SDLC phase tracking",
  "Sprint velocity",
  "Bug triage workflow",
  "Team capacity",
  "Knowledge base",
  "Live analytics",
  "Project delivery",
  "Workflow boards",
];

const emptySignIn = {
  email: "",
  password: "",
};

const emptySignUp = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  password: "",
  password_confirm: "",
};

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [signInForm, setSignInForm] = useState(emptySignIn);
  const [signUpForm, setSignUpForm] = useState(emptySignUp);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add("login-motion-enabled");

    return () => {
      document.documentElement.classList.remove("login-motion-enabled");
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((current) => (current + 1) % ROTATING_WORDS.length);
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
  };

  const completeLogin = (result) => {
    if (!result?.access) {
      throw new Error("Authentication token was not received.");
    }

    localStorage.setItem("flowguard-access-token", result.access);

    if (result.refresh) {
      localStorage.setItem("flowguard-refresh-token", result.refresh);
    }

    if (result.user) {
      localStorage.setItem("flowguard-user", JSON.stringify(result.user));
    }

    if (onLogin) {
      onLogin();
    }

    navigate("/dashboard", { replace: true });
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    setError("");

    const email = signInForm.email.trim().toLowerCase();
    const password = signInForm.password;

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginUser({ email, password });
      completeLogin(result);
    } catch (err) {
      setError(err.message || "Unable to authenticate. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    setError("");

    const firstName = signUpForm.first_name.trim();
    const lastName = signUpForm.last_name.trim();
    const email = signUpForm.email.trim().toLowerCase();
    const username = (
      signUpForm.username.trim() || email.split("@")[0] || ""
    ).replace(/[^a-zA-Z0-9._-]/g, "");
    const password = signUpForm.password;
    const passwordConfirm = signUpForm.password_confirm;

    if (!firstName || !email || !password) {
      setError("Please fill in name, email, and password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        username,
        email,
        password,
        password_confirm: passwordConfirm,
        first_name: firstName,
        last_name: lastName,
        role: "VIEWER",
      });

      const result = await loginUser({ email, password });
      completeLogin(result);
    } catch (err) {
      setError(err.message || "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSignIn = mode === "signin";

  return (
    <div className="login-page">
      <div className="login-orbs" aria-hidden="true">
        <span className="login-orb login-orb-1" />
        <span className="login-orb login-orb-2" />
        <span className="login-orb login-orb-3" />
      </div>
      <div className="login-aurora" aria-hidden="true" />
      <div className="login-grid" aria-hidden="true" />

      <header className="login-topbar login-fade-in">
        <div className="login-topbar-brand">
          <div className="brand-icon">
            <Logo size={22} />
          </div>
          <div>
            <p className="eyebrow">Flow Guard</p>
            <span className="login-topbar-name">SaaS workspace</span>
          </div>
        </div>
        <div className="login-topbar-actions">
          <button
            type="button"
            className={`login-ghost ${isSignIn ? "is-active" : ""}`}
            onClick={() => switchMode("signin")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`login-ghost ${!isSignIn ? "is-active" : ""}`}
            onClick={() => switchMode("signup")}
          >
            Create account
          </button>
        </div>
      </header>

      <div className="login-shell">
        <section className="login-visual">
          <div className="visual-badge">
            <span className="visual-badge-dot" aria-hidden="true" />
            Engineering workspace
          </div>

          <h1>
            One place for{" "}
            <span className="login-word-slot" aria-live="polite">
              <span
                key={ROTATING_WORDS[wordIndex]}
                className="login-rotating-word"
              >
                {ROTATING_WORDS[wordIndex]}
              </span>
            </span>
            <br />
            and delivery.
          </h1>

          <p className="login-visual-lead">
            FlowGuard helps teams plan work, track bugs, and keep sprints moving
            without switching tools.
          </p>

          <div className="visual-points">
            <div className="visual-point-item">
              <FiCheckCircle />
              <span>Project and task tracking</span>
            </div>
            <div className="visual-point-item">
              <FiCheckCircle />
              <span>Workflow boards for every sprint</span>
            </div>
            <div className="visual-point-item">
              <FiCheckCircle />
              <span>Shared visibility for the whole team</span>
            </div>
          </div>

          <div className="login-metrics">
            <div className="login-metric-card">
              <FiTrendingUp className="login-metric-icon" />
              <strong>Projects</strong>
              <span>Plan and ship</span>
            </div>
            <div className="login-metric-card">
              <FiZap className="login-metric-icon" />
              <strong>Tasks</strong>
              <span>Stay unblocked</span>
            </div>
            <div className="login-metric-card">
              <FiShield className="login-metric-icon" />
              <strong>Bugs</strong>
              <span>Close the loop</span>
            </div>
          </div>

          <div className="login-marquee" aria-hidden="true">
            <div className="login-marquee-track">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => (
                <span key={`${item}-${index}`} className="login-marquee-item">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="login-panel">
          <div className="login-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={isSignIn}
              className={isSignIn ? "is-active" : ""}
              onClick={() => switchMode("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isSignIn}
              className={!isSignIn ? "is-active" : ""}
              onClick={() => switchMode("signup")}
            >
              Create account
            </button>
          </div>

          <div className="login-copy" key={mode}>
            <h2>{isSignIn ? "Welcome back" : "Create your workspace access"}</h2>
            <p>
              {isSignIn
                ? "Sign in to continue managing delivery with your team."
                : "Set up an account, then you will enter the workspace automatically."}
            </p>
          </div>

          <div className="login-form-stage" key={`form-${mode}`}>
          {isSignIn ? (
            <form className="login-form" onSubmit={handleSignIn}>
              <label>
                <span>Work email</span>
                <div className="input-wrap">
                  <FiMail />
                  <input
                    type="email"
                    name="email"
                    value={signInForm.email}
                    onChange={(event) => {
                      setSignInForm((previous) => ({
                        ...previous,
                        email: event.target.value,
                      }));
                      setError("");
                    }}
                    placeholder="you@company.com"
                    autoComplete="username"
                  />
                </div>
              </label>

              <label>
                <span>Password</span>
                <div className="input-wrap">
                  <FiLock />
                  <input
                    type="password"
                    name="password"
                    value={signInForm.password}
                    onChange={(event) => {
                      setSignInForm((previous) => ({
                        ...previous,
                        password: event.target.value,
                      }));
                      setError("");
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>
              </label>

              {error && <p className="error-text">{error}</p>}

              <p className="login-hint">
                Demo admin: admin@flowguard.com / FlowGuard@123
              </p>

              <button
                type="submit"
                className="login-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
                <FiArrowRight className="button-icon" />
              </button>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleSignUp}>
              <div className="login-name-row">
                <label>
                  <span>First name</span>
                  <div className="input-wrap">
                    <FiUser />
                    <input
                      type="text"
                      name="first_name"
                      value={signUpForm.first_name}
                      onChange={(event) => {
                        setSignUpForm((previous) => ({
                          ...previous,
                          first_name: event.target.value,
                        }));
                        setError("");
                      }}
                      placeholder="Alex"
                      autoComplete="given-name"
                    />
                  </div>
                </label>

                <label>
                  <span>Last name</span>
                  <div className="input-wrap">
                    <input
                      type="text"
                      name="last_name"
                      value={signUpForm.last_name}
                      onChange={(event) => {
                        setSignUpForm((previous) => ({
                          ...previous,
                          last_name: event.target.value,
                        }));
                        setError("");
                      }}
                      placeholder="Morgan"
                      autoComplete="family-name"
                    />
                  </div>
                </label>
              </div>

              <label>
                <span>Username</span>
                <div className="input-wrap">
                  <FiUser />
                  <input
                    type="text"
                    name="username"
                    value={signUpForm.username}
                    onChange={(event) => {
                      setSignUpForm((previous) => ({
                        ...previous,
                        username: event.target.value,
                      }));
                      setError("");
                    }}
                    placeholder="alex.morgan"
                    autoComplete="username"
                  />
                </div>
              </label>

              <label>
                <span>Work email</span>
                <div className="input-wrap">
                  <FiMail />
                  <input
                    type="email"
                    name="email"
                    value={signUpForm.email}
                    onChange={(event) => {
                      setSignUpForm((previous) => ({
                        ...previous,
                        email: event.target.value,
                      }));
                      setError("");
                    }}
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </div>
              </label>

              <label>
                <span>Password</span>
                <div className="input-wrap">
                  <FiLock />
                  <input
                    type="password"
                    name="password"
                    value={signUpForm.password}
                    onChange={(event) => {
                      setSignUpForm((previous) => ({
                        ...previous,
                        password: event.target.value,
                      }));
                      setError("");
                    }}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                </div>
              </label>

              <label>
                <span>Confirm password</span>
                <div className="input-wrap">
                  <FiLock />
                  <input
                    type="password"
                    name="password_confirm"
                    value={signUpForm.password_confirm}
                    onChange={(event) => {
                      setSignUpForm((previous) => ({
                        ...previous,
                        password_confirm: event.target.value,
                      }));
                      setError("");
                    }}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                  />
                </div>
              </label>

              {error && <p className="error-text">{error}</p>}

              <button
                type="submit"
                className="login-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create account"}
                <FiArrowRight className="button-icon" />
              </button>
            </form>
          )}

          </div>

          <p className="login-switch">
            {isSignIn ? "New to FlowGuard?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(isSignIn ? "signup" : "signin")}
            >
              {isSignIn ? "Create an account" : "Sign in"}
            </button>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Login;
