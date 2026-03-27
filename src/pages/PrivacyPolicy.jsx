import React from 'react'

const PrivacyPolicy = () => {
  return (
    <main className="legal-page">
      <div className="legal-shell">
        <header className="legal-header">
          <h1>Privacy Policy</h1>
          <p className="legal-date">Last Updated: March 25, 2026</p>
          <p className="legal-intro">
            We want students and landlords to understand what information is collected,
            why it is used, and the choices available when using HuskyRentLens.
          </p>
        </header>

        <section className="legal-content">
          <section className="legal-section">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information that helps us create accounts, display housing
              listings, and support reviews.
            </p>
            <ul>
              <li>Account registration details such as name and email</li>
              <li>Profile information you choose to share</li>
              <li>Property listings, ratings, and written reviews</li>
              <li>Messages or support requests sent to the team</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>2. How We Use Your Information</h2>
            <p>Your information is used to operate the platform and improve the experience.</p>
            <ul>
              <li>Create and manage user accounts</li>
              <li>Publish listings, ratings, and review content</li>
              <li>Respond to issues, reports, or support questions</li>
              <li>Improve reliability, security, and usability</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Data Security</h2>
            <p>
              We use reasonable safeguards to protect account and platform data. While no
              system can promise perfect security, we work to reduce risk and protect user
              information from misuse.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Your Rights and Choices</h2>
            <p>
              You may request changes to your personal information or ask questions about
              the data connected to your account.
            </p>
            <ul>
              <li>Review or update your account details</li>
              <li>Request deletion of personal information when applicable</li>
              <li>Contact the team with privacy concerns</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Contact Us</h2>
            <p>
              If you have questions about this policy, want to report a privacy issue, or
              need help with your account data, contact us at{' '}
              <a href="mailto:zphorsch@mtu.edu">zphorsch@mtu.edu</a>.
            </p>
          </section>
        </section>
      </div>
    </main>
  )
}

export default PrivacyPolicy