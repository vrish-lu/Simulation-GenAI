gsap.registerPlugin(MotionPathPlugin, TextPlugin);

// --- State ---
const state = {
    view: 'hero',
    checklist: [false, false, false, false, false],
    builder: {}
};

// --- Bot Controller ---
const Bot = {
    el: document.getElementById('ai-bot'),
    textEl: document.getElementById('bot-text'),
    bubble: document.querySelector('.bot-bubble'),
    log: document.getElementById('log-content'),
    overlay: document.getElementById('bot-overlay'),
    avatar: document.querySelector('.bot-avatar'),

    visible: false,

    logEntry(text) {
        document.querySelector('.log-placeholder')?.remove();
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerText = text;
        this.log.appendChild(div);
        this.log.scrollTop = this.log.scrollHeight;
    },

    async speak(text) {
        if (!this.visible) {
            this.el.classList.remove('hidden');
            gsap.fromTo(this.el, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 });
            this.visible = true;
        }

        this.textEl.innerHTML = "";
        this.bubble.style.display = 'block';
        this.overlay.classList.add('active'); // Focus overlay

        // Pop open
        gsap.fromTo(this.bubble,
            { opacity: 0, scale: 0.9, y: 10 },
            { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.5)" }
        );

        // Typewriter
        const duration = Math.min(text.length * 0.04, 3);
        await gsap.to(this.textEl, { text: text, duration: duration, ease: "none" });

        // Wait
        await new Promise(r => setTimeout(r, 1500 + (text.length * 25)));

        // Close
        await gsap.to(this.bubble, {
            opacity: 0, scale: 0.95, y: 5, duration: 0.3,
            onComplete: () => {
                this.bubble.style.display = 'none';
                this.logEntry(text);
                this.overlay.classList.remove('active');
            }
        });
    }
};

// --- Navigation ---
window.switchView = async (id) => {
    const current = document.querySelector('.view.active-view');
    const next = document.getElementById(`view-${id}`);

    await gsap.to(current, { opacity: 0, scale: 0.95, duration: 0.5 });
    current.classList.remove('active-view');

    next.classList.add('active-view');
    gsap.fromTo(next, { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 0.6 });

    // Intro Logic
    if (id === 'email') {
        Bot.speak("Applying the framework: fill in the constraints and context to see how the email evolves from generic to great.");
    } else if (id === 'job') {
        Bot.speak("Notice how adding specific 'Context' like skills and 'Role' changes the output tone completely.");
    } else if (id === 'checklist') {
        Bot.speak("Great prompts need a safety check. Verify your Logic before deploying.");
    } else if (id === 'comparison') {
        document.getElementById('success-modal').classList.remove('active');
        Bot.speak("Welcome to the Lab. Test a raw prompt versus one optimized with our Framework.");
    } else if (id === 'dashboard') {
        Bot.speak("Simulation Complete. Here is your performance analysis.");
        setTimeout(animateDashboard, 500);
    }
};

// --- Framework Animation ---
window.runFrameworkAnim = async () => {
    const btn = document.getElementById('btn-hero-play');
    btn.disabled = true;
    gsap.to(btn, { opacity: 0.5, pointerEvents: 'none' });

    document.getElementById('hero-status').innerText = "Simulating Token Flow...";

    await Bot.speak("Every great prompt follows this path. Watch the token gather context at each node.");

    const token = document.querySelector('.travel-token');
    const nodes = document.querySelectorAll('.node-item');

    // Path definition (approximate based on flow)
    // We physically move the token to each node position
    token.style.opacity = '1';

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const rect = node.querySelector('.node-circle').getBoundingClientRect();
        const containerRect = document.querySelector('.framework-visual').getBoundingClientRect();

        // Calulate relative pos
        const x = rect.left - containerRect.left + 25;
        const y = rect.top - containerRect.top + 25;

        // Move Token
        await gsap.to(token, { x: x, y: y, duration: 1, ease: "power2.inOut" });

        // Pulse Node
        node.classList.add('active');
        gsap.fromTo(node.querySelector('.node-circle'), { scale: 1.2 }, { scale: 1, duration: 0.3 });

        // Short pause
        await new Promise(r => setTimeout(r, 400));
    }

    // Finish
    await gsap.to(token, { x: '+=50', opacity: 0, duration: 0.5 });

    document.getElementById('hero-status').innerText = "Framework visualization completed ✔";
    document.getElementById('hero-status').style.color = "#10b981";

    const next = document.getElementById('btn-hero-next');
    next.classList.remove('hidden');
    gsap.fromTo(next, { y: 10, opacity: 0 }, { y: 0, opacity: 1 });
};

// --- Email Generator ---
window.generateEmail = async () => {
    const btn = event.target;
    btn.innerText = "Generating...";

    // Animate Card
    gsap.to('.email-card', { scale: 0.98, duration: 0.2, yoyo: true, repeat: 1 });

    await new Promise(r => setTimeout(r, 1000));

    const body = document.getElementById('email-body-text');
    body.innerHTML = `
        <strong>Subject: Update on Q3 Timeline - Revised Scope</strong><br><br>
        Hi Team,<br><br>
        As the <strong>Project Manager</strong>, I want to address the recent timeline shifts caused by the scope changes. <br><br>
        <strong>Constraint Check:</strong> We cannot move the launch date. Therefore, we will be prioritizing the core features outlined in the attached doc.<br><br>
        Please review by EOD.<br><br>
        Best,<br>Project Lead
    `;

    gsap.from(body, { opacity: 0, y: 10, duration: 0.5 });
    btn.innerText = "Regenerate";

    // Show Next
    const next = document.getElementById('btn-email-next');
    next.classList.remove('hidden');
    gsap.fromTo(next, { y: 10, opacity: 0 }, { y: 0, opacity: 1 });
};

// --- Job Description Generator ---
window.generateJob = async () => {
    const btn = event.target;
    btn.innerText = "Drafting...";

    await new Promise(r => setTimeout(r, 1200));

    const body = document.getElementById('jd-body-text');
    body.innerHTML = `
        <h3>Senior React Developer (FinTech)</h3>
        <p>We are seeking a 5+ Year veteran to lead our frontend architecture.</p>
        <ul>
            <li><strong>Context:</strong> High-performance trading dashboard.</li>
            <li><strong>Task:</strong> Migrate legacy codebase to React 18 + TS.</li>
            <li><strong>Must Haves:</strong> AWS, Node.js, Real-time sockets.</li>
        </ul>
    `;

    document.getElementById('jd-meter').classList.remove('hidden');
    gsap.from('.meter-fill', { width: 0, duration: 1.5, ease: "power2.out" });

    btn.innerText = "Update Draft";

    const next = document.getElementById('btn-job-next');
    next.classList.remove('hidden');
    gsap.fromTo(next, { y: 10, opacity: 0 }, { y: 0, opacity: 1 });
};

// --- Checklist ---
window.toggleCheck = (idx) => {
    const items = document.querySelectorAll('.cl-item');
    const item = items[idx];

    if (!state.checklist[idx]) {
        state.checklist[idx] = true;
        item.classList.add('checked');
        gsap.from(item.querySelector('.checkbox'), { scale: 1.4, duration: 0.3, ease: "back.out" });
    } else {
        state.checklist[idx] = false;
        item.classList.remove('checked');
    }

    // Update Progress
    const count = state.checklist.filter(Boolean).length;
    const pct = (count / 5) * 100;

    gsap.to('#cl-bar', { width: `${pct}%` });
    document.getElementById('cl-text').innerText = `${count}/5 Verified`;

    // Check Completion
    const btn = document.getElementById('btn-publish');
    if (count === 5) {
        btn.classList.remove('disabled');
        gsap.to(btn, { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1 });
    } else {
        btn.classList.add('disabled');
    }
};

window.publishPrompt = () => {
    if (document.getElementById('btn-publish').classList.contains('disabled')) return;

    // Confetti / Success
    const modal = document.getElementById('success-modal');
    modal.classList.add('active');
};

// --- Builder Binding ---
document.querySelectorAll('.build-in').forEach(el => {
    el.addEventListener('input', (e) => {
        const targetId = e.target.dataset.target;
        const val = e.target.value || "...";
        document.getElementById(targetId).innerText = val;
    });
});

// --- Comparison Comparison Logic (Screen 5) ---
window.runComparison = async () => {
    const btn = document.getElementById('btn-run-all');
    btn.innerHTML = "Running Comparison... <span class='spinner'>⏳</span>";
    btn.classList.add('disabled');

    // 2. Reveal Bad Output
    const cardBad = document.getElementById('card-bad');
    cardBad.classList.remove('hidden');

    await new Promise(r => setTimeout(r, 600));
    document.getElementById('out-bad').innerText = "Subject: New Product\n\nHi,\n\nWe have a new product. It is great. You should buy it.\n\nThanks,\nTeam";
    gsap.fromTo(cardBad, { opacity: 0, x: -20 }, { opacity: 1, x: 0 });

    // 3. Reveal Good Output
    const cardGood = document.getElementById('card-good');
    cardGood.classList.remove('hidden');

    await new Promise(r => setTimeout(r, 800));
    document.getElementById('out-good').innerHTML = `
        <strong>Subject:</strong> Exclusive Summer Launch ☀️<br><br>
        Hi [Name],<br><br>
        We are thrilled to unveil our new eco-friendly line designed just for you. Early access starts now!<br><br>
        <strong>CTA:</strong> Shop the Collection<br><br>
        Warmly,<br>The EcoTeam
    `;
    gsap.fromTo(cardGood, { opacity: 0, x: 20 }, { opacity: 1, x: 0 });

    // 4. Show Summary
    btn.innerText = "Simulation Complete ✔";
    document.getElementById('btn-comp-summary').classList.remove('hidden');
    gsap.fromTo('#btn-comp-summary', { opacity: 0, y: 10 }, { opacity: 1, y: 0, delay: 0.2 });
};

window.showCompSummary = () => {
    switchView('dashboard');
};

// --- Dashboard Animation (Screen 6) ---
window.animateDashboard = () => {
    // 0. Qualitative Analysis
    gsap.to('#qual-analysis', { opacity: 1, duration: 1 });
    gsap.from('.a-col', { y: 20, opacity: 0, stagger: 0.2, duration: 0.8, ease: "power2.out" });

    // 1. Bars
    gsap.to('#b-clarity', { height: '85%', duration: 1.5, delay: 0.5, ease: "power2.out" });
    gsap.to('#b-act', { height: '92%', duration: 1.5, delay: 0.7, ease: "power2.out" });
    gsap.to('#b-brevity', { height: '78%', duration: 1.5, delay: 0.9, ease: "power2.out" });

    // 2. Radial Gauge
    const circle = document.getElementById('g-impact');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (0.94 * circumference); // 94% Impact

    gsap.to(circle, { strokeDashoffset: offset, duration: 2, delay: 0.5, ease: "power3.out" });

    // Count up
    let obj = { val: 0 };
    gsap.to(obj, {
        val: 94, duration: 2, delay: 0.5, onUpdate: () => {
            document.getElementById('impact-val').innerText = Math.round(obj.val) + "%";
        }
    });

    // 3. Line Graph (Fake data path)
    // M0,100 L50,80 L100,60 L150,40 L200,20 L300,10
    const path = "M0,100 Q50,90 80,70 T150,50 T220,30 T300,10";
    gsap.to('#graph-timeline', { attr: { d: path }, duration: 2, ease: "power2.inOut" });

    // 4. Text Typewriter
    gsap.to('#final-summary', {
        text: "<strong>Analysis Complete:</strong> By applying the Framework, you increased Clarity by +45% and Actionability by +60%. Your prompt effectively constrained the model to produce a high-value output.",
        duration: 4,
        delay: 1
    });
};

// Canvas Background
const c = document.getElementById('framework-bg');
const ctx = c.getContext('2d');
let w, h;
const nodes = [];

function resize() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();

// Create nodes
for (let i = 0; i < 30; i++) nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5 });

function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(217, 70, 239, 0.4)';
    ctx.strokeStyle = 'rgba(217, 70, 239, 0.1)';

    nodes.forEach((n, i) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1; if (n.y < 0 || n.y > h) n.vy *= -1;

        ctx.beginPath(); ctx.arc(n.x, n.y, 2, 0, Math.PI * 2); ctx.fill();

        // Connect
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - n.x;
            const dy = nodes[j].y - n.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
            }
        }
    });
    requestAnimationFrame(draw);
}
draw();
