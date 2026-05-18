import React, { useState } from 'react';
import { apiFetch } from '../api/client';
import logo from '../../../asset/logo.png';

const DOODLE_CSS = `
  .doodle-adm-wrapper {
    --ink: #323232; --paper: #e6f0ff; --bg-color: #ffffff;
    --primary-btn: #4ecdc4; --primary-btn-hover: #3bbfb6;
    --input-focus: #2d8cf0; --border-width: 2px; --shadow-offset: 4px;
    --sketch-r1: 8px 24px 8px 24px / 24px 8px 24px 8px;
    --sketch-r2: 24px 8px 24px 8px / 8px 24px 8px 24px;
    --sketch-rbtn: 16px 5px 16px 5px / 5px 16px 5px 16px;
    font-family: "Comic Sans MS","Chalkboard SE","Gochi Hand",cursive;
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; position: relative;
  }
  .doodle-adm-card {
    width: 310px;
    border: var(--border-width) solid var(--ink);
    border-radius: var(--sketch-r2);
    box-shadow: var(--shadow-offset) var(--shadow-offset) 0 var(--ink);
    background-color: var(--paper);
    background-image: repeating-linear-gradient(transparent,transparent 28px,rgba(0,0,0,.06) 28px,rgba(0,0,0,.06) 30px);
    background-position: 0 15px;
    padding: 28px 24px;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
    position: relative;
  }
  .doodle-adm-title {
    font-size: 22px; font-weight: 900; color: var(--ink);
    text-transform: uppercase; letter-spacing: 1px;
    transform: rotate(2deg); text-shadow: 1px 1px 0 rgba(0,0,0,.1);
    display: inline-block; margin-bottom: 4px;
  }
  .doodle-adm-input {
    width: 262px; height: 40px; padding: 5px 14px; box-sizing: border-box;
    font-family: inherit; font-size: 14px; font-weight: 600; color: var(--ink);
    background: var(--bg-color); border: var(--border-width) solid var(--ink);
    border-radius: var(--sketch-r1); box-shadow: 3px 3px 0 var(--ink);
    outline: none; transition: all .2s ease;
  }
  .doodle-adm-input::placeholder { color: #666; opacity: .8; }
  .doodle-adm-input:hover { transform: translateY(-2px); box-shadow: 4px 4px 0 var(--ink); }
  .doodle-adm-input:focus { border-color: var(--input-focus); border-radius: var(--sketch-r2); background: #f5f8ff; box-shadow: 4px 4px 0 var(--ink); }
  .doodle-adm-btn {
    margin-top: 6px; width: 150px; height: 42px;
    font-family: inherit; font-size: 16px; font-weight: 900; letter-spacing: 1px;
    color: var(--ink); background: var(--primary-btn);
    border: var(--border-width) solid var(--ink); border-radius: var(--sketch-rbtn);
    box-shadow: 4px 4px 0 var(--ink); cursor: pointer; transition: all .15s ease;
    transform: rotate(1deg);
  }
  .doodle-adm-btn:hover { background: var(--primary-btn-hover); transform: translateY(-2px) rotate(2deg); box-shadow: 5px 5px 0 var(--ink); }
  .doodle-adm-btn:active { transform: translate(3px,3px) rotate(0deg); box-shadow: 0 0 0 var(--ink); }
  .doodle-adm-btn:disabled { opacity: .6; cursor: not-allowed; }
  .doodle-adm-svg { position: absolute; z-index: -1; pointer-events: none; }
  .doodle-adm-star { top: -22px; right: -30px; width: 44px; height: 44px; animation: dfl-star 4s ease-in-out infinite; }
  .doodle-adm-sparkle { bottom: -18px; left: -22px; width: 36px; height: 36px; animation: dfl-sparkle 4s ease-in-out infinite 1s; }
  .doodle-adm-swirl { top: 28px; left: -28px; width: 30px; height: 30px; animation: dfl-swirl 4s ease-in-out infinite 2s; }
  .doodle-adm-badge {
    width: 54px; height: 54px; border-radius: 50%;
    border: 2px solid var(--ink); background: white;
    box-shadow: 3px 3px 0 var(--ink);
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; margin-bottom: 2px;
  }
`;

type AdminLoginProps = { onBackHome: () => void; onAdminAuthSuccess: () => void; };

export default function AdminLogin({ onBackHome, onAdminAuthSuccess }: AdminLoginProps) {
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState<string|null>(null);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setError(null);
    try {
      await apiFetch('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username: String(f.get('username')||''), password: String(f.get('password')||'') }),
        timeoutMs: 30000,
      });
      onAdminAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally { setBusy(false); }
  };

  return (
    <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px 16px', background:'linear-gradient(135deg,#e6f0ff 0%,#fff9e6 100%)' }}>
      <style>{DOODLE_CSS}</style>

      <button onClick={onBackHome} style={{ position:'fixed', top:16, left:16, zIndex:200, fontFamily:'"Comic Sans MS",cursive', fontSize:13, fontWeight:700, color:'#323232', background:'white', border:'2px solid #323232', borderRadius:'8px 20px 8px 20px/20px 8px 20px 8px', padding:'6px 14px', cursor:'pointer', boxShadow:'3px 3px 0 #323232' }}>
        ← Home
      </button>

      <div className="doodle-adm-wrapper">
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
          <img src={logo} alt="ZenMind" style={{ width:28, height:28, borderRadius:'50%', objectFit:'cover', border:'2px solid #323232' }} />
          <span style={{ fontFamily:'"Comic Sans MS",cursive', fontWeight:900, fontSize:15, color:'#323232' }}>ZenMind</span>
        </div>

        {/* Card — uses blue paper + rotate(2deg) title (signup card variant) */}
        <div className="doodle-adm-card">
          {/* SVG decorations — mirrored positions */}
          <svg className="doodle-adm-svg doodle-adm-star" viewBox="0 0 24 24" fill="#ffd166" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <svg className="doodle-adm-svg doodle-adm-sparkle" viewBox="0 0 24 24" fill="#ff6b6b" stroke="#323232" strokeWidth="1.5">
            <path d="M12 2 Q12 12 22 12 Q12 12 12 22 Q12 12 2 12 Q12 12 12 2 Z" />
          </svg>
          <svg className="doodle-adm-svg doodle-adm-swirl" viewBox="0 0 24 24" fill="none" stroke="#323232" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 12 C 3 5 10 5 16 5 C 20 5 21 9 18 12 C 15 15 10 13 12 9 C 14 5 22 9 21 16" />
          </svg>

          <div className="doodle-adm-badge">🛡️</div>
          <div className="doodle-adm-title">Admin!</div>
          <p style={{ fontSize:12, color:'#555', textAlign:'center', margin:'-6px 0 4px', fontFamily:'"Comic Sans MS",cursive' }}>
            Secure admin access only
          </p>

          <form style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, width:'100%' }} onSubmit={handleSubmit}>
            <input className="doodle-adm-input" name="username" type="text" placeholder="Admin username" required />
            <input className="doodle-adm-input" name="password" type={showPw ? 'text' : 'password'} placeholder="Password" required />

            {error && <p style={{ fontSize:11, color:'#e53e3e', fontWeight:700, textAlign:'center', maxWidth:260, margin:'-4px 0', fontFamily:'inherit' }}>{error}</p>}

            <button type="button" style={{ fontSize:11, color:'#4a7c5d', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', textDecoration:'underline', marginTop:-6 }}
              onClick={() => setShowPw(s => !s)}>
              {showPw ? 'Hide' : 'Show'} password
            </button>

            <button className="doodle-adm-btn" type="submit" disabled={busy}>
              {busy ? '...' : 'Sign In! 🔐'}
            </button>
          </form>

          <p style={{ fontSize:11, color:'#888', textAlign:'center', marginTop:4, fontFamily:'"Comic Sans MS",cursive', lineHeight:1.5 }}>
            Restricted to ZenMind administrators only.
          </p>
        </div>
      </div>
    </section>
  );
}
