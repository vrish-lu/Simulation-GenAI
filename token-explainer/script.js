gsap.registerPlugin(TextPlugin, Flip);

const state = {
    view: 'token',
    tokens: ["Machine", " learning", " makes", " computer", "s", " smart", "."],
    isSpeaking: false
};

// --- Bot Logic ---
const Bot = {
    el: document.getElementById('ai-bot'),
    textEl: document.getElementById('bot-text'),
    bubble: document.querySelector('.bot-bubble'),
    overlay: document.getElementById('bot-overlay'),
    logContainer: document.getElementById('log-content'),

    show() { this.el.classList.remove('hidden'); },

    addToLog(text) {
        // Remove placeholder
        const ph = document.querySelector('.log-placeholder');
        if (ph) ph.remove();

        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerText = text;
        this.logContainer.appendChild(entry);
        this.logContainer.scrollTop = this.logContainer.scrollHeight; // Auto scroll
    },

    async speak(text) {
        if (state.isSpeaking) return;
        state.isSpeaking = true;
        this.show();

        this.textEl.innerHTML = "";

        // 1. Activate Overlay and Bubble
        this.overlay.classList.add('active');
        this.bubble.style.display = 'block';

        const tl = gsap.timeline();
        tl.fromTo(this.bubble, { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.5)" });

        await tl;

        // 2. Type Text (Slower: 0.05s per char)
        await new Promise(resolve => {
            gsap.to(this.textEl, {
                text: text,
                duration: Math.min(4, text.length * 0.05), // Slower typing 
                ease: "none",
                onComplete: () => setTimeout(resolve, 2500) // Longer pause (2.5s)
            });
        });

        // 3. Close Bubble and Log
        const tlExit = gsap.timeline();
        tlExit.to(this.bubble, {
            opacity: 0, y: 10, scale: 0.95, duration: 0.4,
            onComplete: () => {
                this.bubble.style.display = 'none';
                this.addToLog(text); // Log sidebar
            }
        });

        this.overlay.classList.remove('active');
        await tlExit;
        state.isSpeaking = false;
    }
};

// --- Navigation ---
window.switchView = (id) => {
    const current = document.querySelector('.view.active-view');
    const next = document.getElementById(`view-${id}`);

    gsap.to(current, {
        opacity: 0, duration: 0.8, onComplete: () => {
            current.classList.remove('active-view');
            next.classList.add('active-view');
            gsap.fromTo(next, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.8 }); // Slower transition

            // Contextual Intro
            setTimeout(() => { // Wait for fade in
                if (id === 'context') Bot.speak("Tokens need a temporary home while the model thinks. We call this the Context Window. It's like the model's short-term memory.");
                if (id === 'hallucinate') Bot.speak("What happens when the model doesn't know the answer? Sometimes, instead of saying 'I don't know', it hallucinates.");
                if (id === 'summary') Bot.speak("Excellent work. We've covered Tokens, Context Windows, and Hallucinations. Review your session notes on the left.");
            }, 800);
        }
    });
};

// --- Simulation 1: Tokenization ---
window.runTokenization = async () => {
    const btn = document.querySelector('#view-token .btn-primary-lg');
    btn.disabled = true;

    await Bot.speak("Computers don't strictly read 'words'. They break text into efficient chunks called Tokens. Let's tokenize this sentence.");

    const rawEl = document.getElementById('raw-text');
    const outEl = document.getElementById('tokens-output');

    // Fade out raw
    gsap.to(rawEl, { opacity: 0, duration: 0.8 });

    // Create tokens
    outEl.innerHTML = '';
    state.tokens.forEach((t, i) => {
        const span = document.createElement('div');
        span.className = 'token-block';
        span.innerText = t;
        span.style.opacity = 0;
        span.style.transform = "translateY(30px)";
        outEl.appendChild(span);

        // Slower Stagger: 0.6s per token
        gsap.to(span, { opacity: 1, y: 0, duration: 0.8, delay: i * 0.8, ease: "back.out(1.2)" });
    });

    await new Promise(r => setTimeout(r, (state.tokens.length * 800) + 1000));

    await Bot.speak("Did you see that? 'Learning' is one token, but punctuation marks like '.' get their own token. This efficiency is key for speed.");

    btn.innerText = "Next Concept: Context Window →";
    btn.classList.add('btn-primary');
    btn.classList.remove('btn-primary-lg');
    btn.disabled = false;
    btn.onclick = () => switchView('context');
    gsap.from(btn, { scale: 1.05, duration: 0.5, yoyo: true, repeat: 1 });
};

// --- Simulation 2: Context Window ---
window.runContextSim = async () => {
    const btn = document.querySelector('#view-context .btn-primary');
    btn.disabled = true;
    gsap.to(btn, { opacity: 0, display: 'none', duration: 0.5 }); // Hide functionality-less button

    await Bot.speak("The Context Window is a conveyor belt. New tokens push old ones out if the window is too small.");

    const smallCont = document.getElementById('stream-small');
    const largeCont = document.getElementById('stream-large');
    const limitSmall = 15; // Smaller limit to show overflow faster visually

    // Add tokens loop (Slower)
    for (let i = 0; i < 40; i++) {
        const color = Math.random() > 0.5 ? '#06b6d4' : '#f59e0b';

        // Small Window
        const t1 = document.createElement('div');
        t1.className = 'mini-token'; t1.style.background = color;
        smallCont.appendChild(t1);

        // Pop animation
        gsap.from(t1, { scale: 0, duration: 0.3 });

        if (smallCont.children.length > limitSmall) {
            const old = smallCont.firstElementChild;
            gsap.to(old, { y: 60, opacity: 0, duration: 0.5, onComplete: () => old.remove() });
            gsap.to('.overflow-zone', { opacity: 1, duration: 0.2, yoyo: true, repeat: 1 });
        }

        // Large Window
        const t2 = document.createElement('div');
        t2.className = 'mini-token'; t2.style.background = color;
        largeCont.appendChild(t2);
        gsap.from(t2, { scale: 0, duration: 0.3 });

        // Slower Loop Speed (300ms)
        await new Promise(r => setTimeout(r, 300));
    }

    await Bot.speak("See how the small window lost the beginning of the conversation? That's why larger Context Windows are a massive breakthrough.");

    const nextBtn = document.getElementById('btn-next-hallucinate');
    nextBtn.classList.remove('hidden');
    gsap.fromTo(nextBtn, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 });
};

// --- Simulation 3: Hallucinations ---
window.runHallucinationSim = async () => {
    const btn = document.querySelector('#view-hallucinate .btn-primary');
    btn.disabled = true;
    gsap.to(btn, { opacity: 0, display: 'none', duration: 0.5 }); // Hide functionality-less button

    const aiBubble = document.getElementById('ai-response');

    await Bot.speak("I'll ask the model a question it definitely doesn't know the answer to, because the event hasn't happened yet.");

    aiBubble.classList.remove('hidden');
    gsap.from(aiBubble, { scale: 0.9, opacity: 0, duration: 0.8, ease: "power2.out" });

    await new Promise(r => setTimeout(r, 2000));

    // Shake effect (Slower shake)
    const glitchSpan = document.querySelector('.glitch-text');
    gsap.to(glitchSpan, { x: 4, color: '#ef4444', duration: 0.1, repeat: 9, yoyo: true });

    document.getElementById('warning-badge').classList.remove('hidden');
    gsap.from('#warning-badge', { scale: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });

    await Bot.speak("This is a Hallucination. The AI confidently predicted 'Elena Voronova' simply because it sounded probable in a sci-fi context, not because it's true.");

    const finaleBtn = document.getElementById('btn-finish');
    finaleBtn.classList.remove('hidden');
    gsap.fromTo(finaleBtn, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 });
};

// --- Init ---
canvasFunc();
setTimeout(() => {
    Bot.speak("Welcome to the Token Explorer. I'll guide you through the three pillars of LLMs: Tokens, Context, and Hallucinations.");
}, 1000);

// --- Background ---
function canvasFunc() {
    const c = document.getElementById('token-bg');
    if (!c) return;
    const ctx = c.getContext('2d');
    let w, h;
    const particles = [];

    const resize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < 50; i++) particles.push({ x: Math.random() * w, y: Math.random() * h, s: Math.random() * 1.5 + 0.5, v: Math.random() * 0.5 + 0.2 });

    function draw() {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6,182,212,0.6)';
        particles.forEach(p => {
            p.y -= p.v;
            if (p.y < 0) p.y = h;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
        });
        requestAnimationFrame(draw);
    }
    draw();
}
