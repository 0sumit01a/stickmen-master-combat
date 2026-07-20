import { useState } from 'react';
import { GameCanvas } from './features/GameCanvas/GameCanvas';

type ScreenState = 'MENU' | 'SETUP' | 'PLAYING' | 'OPTIONS' | 'HOW_TO_PLAY';

const PRESETS = [
  {
    name: 'TypeScript',
    text: `const hello = async () => {
    console.log("Hello");
}`
  },
  {
    name: 'Python FastAPI',
    text: `@app.get("/items/{id}")
def read_item(id: int, q: str = None):
    return {"id": id, "q": q}`
  },
  {
    name: 'SQL Join Query',
    text: `SELECT users.id, posts.title 
FROM users 
INNER JOIN posts ON users.id = posts.user_id;`
  },
  {
    name: 'Paragraph',
    text: `The quick brown fox jumps over the lazy dog. Focus on accuracy first, speed will follow naturally with consistency and practice.`
  }
];

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('MENU');
  const [practiceText, setPracticeText] = useState(PRESETS[0].text);

  const startSetup = () => {
    setCurrentScreen('SETUP');
  };

  const launchGame = () => {
    // If empty text, fallback to default
    if (!practiceText.trim()) {
      setPracticeText(PRESETS[0].text);
    }
    setCurrentScreen('PLAYING');
  };

  if (currentScreen === 'PLAYING') {
    return (
      <GameCanvas 
        practiceText={practiceText} 
        onBackToMenu={() => setCurrentScreen('SETUP')} 
      />
    );
  }

  return (
    <div className="screen-container">
      {currentScreen === 'MENU' && (
        <div className="glass-panel">
          <h1 className="game-title">Typing Warrior</h1>
          <h2 className="game-subtitle">Stickman Showdown</h2>

          <div className="menu-actions">
            <button className="cyber-button" onClick={startSetup}>
              Start Game
            </button>
            <button 
              className="secondary-button" 
              onClick={() => setCurrentScreen('HOW_TO_PLAY')}
            >
              How to Play
            </button>
            <button 
              className="secondary-button" 
              onClick={() => setCurrentScreen('OPTIONS')}
            >
              Options
            </button>
          </div>

          <div className="footer-info">
            v1.0.0-alpha • Press <span className="highlight">ENTER</span> to quickstart
          </div>
        </div>
      )}

      {currentScreen === 'SETUP' && (
        <div className="glass-panel" style={{ maxWidth: '600px', width: '90%' }}>
          <h2 className="game-subtitle" style={{ marginBottom: '1rem' }}>Setup Practice Text</h2>
          
          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                className="secondary-button"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                onClick={() => setPracticeText(preset.text)}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Paste Textarea */}
          <textarea
            value={practiceText}
            onChange={(e) => setPracticeText(e.target.value)}
            placeholder="Paste your code snippet or text paragraph here..."
            style={{
              width: '100%',
              height: '180px',
              background: '#07080b',
              border: '1.5px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#fff',
              padding: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              outline: 'none',
              marginBottom: '1.5rem',
              resize: 'none',
            }}
          />

          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <button 
              className="cyber-button" 
              style={{ flex: 1, padding: '1rem' }} 
              onClick={launchGame}
            >
              Start Training
            </button>
            <button 
              className="secondary-button" 
              style={{ flex: 0.5, padding: '1rem' }} 
              onClick={() => setCurrentScreen('MENU')}
            >
              Back
            </button>
          </div>
        </div>
      )}



      {currentScreen === 'HOW_TO_PLAY' && (
        <div className="glass-panel">
          <h2 className="game-subtitle" style={{ marginBottom: '1.5rem' }}>How to Play</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center', lineHeight: '1.6' }}>
            Setup your text snippet, then type characters as highlighted to attack the dummy! <br />
            Correct keypresses trigger player slashes and cosmetic weapon cycles. <br />
            Press ESC or click Exit to return to setup.
          </p>
          <button 
            className="secondary-button" 
            onClick={() => setCurrentScreen('MENU')}
          >
            Back to Menu
          </button>
        </div>
      )}

      {currentScreen === 'OPTIONS' && (
        <div className="glass-panel">
          <h2 className="game-subtitle" style={{ marginBottom: '1.5rem' }}>Options</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Settings, audio controls, and difficulty configurations will be available here.
          </p>
          <button 
            className="secondary-button" 
            onClick={() => setCurrentScreen('MENU')}
          >
            Back to Menu
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
