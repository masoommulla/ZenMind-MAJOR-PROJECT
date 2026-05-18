import React, { useEffect, useState } from 'react';
import logo from '../../../asset/logo.png';

type AuthPageProps = { onBackHome: () => void; onAuthSuccess: () => void; };

const CSS = `
  .doodle-wrapper {
    --ink: #323232; --paper-front: #fff9e6; --paper-back: #e6f0ff;
    --bg-color: #ffffff; --primary-btn: #ff6b6b; --primary-btn-hover: #ff5252;
    --secondary-btn: #4ecdc4; --secondary-btn-hover: #3bbfb6;
    --switch-bg: #ffe66d; --input-focus: #2d8cf0;
    --card-width: 310px; --card-height: 500px;
    --input-width: 260px; --input-height: 40px;
    --btn-width: 130px; --btn-height: 42px;
    --border-width: 2px; --shadow-offset: 4px;
    --sketch-r1: 8px 24px 8px 24px / 24px 8px 24px 8px;
    --sketch-r2: 24px 8px 24px 8px / 8px 24px 8px 24px;
    --sketch-rbtn: 16px 5px 16px 5px / 5px 16px 5px 16px;
    font-family: "Comic Sans MS","Chalkboard SE","Gochi Hand",cursive;
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; position: relative; box-sizing: border-box;
  }
  .doodle-toggle { position: absolute; opacity: 0; width: 0; height: 0; }
  .doodle-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; z-index: 5; }
  .doodle-mode-text { font-size: 18px; font-weight: bold; color: var(--ink); transition: opacity 0.3s; }
  .doodle-toggle:not(:checked) ~ .doodle-header .signup-text { opacity: 0.45; }
  .doodle-toggle:checked ~ .doodle-header .login-text { opacity: 0.45; }
  .doodle-switch-label {
    position: relative; display: inline-block; width: 50px; height: 24px;
    background-color: var(--switch-bg); border: var(--border-width) solid var(--ink);
    border-radius: 20px; cursor: pointer; box-shadow: 2px 2px 0 var(--ink);
    transition: transform .1s, box-shadow .1s;
  }
  .doodle-switch-label:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
  .doodle-switch-handle {
    position: absolute; top: 2px; left: 3px; width: 16px; height: 16px;
    background: var(--bg-color); border: var(--border-width) solid var(--ink); border-radius: 50%;
    transition: transform .4s cubic-bezier(.68,-.55,.265,1.55);
  }
  .doodle-toggle:checked ~ .doodle-header .doodle-switch-label .doodle-switch-handle { transform: translateX(24px); }
  .doodle-card-scene {
    position: relative; perspective: 1000px;
    width: var(--card-width); height: var(--card-height); z-index: 2;
  }
  .doodle-svg { position: absolute; z-index: -1; pointer-events: none; }
  .doodle-star { top: -25px; left: -35px; width: 48px; height: 48px; animation: dfl-star 4s ease-in-out infinite; }
  .doodle-sparkle { bottom: -20px; right: -25px; width: 40px; height: 40px; animation: dfl-sparkle 4s ease-in-out infinite 1s; }
  .doodle-swirl { top: 30px; right: -30px; width: 32px; height: 32px; animation: dfl-swirl 4s ease-in-out infinite 2s; }
  @keyframes dfl-star { 0%,100%{transform:translateY(0) rotate(-15deg)} 50%{transform:translateY(-8px) rotate(-10deg)} }
  @keyframes dfl-sparkle { 0%,100%{transform:translateY(0) rotate(10deg)} 50%{transform:translateY(-8px) rotate(15deg)} }
  @keyframes dfl-swirl { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(5deg)} }
  .doodle-card-inner {
    width: 100%; height: 100%; position: relative;
    transform-style: preserve-3d;
    transition: transform .8s cubic-bezier(.4,.2,.2,1);
  }
  .doodle-toggle:checked ~ .doodle-card-scene .doodle-card-inner { transform: rotateY(180deg); }
  .doodle-card-front, .doodle-card-back {
    position: absolute; width: 100%; height: 100%;
    backface-visibility: hidden; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 18px; box-sizing: border-box;
    border: var(--border-width) solid var(--ink);
    border-radius: var(--sketch-r1);
    box-shadow: var(--shadow-offset) var(--shadow-offset) 0 var(--ink);
    background-image: repeating-linear-gradient(transparent,transparent 28px,rgba(0,0,0,.06) 28px,rgba(0,0,0,.06) 30px);
    background-position: 0 15px; overflow-y: auto;
  }
  .doodle-card-front { background-color: var(--paper-front); }
  .doodle-card-back { background-color: var(--paper-back); transform: rotateY(180deg); border-radius: var(--sketch-r2); }
  .doodle-title {
    font-size: 23px; font-weight: 900; color: var(--ink);
    margin: 6px 0 16px; text-transform: uppercase; letter-spacing: 1px;
    transform: rotate(-3deg); text-shadow: 1px 1px 0 rgba(0,0,0,.1);
    display: inline-block; flex-shrink: 0;
  }
  .doodle-title-alt { transform: rotate(2deg); margin: 0 0 12px; }
  .doodle-form { display: flex; flex-direction: column; gap: 12px; width: 100%; align-items: center; }
  .doodle-input {
    width: var(--input-width); height: var(--input-height);
    padding: 5px 14px; box-sizing: border-box; font-family: inherit;
    font-size: 14px; font-weight: 600; color: var(--ink);
    background: var(--bg-color); border: var(--border-width) solid var(--ink);
    border-radius: var(--sketch-r1); box-shadow: 3px 3px 0 var(--ink);
    outline: none; transition: all .2s ease;
  }
  .doodle-input::placeholder { color: #666; opacity: .8; }
  .doodle-input:hover { transform: translateY(-2px); box-shadow: 4px 4px 0 var(--ink); }
  .doodle-input:focus { border-color: var(--input-focus); border-radius: var(--sketch-r2); background: #fffdf5; box-shadow: 4px 4px 0 var(--ink); }
  .doodle-btn {
    margin: 8px 0; width: var(--btn-width); height: var(--btn-height);
    font-family: inherit; font-size: 16px; font-weight: 900; letter-spacing: 1px;
    color: var(--ink); background: var(--primary-btn);
    border: var(--border-width) solid var(--ink); border-radius: var(--sketch-rbtn);
    box-shadow: 4px 4px 0 var(--ink); cursor: pointer; transition: all .15s ease;
    transform: rotate(-1deg);
  }
  .doodle-btn-alt { background: var(--secondary-btn); transform: rotate(1deg); }
  .doodle-btn:hover { background: var(--primary-btn-hover); transform: translateY(-2px) rotate(-2deg); box-shadow: 5px 5px 0 var(--ink); }
  .doodle-btn-alt:hover { background: var(--secondary-btn-hover); transform: translateY(-2px) rotate(2deg); }
  .doodle-btn:active { transform: translate(3px,3px) rotate(0deg); box-shadow: 0 0 0 var(--ink); }
  .doodle-btn:disabled { opacity: .6; cursor: not-allowed; }
  .doodle-card-scene:hover .doodle-title { animation: doodle-wiggle .5s ease-in-out; }
  @keyframes doodle-wiggle {
    0%,100%{transform:rotate(-3deg)} 25%{transform:rotate(2deg)}
    50%{transform:rotate(-4deg)} 75%{transform:rotate(1deg)}
  }
  .doodle-link { font-family:inherit; font-size:12px; color:#4a7c5d; background:none; border:none; cursor:pointer; text-decoration:underline; }
  .doodle-err { font-size:11px; color:#e53e3e; font-weight:700; text-align:center; max-width:260px; }
  .doodle-ok  { font-size:11px; color:#0d5d3a; font-weight:700; text-align:center; }
  .doodle-small-input { width:120px; }
  .doodle-row { display:flex; gap:8px; align-items:center; }
`;

export default function AuthPage({ onBackHome, onAuthSuccess }: AuthPageProps) {
  const [mode, setMode]         = useState<'login'|'signup'>('login');
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState<string|null>(null);
  const [showPw, setShowPw]     = useState(false);
  const [showFpPw, setShowFpPw] = useState(false);
  const [otpSeconds, setOtpSeconds] = useState(0);
  const [fp, setFp] = useState({ open:false, phone:'', code:'', newPassword:'', step:'phone' as 'phone'|'verify'|'reset' });
  const [fpMsg, setFpMsg] = useState<{text:string;ok:boolean}|null>(null);

  useEffect(() => {
    if (otpSeconds <= 0) return;
    const t = window.setInterval(() => setOtpSeconds(s => Math.max(0, s-1)), 1000);
    return () => window.clearInterval(t);
  }, [otpSeconds]);

  const resetFp = () => { setFp({ open:false, phone:'', code:'', newPassword:'', step:'phone' }); setFpMsg(null); setOtpSeconds(0); };

  const switchMode = (signup: boolean) => { setMode(signup ? 'signup' : 'login'); setError(null); resetFp(); };

  return (
    <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px 16px', background:'linear-gradient(135deg,#fff9e6 0%,#e6f0ff 100%)' }}>
      <style>{CSS}</style>

      {/* Back home */}
      <button onClick={onBackHome} style={{ position:'fixed', top:16, left:16, zIndex:200, fontFamily:'"Comic Sans MS",cursive', fontSize:13, fontWeight:700, color:'#323232', background:'white', border:'2px solid #323232', borderRadius:'8px 20px 8px 20px/20px 8px 20px 8px', padding:'6px 14px', cursor:'pointer', boxShadow:'3px 3px 0 #323232' }}>
        ← Home
      </button>

      <div className="doodle-wrapper">
        {/* Controlled checkbox */}
        <input type="checkbox" id="doodle-flip" className="doodle-toggle"
          checked={mode === 'signup'}
          onChange={e => switchMode(e.target.checked)} />

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <img src={logo} alt="ZenMind" style={{ width:28, height:28, borderRadius:'50%', objectFit:'cover', border:'2px solid #323232' }} />
          <span style={{ fontFamily:'"Comic Sans MS",cursive', fontWeight:900, fontSize:15, color:'#323232' }}>ZenMind</span>
        </div>

        <div className="doodle-header">
          <span className="doodle-mode-text login-text">Log in</span>
          <label className="doodle-switch-label" htmlFor="doodle-flip">
            <span className="doodle-switch-handle" />
          </label>
          <span className="doodle-mode-text signup-text">Sign up</span>
        </div>

        {/* Card scene */}
        <div className="doodle-card-scene">
          <svg className="doodle-svg doodle-star" viewBox="0 0 24 24" fill="#ffd166" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <svg className="doodle-svg doodle-sparkle" viewBox="0 0 24 24" fill="#06d6a0" stroke="#323232" strokeWidth="1.5">
            <path d="M12 2 Q12 12 22 12 Q12 12 12 22 Q12 12 2 12 Q12 12 12 2 Z" />
          </svg>
          <svg className="doodle-svg doodle-swirl" viewBox="0 0 24 24" fill="none" stroke="#323232" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 12 C 3 5 10 5 16 5 C 20 5 21 9 18 12 C 15 15 10 13 12 9 C 14 5 22 9 21 16" />
          </svg>

          <div className="doodle-card-inner">

            {/* ── FRONT: Login / Forgot Password ── */}
            <div className="doodle-card-front">
              {fp.open ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, width:'100%' }}>
                  <div className="doodle-title" style={{ fontSize:19 }}>Reset! 🔑</div>

                  {fp.step === 'phone' && <>
                    <p style={{ fontSize:12, color:'#555', textAlign:'center', margin:0 }}>Enter your registered mobile number</p>
                    <input className="doodle-input" type="tel" placeholder="+91 98765 43210" value={fp.phone} onChange={e => setFp(p => ({...p, phone:e.target.value}))} />
                    <button className="doodle-btn" disabled={!fp.phone.trim() || busy}
                      onClick={async () => { setBusy(true); setFpMsg(null); try { const { apiFetch } = await import('../api/client'); await apiFetch('/auth/forgot-password', { method:'POST', body:JSON.stringify({ phone:fp.phone }), timeoutMs:30000 }); setOtpSeconds(120); setFp(p => ({...p, step:'verify'})); setFpMsg({ text:'OTP sent ✓', ok:true }); } catch(e:any) { setFpMsg({ text:e.message||'Failed', ok:false }); } finally { setBusy(false); } }}>
                      {busy ? '...' : 'Send OTP'}
                    </button>
                  </>}

                  {fp.step === 'verify' && <>
                    <p style={{ fontSize:12, color:'#555', textAlign:'center', margin:0 }}>6-digit code {otpSeconds > 0 ? `(${otpSeconds}s)` : ''}</p>
                    <div style={{ display:'flex', gap:5, justifyContent:'center' }}>
                      {[0,1,2,3,4,5].map(i => (
                        <input key={i} id={`otp-d-${i}`} maxLength={1} type="text" inputMode="numeric"
                          value={fp.code[i] || ''}
                          onChange={e => { const v=e.target.value.replace(/\D/,''); const a=fp.code.split(''); a[i]=v; const c=a.join('').slice(0,6); setFp(p => ({...p,code:c})); if(v&&i<5)(document.getElementById(`otp-d-${i+1}`) as HTMLInputElement)?.focus(); }}
                          onKeyDown={e => { if(e.key==='Backspace'&&!fp.code[i]&&i>0)(document.getElementById(`otp-d-${i-1}`) as HTMLInputElement)?.focus(); }}
                          style={{ width:32, height:36, textAlign:'center', fontFamily:'inherit', fontWeight:700, fontSize:16, border:'2px solid #323232', borderRadius:6, outline:'none', background:fp.code[i]?'#fff9e6':'#fff', boxShadow:'2px 2px 0 #323232' }} />
                      ))}
                    </div>
                    <button className="doodle-btn" disabled={fp.code.length!==6||busy}
                      onClick={async () => { setBusy(true); setFpMsg(null); try { const { apiFetch } = await import('../api/client'); await apiFetch('/auth/verify-otp', { method:'POST', body:JSON.stringify({ phone:fp.phone, code:fp.code }), timeoutMs:30000 }); setFp(p => ({...p,step:'reset'})); setFpMsg({ text:'Verified ✓', ok:true }); } catch(e:any) { setFpMsg({ text:e.message||'Invalid', ok:false }); } finally { setBusy(false); } }}>
                      {busy ? '...' : 'Verify'}
                    </button>
                  </>}

                  {fp.step === 'reset' && <>
                    <input className="doodle-input" type={showFpPw?'text':'password'} placeholder="New password" value={fp.newPassword} onChange={e => setFp(p => ({...p,newPassword:e.target.value}))} />
                    <button type="button" className="doodle-link" onClick={() => setShowFpPw(s => !s)}>{showFpPw?'Hide':'Show'} password</button>
                    <button className="doodle-btn" disabled={fp.newPassword.length<6||busy}
                      onClick={async () => { setBusy(true); setFpMsg(null); try { const { apiFetch } = await import('../api/client'); await apiFetch('/auth/reset-password', { method:'POST', body:JSON.stringify({ phone:fp.phone, code:fp.code, newPassword:fp.newPassword }), timeoutMs:30000 }); resetFp(); } catch(e:any) { setFpMsg({ text:e.message||'Failed', ok:false }); } finally { setBusy(false); } }}>
                      {busy ? '...' : 'Reset!'}
                    </button>
                  </>}

                  {fpMsg && <p className={fpMsg.ok ? 'doodle-ok' : 'doodle-err'}>{fpMsg.text}</p>}
                  <button onClick={resetFp} className="doodle-link">← Back to login</button>
                </div>
              ) : (
                <>
                  <div className="doodle-title">Welcome!</div>
                  <form className="doodle-form" onSubmit={async e => {
                    e.preventDefault(); const f = new FormData(e.currentTarget); setBusy(true); setError(null);
                    try { const { apiFetch } = await import('../api/client'); await apiFetch('/auth/login', { method:'POST', body:JSON.stringify({ identifier:String(f.get('identifier')||''), password:String(f.get('password')||'') }), noReloadOnSuspend:true, timeoutMs:30000 }); onAuthSuccess(); }
                    catch(e:any) { setError(e.message||'Login failed'); } finally { setBusy(false); }
                  }}>
                    <div className="doodle-input-wrapper">
                      <input className="doodle-input" name="identifier" placeholder="Email or Mobile" type="text" required />
                    </div>
                    <div className="doodle-input-wrapper">
                      <input className="doodle-input" name="password" placeholder="Password" type={showPw?'text':'password'} required />
                    </div>
                    {error && <p className="doodle-err">{error}</p>}
                    <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                      <button type="button" className="doodle-link" onClick={() => setShowPw(s=>!s)}>{showPw?'Hide':'Show'} pw</button>
                      <button type="button" className="doodle-link" onClick={() => { setError(null); setFp(p=>({...p,open:true})); }}>Forgot?</button>
                    </div>
                    <button className="doodle-btn" type="submit" disabled={busy}>{busy ? '...' : "Let's Go!"}</button>
                  </form>
                </>
              )}
            </div>

            {/* ── BACK: Signup ── */}
            <div className="doodle-card-back">
              <div className="doodle-title doodle-title-alt">Join Us!</div>
              <form className="doodle-form" onSubmit={async e => {
                e.preventDefault(); const f = new FormData(e.currentTarget); setBusy(true); setError(null);
                try { const { apiFetch } = await import('../api/client'); await apiFetch('/auth/register', { method:'POST', body:JSON.stringify({ name:String(f.get('name')||''), phone:String(f.get('phone')||''), email:String(f.get('email')||''), age:Number(f.get('age')||0), gender:String(f.get('gender')||''), password:String(f.get('password')||'') }), noReloadOnSuspend:true, timeoutMs:30000 }); onAuthSuccess(); }
                catch(e:any) { setError(e.message||'Signup failed'); } finally { setBusy(false); }
              }}>
                <div className="doodle-input-wrapper">
                  <input className="doodle-input" name="name" placeholder="Full Name" type="text" required />
                </div>
                <div className="doodle-input-wrapper">
                  <input className="doodle-input" name="phone" placeholder="Mobile (+91 98765 43210)" type="tel" required />
                </div>
                <div className="doodle-input-wrapper">
                  <input className="doodle-input" name="email" placeholder="Email" type="email" required />
                </div>
                <div className="doodle-row">
                  <input className="doodle-input doodle-small-input" name="age" placeholder="Age" type="number" min="10" max="100" required />
                  <select name="gender" required className="doodle-input doodle-small-input" style={{ cursor:'pointer' }}>
                    <option value="" disabled>Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="doodle-input-wrapper">
                  <input className="doodle-input" name="password" placeholder="Password" type={showPw?'text':'password'} required />
                </div>
                {error && <p className="doodle-err">{error}</p>}
                <button type="button" className="doodle-link" onClick={() => setShowPw(s=>!s)} style={{ marginTop:-6 }}>{showPw?'Hide':'Show'} password</button>
                <button className="doodle-btn doodle-btn-alt" type="submit" disabled={busy}>{busy ? '...' : 'Confirm!'}</button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
