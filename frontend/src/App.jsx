import ReactMarkdown from "react-markdown";
import { useState } from "react";
import "./App.css";
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

function App() {
  const [claim, setClaim] = useState("");
  const [language, setLanguage] = useState("English");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function analyzeClaim(event) {
    event.preventDefault();

    if (!claim.trim()) {
      alert("Please enter a message or claim to investigate.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claim: claim,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error("The investigation service returned an error.");
      }

      const data = await response.json();
      setResult(data);
    } catch {
      setResult({
        status: "Backend not connected",
        explanation:
          "The website is ready, but the Python investigation service is not running yet. We will connect it in the next step.",
        sources: [],
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-icon">S</span>
          <span>SatyaCheck</span>
        </a>

        <span className="topbar-label">AI-Powered Claim Investigation</span>
      </header>

      <main className="container" id="home">
        <section className="hero">
          <div className="eyebrow">
            <span className="status-dot"></span>
            MULTILINGUAL MISINFORMATION INVESTIGATOR
          </div>

          <h1>
            Before you share,
            <br />
            <span>check what's true.</span>
          </h1>

          <p className="hero-description">
            Investigate suspicious messages, viral claims, and regional-language
            forwards using AI-assisted analysis and supporting evidence.
          </p>

          <div className="trust-points">
            <span>✓ Evidence-focused</span>
            <span>✓ Multilingual-ready</span>
            <span>✓ Transparent results</span>
          </div>
        </section>

        <section className="workspace">
          <div className="form-heading">
            <div>
              <span className="section-number">01 / INVESTIGATE</span>
              <h2>What would you like to verify?</h2>
            </div>

            <span className="input-badge">TEXT INPUT</span>
          </div>

          <form onSubmit={analyzeClaim}>
            <label htmlFor="language">Choose the claim's language</label>

            <select
              id="language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Telugu</option>
              <option>Tamil</option>
              <option>Kannada</option>
              <option>Malayalam</option>
              <option>Marathi</option>
              <option>Bengali</option>
              <option>Other</option>
            </select>

            <label htmlFor="claim">Paste the message or claim here</label>

            <textarea
              id="claim"
              value={claim}
              onChange={(event) => setClaim(event.target.value)}
              placeholder="Example: A message circulating in my WhatsApp group claims that..."
              rows={6}
              maxLength={5000}
            />

            <div className="input-footer">
              <span>Don't forward it until you've investigated it.</span>
              <span>{claim.length}/5000</span>
            </div>

            <button
              className="analyze-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Investigating..." : "Investigate claim →"}
            </button>
          </form>
        </section>

        <section className="how-it-works">
          <span className="section-number">02 / OUR APPROACH</span>
          <h2>Evidence before conclusions.</h2>

          <div className="feature-grid">
            <article className="feature-card">
              <span className="feature-icon">01</span>
              <h3>Analyze</h3>
              <p>
                Examine the submitted claim and identify signals that need
                further investigation.
              </p>
            </article>

            <article className="feature-card">
              <span className="feature-icon">02</span>
              <h3>Find evidence</h3>
              <p>
                Look for relevant reporting and supporting sources instead of
                relying on a label alone.
              </p>
            </article>

            <article className="feature-card">
              <span className="feature-icon">03</span>
              <h3>Explain</h3>
              <p>
                Present findings and limitations so people can make more
                informed sharing decisions.
              </p>
            </article>
          </div>
        </section>

        {result && (
          <section className="results">
            <span className="section-number">03 / INVESTIGATION REPORT</span>
            <h2>Investigation results</h2>

            <div className="result-card">
              <h3>{result.status || "Analysis complete"}</h3>
              <div className="report-text">
  <ReactMarkdown>
    {result.explanation ||
      result.message ||
      "The investigation has returned a result."}
  </ReactMarkdown>
</div>
<p className="official-note">
  For news or government-related claims, also check official sources such as{" "}
  <a href="https://pib.gov.in" target="_blank" rel="noreferrer">
    PIB (pib.gov.in)
  </a>{" "}
  or the relevant ministry's website.
</p>

              {result.sources?.length > 0 && (
                <div className="sources">
                  <h4>Potentially relevant sources</h4>

                  {result.sources.map((source, index) => (
                    <div className="source-item" key={index}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {source.title || source.url}
                      </a>
                    </div>
                  ))}
                </div>
              )}

              <p className="disclaimer">
                AI-assisted analysis is not proof. Review the original sources
                before deciding whether a claim is accurate.
              </p>
            </div>
          </section>
        )}

        <footer>
          <a className="footer-brand" href="#home">
            SatyaCheck
          </a>
          <p>Think critically. Check the evidence. Share responsibly.</p>
          <span>AI-assisted investigation · Not a definitive truth verdict</span>
        </footer>
      </main>
    </div>
  );
}

export default App;