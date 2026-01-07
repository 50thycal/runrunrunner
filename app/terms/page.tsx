'use client'

export default function TermsOfService() {
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
      <h1 style={{ color: '#111', marginBottom: '24px' }}>Terms of Service</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>Last updated: January 2025</p>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#222', fontSize: '1.25rem', marginBottom: '12px' }}>1. Acceptance of Terms</h2>
        <p>
          By accessing and playing runrunrunner, you agree to be bound by these Terms of Service.
          If you do not agree to these terms, please do not use the game.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#222', fontSize: '1.25rem', marginBottom: '12px' }}>2. Description of Service</h2>
        <p>
          runrunrunner is a free-to-play endless runner game built as a Farcaster Mini App.
          The game features daily leaderboards with cryptocurrency prizes for top performers.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#222', fontSize: '1.25rem', marginBottom: '12px' }}>3. User Requirements</h2>
        <p>To use runrunrunner, you must:</p>
        <ul style={{ marginLeft: '20px' }}>
          <li>Have a valid Farcaster account</li>
          <li>Be at least 18 years old or the age of majority in your jurisdiction</li>
          <li>Not be prohibited from receiving cryptocurrency in your jurisdiction</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#222', fontSize: '1.25rem', marginBottom: '12px' }}>4. Fair Play</h2>
        <p>You agree to:</p>
        <ul style={{ marginLeft: '20px' }}>
          <li>Play the game fairly without using cheats, bots, or automation</li>
          <li>Not manipulate scores or exploit bugs</li>
          <li>Not attempt to interfere with other players or the game infrastructure</li>
        </ul>
        <p style={{ marginTop: '12px' }}>
          We reserve the right to disqualify any player suspected of cheating and withhold prizes.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#222', fontSize: '1.25rem', marginBottom: '12px' }}>5. Prizes and Payouts</h2>
        <ul style={{ marginLeft: '20px' }}>
          <li>Daily prizes are awarded to the top 3 players on the leaderboard</li>
          <li>Prizes are paid in ETH on the Base network</li>
          <li>Prize amounts are subject to change without notice</li>
          <li>Winners must have a valid Ethereum wallet address linked to their Farcaster account</li>
          <li>Payouts are processed automatically after each contest day ends</li>
          <li>We are not responsible for failed transactions due to incorrect wallet addresses</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#222', fontSize: '1.25rem', marginBottom: '12px' }}>6. Rate Limits</h2>
        <p>
          To ensure fair play and system stability, players are limited to 10 games per hour.
          Exceeding this limit may result in temporary restrictions.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#222', fontSize: '1.25rem', marginBottom: '12px' }}>7. Disclaimer of Warranties</h2>
        <p>
          The game is provided as is without warranties of any kind. We do not guarantee:
        </p>
        <ul style={{ marginLeft: '20px' }}>
          <li>Continuous or uninterrupted access to the game</li>
          <li>That the game will be error-free</li>
          <li>Specific prize amounts or payout timing</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#222', fontSize: '1.25rem', marginBottom: '12px' }}>8. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, we shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages resulting from your use of
          the game, including but not limited to loss of cryptocurrency or prizes.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#222', fontSize: '1.25rem', marginBottom: '12px' }}>9. Changes to Service</h2>
        <p>
          We reserve the right to modify, suspend, or discontinue the game at any time without
          notice. This includes changes to prize structures, game mechanics, and these terms.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#222', fontSize: '1.25rem', marginBottom: '12px' }}>10. Termination</h2>
        <p>
          We reserve the right to terminate or suspend access to the game for any user who
          violates these terms or engages in behavior we deem inappropriate.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#222', fontSize: '1.25rem', marginBottom: '12px' }}>11. Governing Law</h2>
        <p>
          These terms shall be governed by and construed in accordance with applicable laws,
          without regard to conflict of law principles.
        </p>
      </section>

      <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
        <a href="/" style={{ color: '#7c3aed', textDecoration: 'none' }}>
          ← Back to Game
        </a>
        {' | '}
        <a href="/privacy" style={{ color: '#7c3aed', textDecoration: 'none' }}>
          Privacy Policy
        </a>
      </div>
    </div>
  )
}
