import { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../../engine/GameEngine';
import type { GameUIState } from '../../engine/GameEngine';
import { HUDOverlay } from '../HUD/HUDOverlay';
import blissBg from '../../assets/bliss.png';

interface GameCanvasProps {
  practiceText: string;
  onBackToMenu: () => void;
}

export function GameCanvas({ practiceText, onBackToMenu }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [hudState, setHudState] = useState<GameUIState>({
    goodKeys: 0,
    missKeys: 0,
    accuracy: 100,
    wpm: 0,
    combo: 0,
    maxCombo: 0,
    elapsedTime: '0:00',
    score: 0,
    progress: 0,
    activeCard: null,
    currentWeapon: 'Bare Hands',
    currentAttack: 'None',
    practiceText,
    currentIndex: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Instantiate and start game engine with state change callback
    const engine = new GameEngine(canvas, practiceText, (updatedState) => {
      setHudState(updatedState);
    });
    engineRef.current = engine;
    engine.start();

    // Resize handling
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    // Escape key navigation handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBackToMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Initial resize trigger to fit parent properly
    handleResize();

    // Clean up on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, [onBackToMenu]);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: `url(${blissBg}) no-repeat center/cover`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Floating Exit Button */}
      <button 
        onClick={onBackToMenu}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'rgba(5, 6, 8, 0.65)',
          border: '1.5px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '4px',
          color: '#fff',
          padding: '6px 12px',
          cursor: 'pointer',
          fontFamily: 'var(--font-game)',
          fontSize: '0.75rem',
          zIndex: 30,
          pointerEvents: 'auto',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
        }}
      >
        Exit (ESC)
      </button>

      {/* Main Canvas Viewport */}
      <canvas 
        ref={canvasRef} 
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: 'crosshair',
        }}
      />

      {/* Bottom HUD overlay */}
      <HUDOverlay {...hudState} />

      {/* After-Action Report (AAR) Overlay Modal */}
      {hudState.isCompleted && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(5, 6, 8, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '90%',
              maxWidth: '500px',
              padding: '2.5rem',
              borderRadius: '12px',
              border: '2px solid #06b6d4',
              boxShadow: '0 0 35px rgba(6, 182, 212, 0.3)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-game)',
                fontSize: '2rem',
                color: '#06b6d4',
                textShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
                marginBottom: '1rem',
                letterSpacing: '2px',
              }}
            >
              TRAINING COMPLETE
            </h2>

            {/* Performance Grade */}
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                border: `3px solid ${
                  hudState.accuracy >= 95 ? '#ec4899' : '#f59e0b'
                }`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '3rem',
                fontWeight: 'bold',
                fontFamily: 'var(--font-game)',
                color: hudState.accuracy >= 95 ? '#ec4899' : '#f59e0b',
                boxShadow: `0 0 25px ${
                  hudState.accuracy >= 95 ? 'rgba(236, 72, 153, 0.4)' : 'rgba(245, 158, 11, 0.4)'
                }`,
                marginBottom: '1.5rem',
              }}
            >
              {hudState.accuracy >= 98 ? 'S' : hudState.accuracy >= 95 ? 'A' : hudState.accuracy >= 90 ? 'B' : hudState.accuracy >= 80 ? 'C' : 'D'}
            </div>

            {/* Stats Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                width: '100%',
                marginBottom: '2rem',
              }}
            >
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SPEED</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', fontFamily: 'var(--font-game)' }}>{hudState.wpm} <span style={{ fontSize: '0.8rem' }}>WPM</span></div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ACCURACY</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#06b6d4', fontFamily: 'var(--font-game)' }}>{hudState.accuracy}%</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MAX COMBO</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f97316', fontFamily: 'var(--font-game)' }}>{hudState.maxCombo}x</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TIME ELAPSED</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#a855f7', fontFamily: 'var(--font-game)' }}>{hudState.elapsedTime}</div>
              </div>
            </div>

            {/* Trouble Keys */}
            {hudState.troubleKeys && hudState.troubleKeys.length > 0 && (
              <div style={{ marginBottom: '2rem', width: '100%' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>NEEDS PRACTICE (MOST MISSED KEYS)</div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  {hudState.troubleKeys.map((key, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#0f172a',
                        border: '1.5px solid #dc2626',
                        borderRadius: '4px',
                        padding: '4px 10px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9rem',
                        color: '#f8fafc',
                        boxShadow: '0 0 8px rgba(220, 38, 38, 0.25)',
                      }}
                    >
                      {key}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button
                className="cyber-button"
                style={{ flex: 1, padding: '0.8rem', fontSize: '0.9rem' }}
                onClick={() => {
                  engineRef.current?.resetSession();
                }}
              >
                Try Again
              </button>
              <button
                className="secondary-button"
                style={{ flex: 1, padding: '0.8rem', fontSize: '0.9rem' }}
                onClick={onBackToMenu}
              >
                Configure Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
