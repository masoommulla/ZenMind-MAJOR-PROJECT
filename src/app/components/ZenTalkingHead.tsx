/**
 * ZenTalkingHead — wraps the @met4citizen/talkinghead library in a React component.
 *
 * Props:
 *  speaking  — true while the Web Speech API TTS is active
 *  text      — new text triggers lip-sync animation
 *  onReady   — called when avatar finishes loading (optional)
 */

import { useEffect, useRef, useState } from 'react';

interface ZenTalkingHeadProps {
  speaking: boolean;
  text: string;
  onReady?: () => void;
}

// We import the class dynamically so Vite doesn't choke on Three.js worker imports
let TalkingHeadClass: any = null;

async function getTalkingHeadClass() {
  if (TalkingHeadClass) return TalkingHeadClass;
  const mod = await import('@met4citizen/talkinghead');
  TalkingHeadClass = mod.TalkingHead;
  return TalkingHeadClass;
}

export default function ZenTalkingHead({ speaking, text, onReady }: ZenTalkingHeadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headRef      = useRef<any>(null);
  const prevTextRef  = useRef('');
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadPct, setLoadPct]    = useState(0);

  /* ── Mount: instantiate TalkingHead + load avatar ── */
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        const TH = await getTalkingHeadClass();
        if (cancelled || !containerRef.current) return;

        const head = new TH(containerRef.current, {
          ttsEndpoint: '',          // disable built-in TTS — we use Web Speech API
          lipsyncModules: ['en'],   // English lip-sync
          lipsyncLang: 'en',
          cameraView: 'upper',      // head + shoulders (passport view)
          modelFPS: 30,
          modelPixelRatio: window.devicePixelRatio || 1,
          avatarMood: 'happy',
          avatarIdleEyeContact: 0.4,
          avatarSpeakingEyeContact: 0.7,
          avatarIdleHeadMove: 0.4,
          avatarSpeakingHeadMove: 0.6,
          cameraRotateEnable: false,
          cameraPanEnable: false,
          cameraZoomEnable: false,
        });

        headRef.current = head;

        await head.showAvatar(
          {
            url: '/avatars/doctor.glb',
            lipsyncLang: 'en',
            avatarMood: 'happy',
          },
          // progress callback
          (_url: string, ev: ProgressEvent) => {
            if (ev.lengthComputable) {
              setLoadPct(Math.round((ev.loaded / ev.total) * 100));
            }
          }
        );

        if (cancelled) return;
        setLoadState('ready');
        onReady?.();
      } catch (err) {
        console.error('[ZenTalkingHead] init error:', err);
        if (!cancelled) setLoadState('error');
      }
    })();

    return () => {
      cancelled = true;
      // TalkingHead doesn't expose a public destroy; stop the render loop
      try { headRef.current?.stop?.(); } catch (_) {}
      headRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Trigger lip-sync when new text arrives ── */
  useEffect(() => {
    if (!text || text === prevTextRef.current) return;
    if (!headRef.current || loadState !== 'ready') return;
    prevTextRef.current = text;

    // speakText is synchronous (queues internally, driven by TTS boundary events)
    // We pass the text for lipsync animation only — actual audio is via Web Speech API
    try {
      headRef.current.speakText(text, { lipsyncLang: 'en' });
    } catch (err) {
      console.warn('[ZenTalkingHead] speakText error:', err);
    }
  }, [text, loadState]);

  /* ── Stop lip-sync when TTS ends ── */
  useEffect(() => {
    if (!headRef.current || loadState !== 'ready') return;
    if (!speaking) {
      try { headRef.current.stopSpeaking?.(); } catch (_) {}
    }
  }, [speaking, loadState]);

  /* ── Render ── */
  return (
    <div className="relative w-full h-full">
      {/* Three.js canvas target */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ background: 'linear-gradient(160deg, #071a0f 0%, #0d5d3a 60%, #0a3d22 100%)' }}
      />

      {/* Loading overlay */}
      {loadState === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
          {/* Spinner */}
          <div className="w-10 h-10 rounded-full border-2 border-[#10b981]/30 border-t-[#10b981] animate-spin" />
          <div className="text-[#10b981]/80 text-xs font-medium">
            Loading avatar{loadPct > 0 ? ` ${loadPct}%` : '…'}
          </div>
          {/* Progress bar */}
          {loadPct > 0 && (
            <div className="w-28 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#10b981] rounded-full transition-all duration-300"
                style={{ width: `${loadPct}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Error fallback */}
      {loadState === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
          <div className="text-4xl">🤖</div>
          <div className="text-white/60 text-xs text-center px-4">
            3D avatar unavailable<br/>Using text mode
          </div>
        </div>
      )}
    </div>
  );
}
