interface HUDOverlayProps {
  goodKeys: number;
  missKeys: number;
  accuracy: number;
  wpm: number;
  combo: number;
  maxCombo: number;
  elapsedTime: string;
  score: number;
  progress: number; // 0 to 100
  activeCard: 'TAB' | '1' | '2' | '3' | '4' | null;
  currentWeapon: string;
  currentAttack: string;
  practiceText: string;
  currentIndex: number;
}

export function HUDOverlay({
  goodKeys,
  missKeys,
  accuracy,
  wpm,
  combo,
  maxCombo,
  elapsedTime,
  score,
  progress,
  activeCard,
  currentWeapon,
  currentAttack,
  practiceText,
  currentIndex,
}: HUDOverlayProps) {
  // Format score to 6 digit padded string
  const formattedScore = score.toLocaleString('en-US', {
    minimumIntegerDigits: 6,
    useGrouping: true,
  });

  const charsRemaining = practiceText.length - currentIndex;
  
  // Calculate combo score multiplier: 1x to 4x max
  const multiplier = Math.min(4, Math.floor(combo / 10) + 1);

  // Split practice text for highlighting
  const textBefore = practiceText.substring(0, currentIndex);
  const textCurrent = practiceText[currentIndex] || '';
  const textAfter = practiceText.substring(currentIndex + 1);

  return (
    <>
      {/* Monospace Code Practice Board (Floating Top-Center) */}
      <div 
        style={{
          position: 'absolute',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '800px',
          background: 'rgba(5, 6, 8, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '16px 20px',
          color: '#64748b', // Slate Gray
          fontFamily: 'var(--font-mono)',
          fontSize: '0.95rem',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          textAlign: 'left',
          boxShadow: '0 15px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          maxHeight: '160px',
          overflowY: 'auto',
          pointerEvents: 'auto',
          zIndex: 25,
        }}
      >
        <span style={{ color: '#10b981', fontWeight: 600 }}>{textBefore}</span>
        {textCurrent && (
          <span 
            style={{ 
              background: '#dc2626', 
              color: '#ffffff', 
              padding: '0 2px', 
              borderRadius: '2px',
              boxShadow: '0 0 6px rgba(220, 38, 38, 0.9)',
              fontWeight: 700,
            }}
          >
            {textCurrent === '\n' ? '↵\n' : textCurrent}
          </span>
        )}
        <span style={{ color: '#94a3b8' }}>{textAfter}</span>
      </div>

      {/* Stats and Controls Panel (Bottom-Left) */}
      <div 
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      >
        {/* 1. Accuracy, WPM, and remaining character statistics */}
        <div className="hud-text" style={{ fontSize: '0.9rem', marginBottom: '2px', display: 'flex', gap: '12px' }}>
          <span>{goodKeys} GOOD</span>
          <span>/</span>
          <span>{missKeys} MISS</span>
          <span>/</span>
          <span>{accuracy}% ACC</span>
          <span>/</span>
          <span>{wpm} WPM</span>
          <span>/</span>
          <span style={{ color: multiplier > 1 ? '#f59e0b' : 'inherit', fontWeight: multiplier > 1 ? 600 : 'normal' }}>
            {multiplier}x MULT
          </span>
          <span>/</span>
          <span>{charsRemaining} LEFT</span>
          <span>/</span>
          <span>{elapsedTime}</span>
        </div>

        {/* Weapon & Attack info */}
        <div 
          className="hud-text" 
          style={{ 
            fontSize: '0.8rem', 
            color: 'var(--accent-cyan)', 
            marginBottom: '6px', 
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}
        >
          WEAPON: <span style={{ color: '#fff' }}>{currentWeapon}</span> | 
          ATTACK: <span style={{ color: '#fff' }}>{currentAttack || 'None'}</span>
        </div>

        {/* Combo meter feedback */}
        {combo > 0 && (
          <div 
            className="hud-text" 
            style={{ 
              fontSize: '1.2rem', 
              color: '#f59e0b', 
              marginBottom: '4px',
              textShadow: '0 0 10px rgba(245, 158, 11, 0.6)',
              animation: 'titlePulse 0.3s ease infinite alternate'
            }}
          >
            COMBO: {combo}x <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>(MAX: {maxCombo})</span>
          </div>
        )}

        {/* 2. Score counter */}
        <div className="hud-score" style={{ marginBottom: '6px' }}>
          {formattedScore}
        </div>

        {/* 3. Progress Slider Bar */}
        <div className="hud-bar-container">
          <div className="hud-bar-fill" style={{ width: `${progress}%` }} />
          <div className="hud-bar-knob" style={{ left: `${progress}%` }} />
        </div>

        {/* 4. Cooldown Cards & Heart row */}
        <div className="hud-card-row">
          {/* Life Heart */}
          <div className="hud-heart-container">
            <span className="hud-heart">❤️</span>
          </div>

          {/* Action Card 1 (TAB) */}
          <div className={`hud-card ${activeCard === 'TAB' ? 'active-card' : ''}`}>
            <div className="hud-card-cooldown">10</div>
            <div className="hud-card-icon">
              <svg width="34" height="42" viewBox="0 0 40 40">
                <circle cx="20" cy="10" r="3" stroke="black" strokeWidth="2" fill="none"/>
                <line x1="20" y1="13" x2="20" y2="23" stroke="black" strokeWidth="2"/>
                <line x1="20" y1="16" x2="12" y2="12" stroke="black" strokeWidth="2"/>
                <line x1="20" y1="16" x2="28" y2="12" stroke="black" strokeWidth="2"/>
                <line x1="20" y1="23" x2="14" y2="33" stroke="black" strokeWidth="2"/>
                <line x1="20" y1="23" x2="26" y2="33" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
            <div className="hud-card-key">TAB</div>
          </div>

          {/* Action Card 2 (1) */}
          <div className={`hud-card ${activeCard === '1' ? 'active-card' : ''}`}>
            <div className="hud-card-cooldown">3</div>
            <div className="hud-card-icon">
              <svg width="34" height="42" viewBox="0 0 40 40">
                <circle cx="20" cy="11" r="3" stroke="black" strokeWidth="2" fill="none"/>
                <line x1="20" y1="14" x2="20" y2="24" stroke="black" strokeWidth="2"/>
                <line x1="20" y1="17" x2="14" y2="20" stroke="black" strokeWidth="2"/>
                <line x1="20" y1="17" x2="26" y2="20" stroke="black" strokeWidth="2"/>
                <line x1="20" y1="24" x2="16" y2="34" stroke="black" strokeWidth="2"/>
                <line x1="20" y1="24" x2="24" y2="34" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
            <div className="hud-card-key blue-key">1</div>
          </div>

          {/* Action Card 3 (2) */}
          <div className={`hud-card ${activeCard === '2' ? 'active-card' : ''}`}>
            <div className="hud-card-cooldown">3</div>
            <div className="hud-card-icon">
              <svg width="34" height="42" viewBox="0 0 40 40">
                <circle cx="16" cy="18" r="3" stroke="black" strokeWidth="2" fill="none"/>
                <line x1="16" y1="21" x2="22" y2="26" stroke="black" strokeWidth="2"/>
                <line x1="18" y1="23" x2="10" y2="20" stroke="black" strokeWidth="2"/>
                <line x1="18" y1="23" x2="26" y2="22" stroke="black" strokeWidth="2"/>
                <line x1="22" y1="26" x2="14" y2="34" stroke="black" strokeWidth="2"/>
                <line x1="22" y1="26" x2="30" y2="32" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
            <div className="hud-card-key">2</div>
          </div>

          {/* Action Card 4 (3) */}
          <div className={`hud-card ${activeCard === '3' ? 'active-card' : ''}`}>
            <div className="hud-card-cooldown">3</div>
            <div className="hud-card-icon">
              <svg width="34" height="42" viewBox="0 0 40 40">
                <circle cx="20" cy="11" r="3" stroke="black" strokeWidth="2" fill="none"/>
                <line x1="20" y1="14" x2="20" y2="24" stroke="black" strokeWidth="2"/>
                <line x1="20" y1="17" x2="12" y2="19" stroke="black" strokeWidth="2"/>
                <line x1="20" y1="17" x2="28" y2="19" stroke="black" strokeWidth="2"/>
                <line x1="20" y1="24" x2="15" y2="34" stroke="black" strokeWidth="2"/>
                <line x1="20" y1="24" x2="25" y2="34" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
            <div className="hud-card-key">3</div>
          </div>

          {/* Action Card 5 (4) */}
          <div className={`hud-card ${activeCard === '4' ? 'active-card' : ''}`}>
            <div className="hud-card-cooldown">3</div>
            <div className="hud-card-icon">
              <svg width="34" height="42" viewBox="0 0 40 40">
                <circle cx="20" cy="10" r="3" stroke="black" strokeWidth="2" fill="none"/>
                <line x1="20" y1="13" x2="20" y2="23" stroke="black" strokeWidth="2"/>
                <line x1="20" y1="15" x2="13" y2="15" stroke="black" strokeWidth="2"/>
                <line x1="20" y1="15" x2="27" y2="13" stroke="black" strokeWidth="2"/>
                <line x1="20" y1="23" x2="17" y2="33" stroke="black" strokeWidth="2"/>
                <line x1="20" y1="23" x2="23" y2="33" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
            <div className="hud-card-key">4</div>
          </div>
        </div>
      </div>
    </>
  );
}
