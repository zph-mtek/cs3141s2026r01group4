import React from 'react'
import './Guidelines.css'

const Guidelines = () => {
  return (
    <main className="legal-page">
      <div className="legal-shell">
        <header className="legal-header">
          <h1>Community Guidelines</h1>
          <p className="legal-date">Last Updated: March 25, 2026</p>
          <p className="legal-intro">
            These guidelines help keep HuskyRentLens respectful, useful, and trustworthy for
            students and landlords browsing housing information.
          </p>
        </header>

        <section className="legal-content">
          <section className="legal-section">
            <h2>1. Respectful Conduct</h2>
            <p>
              Treat other users with respect. Harassment, threats, discriminatory language,
              or abusive behavior is not allowed.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Honest Listings</h2>
            <p>
              Property details should be accurate and clearly presented. Misleading or false
              information may be removed.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Review Integrity</h2>
            <p>
              Reviews must reflect real experiences. Fake, retaliatory, or defamatory reviews
              are not permitted.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Prohibited Content</h2>
            <p>The following content is not allowed on the platform:</p>
            <ul>
              <li>Illegal material or encouragement of illegal activity</li>
              <li>Hate speech, harassment, or discriminatory remarks</li>
              <li>Spam, scams, or excessive promotional content</li>
              <li>Private information shared without permission</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Consequences</h2>
            <p>
              Violations may lead to content removal, account restrictions, or permanent
              account termination depending on severity.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Report a Violation</h2>
            <p>
              If you believe content or behavior breaks these guidelines, contact us at{' '}
              <a href="mailto:zphorsch@mtu.edu">zphorsch@mtu.edu</a>.
            </p>
          </section>
        </section>
      </div>
    </main>
  )
}

export default Guidelines
