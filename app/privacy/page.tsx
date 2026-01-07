'use client'

export default function PrivacyPolicy() {
  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px',
        fontFamily: 'system-ui, sans-serif',
        lineHeight: 1.6,
        color: '#333',
        overflow: 'auto',
        height: '100vh',
      }}
    >
      <h1 style={{ color: '#111', marginBottom: '24px' }}>Privacy Policy</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>Last updated: January 2025</p>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#222', fontSize: '1.25rem', marginBottom: '12px' }}>1. Information We Collect</h2>
        <p>When you use runrunrunner, we collect the following information:</p>
        <ul style={{ marginLeft: '20px' }}>
          <li><strong>Farcaster ID (FID):</strong> Your unique identifier on the Farcaster network</li>
          <li><strong>Username and Display Name:</strong> Your public Farcaster profile information</li>
          <li><strong>Game Scores:</strong> Your scores and game statistics</li>
          <li><strong>Wallet Address:</strong> If you win a prize, we collect your Ethereum wallet address for payouts</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#222', fontSize: '1.25rem', marginBottom: '12px' }}>2. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul style={{ marginLeft: '20px' }}>
          <li>Display your scores on the public leaderboard</li>
          <li>Track your game statistics and progress</li>
          <li>Send prize payouts to winners</li>
          <li>Prevent cheating and abuse</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#222', fontSize: '1.25rem', marginBottom: '12px' }}>3. Public Information</h2>
        <p>
          The following information is publicly visible to all users:
        </p>
        <ul style={{ marginLeft: '20px' }}>
          <li>Your username and display name on leaderboards</li>
          <li>Your game scores and rankings</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#222', fontSize: '1.25rem', marginBottom: '12px' }}>4. Data Storage</h2>
        <p>
          Your data is stored securely using Vercel KV (Redis). Game sessions expire after 10 minutes.
          Leaderboard data is retained for tracking daily contests and historical performance.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#222', fontSize: '1.25rem', marginBottom: '12px' }}>5. Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul style={{ marginLeft: '20px' }}>
          <li><strong>Neynar:</strong> For Farcaster authentication and user data</li>
          <li><strong>Base Network:</strong> For cryptocurrency prize payouts</li>
          <li><strong>Vercel:</strong> For hosting and data storage</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#222', fontSize: '1.25rem', marginBottom: '12px' }}>6. Data Retention</h2>
        <p>
          We retain your game data for as long as the service is operational. You may request deletion
          of your data by contacting us.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#222', fontSize: '1.25rem', marginBottom: '12px' }}>7. Your Rights</h2>
        <p>You have the right to:</p>
        <ul style={{ marginLeft: '20px' }}>
          <li>Access your personal data</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#222', fontSize: '1.25rem', marginBottom: '12px' }}>8. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify users of any material
          changes by updating the date at the top of this page.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#222', fontSize: '1.25rem', marginBottom: '12px' }}>9. Contact</h2>
        <p>
          For privacy-related questions, please reach out via Farcaster.
        </p>
      </section>

      <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
        <a href="/" style={{ color: '#7c3aed', textDecoration: 'none' }}>
          ← Back to Game
        </a>
      </div>
    </div>
  )
}
