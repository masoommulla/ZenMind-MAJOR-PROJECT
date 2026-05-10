# Phase 2 — Human Avatar with Lip-Sync (Updated Plan)

## Assets Available
| File | Size | Use |
|---|---|---|
| `asset/avtar/doctor.glb` | 21MB | ✅ PRIMARY — doctor character for healthcare app |
| `asset/avtar/woman_cyber_free_model_by_oscar_creativo.glb` | 128MB | ❌ Too large for web |

## Library: TalkingHead (met4citizen)
GitHub: https://github.com/met4citizen/TalkingHead
NPM: `@met4citizen/talkinghead`

### Why TalkingHead?
- Full-body 3D avatars with Mixamo rig support
- Built-in English lip-sync module (no Google TTS needed for animation)
- `cameraView: "upper"` = shows head + shoulders (passport-size) ✅
- Works with browser Web Speech API audio via `speakAudio()`
- Uses Three.js under the hood — pure browser, no backend
- MIT license, free forever

---

## Camera View Options (Built-in)
| Value | What you see |
|---|---|
| `"head"` | Face only |
| `"upper"` | Head + shoulders ✅ WE WANT THIS |
| `"mid"` | Head + chest |
| `"full"` | Full body |

---

## Integration Strategy

### TTS + Lip-Sync Flow
```
User sends message
  → Groq API returns text reply
  → We create SpeechSynthesisUtterance (browser TTS)
  → We ALSO capture audio via MediaRecorder + AudioContext
  → Feed audio buffer to TalkingHead.speakAudio()
  → TalkingHead animates mouth using built-in English lipsync module
  → Web Speech API speaks the audio simultaneously
```

### Simpler Alternative (if audio capture fails)
```
User sends message
  → Groq API returns text reply
  → Call TalkingHead.speakText() with reply text
  → TalkingHead uses built-in lipsync + handles animation
  → Separately: browser Web Speech API speaks audio
  → SpeechSynthesis.onboundary → trigger avatar gestures
```

---

## Files to Create/Modify

### NEW: `src/app/components/ZenTalkingHead.tsx`
Wraps the TalkingHead class in a React component:

```tsx
import { useEffect, useRef } from 'react';
import { TalkingHead } from '@met4citizen/talkinghead';

interface ZenTalkingHeadProps {
  speaking: boolean;
  listening: boolean;
  text: string;        // text to speak (triggers animation)
  onSpeakEnd: () => void;
}

export default function ZenTalkingHead({ speaking, text, onSpeakEnd }: ZenTalkingHeadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<TalkingHead | null>(null);

  useEffect(() => {
    if (!containerRef.current || headRef.current) return;

    headRef.current = new TalkingHead(containerRef.current, {
      ttsEndpoint: null,           // no Google TTS — we handle TTS ourselves
      lipsyncModules: ['en'],      // English lip-sync built-in
      cameraView: 'upper',         // head + shoulders
      modelFPS: 30,
      modelPixelRatio: window.devicePixelRatio || 1,
    });

    // Load doctor avatar from public folder
    headRef.current.showAvatar(
      { url: '/avatars/doctor.glb' },
      () => console.log('Avatar loaded'),
      (err: Error) => console.error('Avatar load error:', err)
    );

    return () => { headRef.current = null; };
  }, []);

  // When new text arrives, trigger lip-sync animation
  useEffect(() => {
    if (!text || !headRef.current) return;
    // speakAudio with null audio = just run animation with lip-sync for text
    headRef.current.speakText(text, null, {
      lipsyncLang: 'en',
      onSubtitleChange: () => {},
    }).catch(() => {});
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #071a0f 0%, #0d5d3a 100%)' }}
    />
  );
}
```

### MODIFY: `src/app/components/ZenAvatarChat.tsx`
- Remove `<AvatarFace>` SVG component
- Add `<ZenTalkingHead>` in its place
- Pass `speaking` state and current `text` to trigger animations

### COPY: `doctor.glb` → `public/avatars/doctor.glb`
Vite serves `public/` folder as static assets — the GLB needs to be there.

---

## Install Command
```bash
npm install @met4citizen/talkinghead
```

---

## Passport-Size Layout (Upper Body View)
- Desktop left panel: avatar takes full height of panel
- Camera set to `"upper"` = shows head + shoulders naturally
- No cropping needed — TalkingHead handles framing automatically
- Mobile mini-box: 112×112px — switch cameraView to `"head"` for small screens

---

## Potential Issues & Fixes

### doctor.glb may not have ARKit/Oculus viseme morph targets
If the GLB doesn't have facial blend shapes, lip-sync won't work but
the body/head animations (idle, nod, etc.) will still work.
Fix: Use a RPM avatar GLB instead (once readyplayer.me is accessible)
or re-export doctor.glb from Blender with morph targets added.

### 21MB GLB loading time
Add a loading state in the avatar panel while GLB downloads.
On Render: GLB is served from static site CDN — fast enough.

### TalkingHead + Vite bundling
TalkingHead uses ES modules. May need vite.config.ts adjustment:
```ts
optimizeDeps: {
  include: ['@met4citizen/talkinghead']
}
```

---

## Timeline
~3–4 hours to implement once we start.
Say "start Phase 2" to begin.
