// ... (GSAP Plugin and State/Canvas code remains same) ...
// Register GSAP Plugins
gsap.registerPlugin(MotionPathPlugin, TextPlugin);

// --- State Management ---
const state = {
    view: 'hero',
    pipelineRun: false,
    analyses: { cat: 0, dog: 0, spam: 0, ham: 0, total: 0 },
    lastVision: null,
    history: []
};

// --- Bot Controller (UPDATED for Bottom Right) ---
let Bot;
let canvas, ctx, width, height, nodes;

// Initialize after DOM is ready
function initBot() {
    Bot = {
        el: document.getElementById('ai-bot'),
        textEl: document.getElementById('bot-text'),
        bubble: document.querySelector('.bot-bubble'),
        overlay: document.getElementById('bot-overlay'),
        logContainer: document.getElementById('log-content'),

        show() {
            if (this.el) {
                this.el.classList.remove('hidden');
                gsap.to(this.el, { opacity: 1, duration: 0.5 });
            }
        },

        addToLog(text) {
            // Remove placeholder if present
            const ph = document.querySelector('.log-placeholder');
            if (ph) ph.remove();

            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.innerText = text;
            if (this.logContainer) {
                this.logContainer.appendChild(entry);
                this.logContainer.scrollTop = this.logContainer.scrollHeight;
            }
        },

        async speak(text, pauseDuration = 2000) {
            if (!this.el || !this.textEl || !this.bubble || !this.overlay) return;
            
            this.show();

            // Clear text immediately
            this.textEl.innerHTML = "";

            // 1. Overlay & Bubble Animation
            this.overlay.classList.add('active'); // Fade in backdrop

            const tl = gsap.timeline();

            // Ensure bot is in corner, show bubble
            tl.set(this.bubble, { display: 'block', opacity: 0, y: 10 });
            tl.to(this.bubble, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.2)" });

            await tl;

            // 2. Type Text
            await new Promise(resolve => {
                gsap.to(this.textEl, {
                    text: text,
                    duration: Math.min(text.length * 0.04, 3), // Cap duration
                    ease: "none",
                    onComplete: () => {
                        // Pause to read
                        setTimeout(resolve, pauseDuration);
                    }
                });
            });

            // 3. Log & Hide
            const tlExit = gsap.timeline();

            tlExit.to(this.bubble, {
                opacity: 0, y: 10, scale: 0.9, duration: 0.3,
                onComplete: () => {
                    this.bubble.style.display = 'none';
                    this.addToLog(text); // Save to sidebar
                }
            });

            this.overlay.classList.remove('active'); // Fade out backdrop
            await tlExit;
        },

        hide() {
            if (this.el) {
                gsap.to(this.el, { y: 20, opacity: 0, onComplete: () => this.el.classList.add('hidden') });
            }
        }
    };
}

// --- Canvas Logic ---
function initCanvas() {
    canvas = document.getElementById('neural-bg');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    function resizeCanvas() { 
        width = canvas.width = window.innerWidth; 
        height = canvas.height = window.innerHeight; 
        initNodes(); 
    }
    
    function initNodes() { 
        nodes = []; 
        const count = Math.floor(width * height / 15000); 
        for (let i = 0; i < count; i++) {
            nodes.push({ 
                x: Math.random() * width, 
                y: Math.random() * height, 
                vx: (Math.random() - 0.5) * 0.5, 
                vy: (Math.random() - 0.5) * 0.5 
            }); 
        }
    }
    
    function drawNetwork() { 
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, width, height); 
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; 
        ctx.strokeStyle = 'rgba(255,255,255,0.05)'; 
        nodes.forEach(node => { 
            node.x += node.vx; 
            node.y += node.vy; 
            if (node.x < 0 || node.x > width) node.vx *= -1; 
            if (node.y < 0 || node.y > height) node.vy *= -1; 
            ctx.beginPath(); 
            ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2); 
            ctx.fill(); 
        }); 
        for (let i = 0; i < nodes.length; i++) { 
            for (let j = i + 1; j < nodes.length; j++) { 
                const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y); 
                if (d < 120) { 
                    ctx.beginPath(); 
                    ctx.moveTo(nodes[i].x, nodes[i].y); 
                    ctx.lineTo(nodes[j].x, nodes[j].y); 
                    ctx.stroke(); 
                } 
            } 
        } 
        requestAnimationFrame(drawNetwork); 
    }
    
    window.addEventListener('resize', resizeCanvas); 
    resizeCanvas(); 
    drawNetwork();
}

// --- Navigation ---
window.switchView = (viewId) => {
    // Current out
    const currentEl = document.getElementById(`view-${state.view}`);
    gsap.to(currentEl, {
        opacity: 0, scale: 0.95, duration: 0.5,
        onComplete: () => {
            currentEl.classList.remove('active-view');
            // Next in
            const nextEl = document.getElementById(`view-${viewId}`);
            nextEl.classList.add('active-view');

            // Context-aware Bot Messages
            if (viewId === 'vision') {
                Bot.speak("Welcome to the Vision Lab. Use the learned model to classify new images as either Cat or Dog.");
            } else if (viewId === 'nlp') {
                Bot.speak("Excellent. Now let's test the Natural Language Processing model. Can it detect spam emails correctly?");
            } else if (viewId === 'summary') {
                Bot.speak("Analysis complete. Let's review the performance metrics generated from your session.");
                renderDashboard();
            }

            gsap.fromTo(nextEl, { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 0.5 });
            state.view = viewId;
        }
    });
};

window.startExperience = () => {
    Bot.speak("Hello! I'm Aura, your AI guide. Let's explore how machines learn.", 2000)
        .then(() => switchView('pipeline'));
};

// --- Pipeline Logic (Synced with Bot) ---
window.pipelineSequenceStart = async () => {
    const btn = document.getElementById('btn-run-pipeline');
    btn.disabled = true;

    // Narrator Step 1: Pauses here while bot speaks
    await Bot.speak("First, we need raw data. Watch as we ingest thousands of images.");
    document.getElementById('pipeline-status').innerText = "Ingesting Data...";

    // Animation 1 runs ONLY after bot finishes
    const tl = gsap.timeline();
    const cluster = document.getElementById('file-cluster');
    cluster.innerHTML = '';
    ['📄', '🖼️', '📊', '🎵', '📝'].forEach((icon, i) => {
        const el = document.createElement('div');
        el.className = 'anim-file'; el.innerText = icon;
        gsap.set(el, { x: (Math.random() - 0.5) * 300, y: (Math.random() - 0.5) * 300, opacity: 0 });
        cluster.appendChild(el);
        tl.to(el, { x: 0, y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" }, i * 0.1);
        tl.to(el, { scale: 0, opacity: 0, duration: 0.3 }, ">+0.1");
    });
    tl.to('#node-ingest .node-circle', { borderColor: '#0EA5E9', boxShadow: '0 0 30px #0EA5E9', scale: 1.1, yoyo: true, repeat: 1, duration: 0.3 });

    await new Promise(r => setTimeout(r, 2000));

    // Narrator Step 2
    await Bot.speak("The data travels to the Training Engine to find patterns.");
    document.getElementById('pipeline-status').innerText = "Training Model...";

    const tl2 = gsap.timeline();
    tl2.fromTo('#path-1', { strokeDasharray: 1000, strokeDashoffset: 1000 }, { strokeDashoffset: 0, duration: 1.5, stroke: '#0EA5E9' });
    for (let i = 0; i < 3; i++) {
        const p = document.createElement('div');
        p.style.cssText = "width:8px;height:8px;background:#0EA5E9;border-radius:50%;position:absolute;z-index:5;box-shadow:0 0 10px white;";
        document.querySelector('.pipeline-stage-area').appendChild(p);
        tl2.to(p, { duration: 1.5, motionPath: { path: "#path-1", align: "#path-1", alignOrigin: [0.5, 0.5] }, onComplete: () => p.remove() }, `-=${1.3 - (i * 0.2)}`);
    }
    // Spin Ring
    tl2.to('#node-train .node-circle', { borderColor: '#F43F5E', boxShadow: '0 0 30px #F43F5E' }, "-=0.5");
    tl2.to('.training-ring', { opacity: 1, rotation: 360, duration: 2, ease: "linear", repeat: 1 }, "<");

    await new Promise(r => setTimeout(r, 2500));

    // Narrator Step 3
    await Bot.speak("Finally, we compile the learned patterns into a predictive Model.");
    document.getElementById('pipeline-status').innerText = "Finalizing Model...";

    const tl3 = gsap.timeline();
    tl3.fromTo('#path-2', { strokeDasharray: 1000, strokeDashoffset: 1000 }, { strokeDashoffset: 0, duration: 1.5, stroke: '#F43F5E' });
    for (let i = 0; i < 3; i++) {
        const p = document.createElement('div');
        p.style.cssText = "width:8px;height:8px;background:#F43F5E;border-radius:50%;position:absolute;z-index:5;";
        document.querySelector('.pipeline-stage-area').appendChild(p);
        tl3.to(p, { duration: 1.5, motionPath: { path: "#path-2", align: "#path-2", alignOrigin: [0.5, 0.5] }, onComplete: () => p.remove() }, `-=${1.3 - (i * 0.2)}`);
    }
    tl3.to('.model-cube', { rotationX: 180, rotationY: 225, scale: 1.2, duration: 1.5, ease: "power2.inOut" });
    tl3.to('.face', { background: 'rgba(16,185,129,0.2)', borderColor: '#10B981' }, "<");

    await new Promise(r => setTimeout(r, 2000));

    await Bot.speak("Training complete! The model is ready for testing.");
    document.getElementById('pipeline-status').innerText = "Pipeline Ready ✔";
    document.getElementById('pipeline-status').style.color = "#10B981";
    gsap.to(btn, { opacity: 0, display: 'none' });

    const nextBtn = document.getElementById('btn-pipeline-next');
    nextBtn.classList.remove('hidden');
    gsap.fromTo(nextBtn, { y: 10, opacity: 0 }, { y: 0, opacity: 1 });
};

// ... (Labs and Dashboard Logic Remains Same) ...
let visionSrc = 'cat';
window.setVisionSource = (type) => { state.lastVision = type; document.querySelectorAll('.toggle-opt').forEach(b => b.classList.remove('active')); document.getElementById(`opt-${type}`).classList.add('active'); const img = document.getElementById('vision-img'); gsap.to(img, { opacity: 0, duration: 0.2, onComplete: () => { img.src = `/ml-explainer/assets/${type}.png`; gsap.to(img, { opacity: 1, duration: 0.2 }); document.getElementById('vis-bar').style.width = '0%'; document.getElementById('vis-pred').innerText = '--'; } }); };
window.runVisionAnalysis = () => {
    const laser = document.querySelector('.scan-laser');
    gsap.fromTo(laser, { top: '-10%', opacity: 1 }, { top: '110%', duration: 1.2, ease: "linear", onComplete: () => laser.style.opacity = 0 });

    setTimeout(() => {
        const conf = 85 + Math.floor(Math.random() * 14);
        const label = state.lastVision === 'cat' ? 'Cat' : 'Dog';
        document.getElementById('vis-pred').innerText = label;
        gsap.to('#vis-bar', { width: `${conf}%`, duration: 1 });

        // Track Data
        state.analyses[state.lastVision] += 1;
        state.analyses.total += 1;
        state.history.push(`Vision analysis: ${label} (${conf}%)`);

        // Explain Result
        const explanation = label === 'Cat'
            ? "Analysis Clear: I detected triangular ears and whisker patterns. The Convolutional Network matched these edges to the 'Cat' class."
            : "Analysis Clear: I identified a longer snout and floppy ear shape. These geometric features strongly activated the 'Dog' neurons.";

        // Use shorter usage for bot to ensure UI response first
        setTimeout(() => {
            Bot.speak(explanation).then(() => {
                const navBtn = document.getElementById('btn-vision-next');
                navBtn.classList.remove('hidden');
                gsap.fromTo(navBtn, { y: 10, opacity: 0 }, { y: 0, opacity: 1 });
            });
        }, 1500);

    }, 1200);
};

// Spam Messages
const spamMessages = [
    { text: "Congrats! You won $1000.", type: 'spam' },
    { text: "Meeting changed to 4pm.", type: 'ham' },
    { text: "Cheap pharmacy pills.", type: 'spam' },
    { text: "Hey, see you soon.", type: 'ham' }
];
let selectedSpamIdx = -1;

window.loadSpamPreset = (idx) => {
    selectedSpamIdx = idx;
    document.querySelectorAll('.preset-msg').forEach((b, i) => b.classList.toggle('selected', i === idx));
    document.getElementById('msg-preview-text').innerText = spamMessages[idx].text;
    gsap.to('.message-card', { rotateY: 0 });
    gsap.to('#spam-ring', { strokeDashoffset: 283, stroke: '#F43F5E' });
};

window.runSpamAnalysis = () => {
    if (selectedSpamIdx === -1) return;
    const item = spamMessages[selectedSpamIdx];
    const isSpam = item.type === 'spam';

    // Animate
    gsap.to('.message-card', { rotateY: 180, duration: 0.8 });
    const badge = document.getElementById('spam-verdict');
    badge.innerText = isSpam ? "SPAM" : "SAFE";
    badge.style.background = isSpam ? "#F43F5E" : "#10B981";

    const offset = 283 - (283 * (isSpam ? 0.95 : 0.05));
    gsap.to('#spam-ring', {
        strokeDashoffset: offset,
        stroke: isSpam ? '#F43F5E' : '#10B981',
        duration: 1.5, delay: 0.5
    });

    document.getElementById('spam-score').innerText = isSpam ? "95%" : "5%";

    // Track Data
    state.analyses[item.type] += 1;
    state.analyses.total += 1;
    state.history.push(`Spam check: ${item.type.toUpperCase()}`);

    // Explain Result
    const explanation = isSpam
        ? "Risk Detected! I found urgency keywords like 'Won' or 'Cheap'. The probability model flagged this pattern as typical phishing."
        : "This looks safe. The semantic structure is conversational and lacks the aggressive sales tokens found in our spam dataset.";

    setTimeout(() => {
        Bot.speak(explanation).then(() => {
            const navBtn = document.getElementById('btn-nlp-next');
            navBtn.classList.remove('hidden');
            gsap.fromTo(navBtn, { y: 10, opacity: 0 }, { y: 0, opacity: 1 });
        });
    }, 2000);
};
window.renderDashboard = () => { const sumEl = document.getElementById('dynamic-summary-text'); let text = `You completed ${state.analyses.total} total analyses. `; if (state.analyses.total === 0) { text += "However, no data points were processed. Try running the labs first."; } else { const mostVision = state.analyses.cat > state.analyses.dog ? "Cats" : "Dogs"; const emailType = state.analyses.spam > state.analyses.ham ? "Spam" : "Real"; text += `In the Vision Lab, you focused primarily on <strong>${mostVision}</strong>. `; text += `For NLP, you tested more <strong>${emailType}</strong> emails. `; text += `The model is showing stable learning patterns with increasing accuracy.`; } sumEl.innerHTML = text; gsap.from(sumEl, { y: 20, opacity: 0, duration: 1 }); const maxVal = Math.max(state.analyses.cat, state.analyses.dog, state.analyses.spam, state.analyses.ham, 5); const getH = (val) => Math.floor((val / maxVal) * 100) + "%"; gsap.to('#bar-cat', { height: getH(state.analyses.cat), duration: 1 }); gsap.to('#bar-dog', { height: getH(state.analyses.dog), duration: 1, delay: 0.1 }); gsap.to('#bar-spam', { height: getH(state.analyses.spam), duration: 1, delay: 0.2 }); gsap.to('#bar-ham', { height: getH(state.analyses.ham), duration: 1, delay: 0.3 }); const totalEmail = state.analyses.spam + state.analyses.ham || 1; const spamRatio = state.analyses.spam / totalEmail; const spamStroke = 158 * spamRatio; gsap.to('#pie-spam', { strokeDasharray: `${spamStroke} 158`, duration: 1.5, ease: "power2.out" }); const startDeg = -90 + (360 * spamRatio); gsap.set('#pie-real', { rotation: startDeg, transformOrigin: "50% 50%" }); gsap.to('#pie-real', { strokeDasharray: `${158 * (1 - spamRatio)} 158`, duration: 1.5, ease: "power2.out" }); const endY = Math.max(10, 90 - (state.analyses.total * 5)); const newPath = `M0,90 Q100,${(90 + endY) / 2 - 20} 200,${endY}`; const pathEl = document.getElementById('loss-curve'); pathEl.setAttribute('d', newPath); const len = pathEl.getTotalLength(); gsap.fromTo(pathEl, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2, ease: "power2.out" }); };

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initBot();
        initCanvas();
    });
} else {
    // DOM already loaded
    initBot();
    initCanvas();
}
