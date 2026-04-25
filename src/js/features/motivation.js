/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const Motivation = {
  quotes: [
    { text: "कठिन परिश्रम का कोई विकल्प नहीं है।", auth: "Anonymous" },
    { text: "सफलता तब मिलती है जब आपके सपने आपके बहानों से बड़े हो जाते हैं।", auth: "Anonymous" },
    { text: "चुनौतियां ही जिंदगी को रोमांचक बनाती हैं।", auth: "Anonymous" },
    { text: "मंजिल उन्हीं को मिलती है, जिनके सपनों में जान होती है।", auth: "Anonymous" },
    { text: "इंतजार करने वालों को उतना ही मिलता है, जितना कोशिश करने वाले छोड़ देते हैं।", auth: "A.P.J. Abdul Kalam" },
    { text: "सपने वो नहीं जो आप सोते समय देखते हैं, बल्कि वो हैं जो आपको सोने नहीं देते।", auth: "A.P.J. Abdul Kalam" },
    { text: "कामयाबी का जूनून होना चाहिए, फिर मुश्किलें मायने नहीं रखतीं।", auth: "Anonymous" },
    { text: "अगर आप उड़ नहीं सकते तो दौड़ो, दौड़ नहीं सकते तो चलो।", auth: "Martin Luther King Jr." },
    { text: "अपनी मेहनत पर विश्वास करो, किस्मत पर नहीं।", auth: "Anonymous" },
    { text: "संघर्ष जितना कठिन होगा, जीत उतनी ही शानदार होगी।", auth: "Swami Vivekananda" }
  ],

  init(app) {
    this.app = app;
    this.currentIndex = Math.floor(Math.random() * this.quotes.length);
    this.startAutoChange();
  },

  startAutoChange() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      try {
        this.currentIndex = (this.currentIndex + 1) % this.quotes.length;
        this.updateUI();
      } catch (e) {
        console.warn('[Motivation] Auto-change failure');
      }
    }, 15000);
  },

  updateUI() {
    try {
      const quoteEl = document.getElementById('motivation-quote');
      const authEl = document.getElementById('motivation-auth');
      if (quoteEl && authEl) {
        quoteEl.classList.remove('fade-in');
        void quoteEl.offsetWidth;
        const q = this.quotes[this.currentIndex];
        quoteEl.innerText = q.text;
        authEl.innerText = `// ${q.auth}`;
        quoteEl.classList.add('fade-in');
      }
    } catch (e) {
      // Fail silently for background updates
    }
  },

  render() {
    const content = this.app.getContentContainer();
    if (!content) return;

    try {
      content.innerHTML = `
        <div class="space-y-8">
          <div>
            <span class="label-mono text-[var(--accent)] mb-1 block">Module // inspiration</span>
            <h2 class="title-large">Psychological Fuel</h2>
          </div>
          ${this.renderWidget()}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div class="card bg-[var(--accent)]/5 border-[var(--accent)]/20">
                <h3 class="label-mono text-[10px] mb-2 uppercase">Mindset Calibration</h3>
                <p class="text-sm opacity-60">The primary constraint is internal. Optimize your cognitive environment daily.</p>
             </div>
             <div class="card bg-[var(--bg-secondary)] border-[var(--border)]">
                <h3 class="label-mono text-[10px] mb-2 uppercase">Core Value</h3>
                <p class="text-sm opacity-60">Consistency creates compounding returns. Do not break the chain.</p>
             </div>
          </div>
        </div>
      `;
    } catch (e) {
      this.app.renderError('Motivation Logic Offline');
    }
  },

  renderTicker() {
    try {
      return `
        <div class="bg-[var(--bg-tertiary)] border-y border-[var(--border)] overflow-hidden py-1">
          <div class="flex items-center gap-8 whitespace-nowrap animate-marquee">
            ${this.quotes.concat(this.quotes).map(q => `
              <span class="label-mono opacity-60 flex items-center gap-2">
                <span class="w-1 h-1 bg-[var(--accent)] rounded-full"></span>
                ${q.text}
              </span>
            `).join('')}
          </div>
        </div>
        <style>
          @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .animate-marquee { animation: marquee 120s linear infinite; }
        </style>
      `;
    } catch (e) {
      return '';
    }
  },

  renderWidget() {
    try {
      const q = this.quotes[this.currentIndex];
      return `
        <div class="card border-[var(--accent)]/20 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)]">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-full border border-[var(--accent)]/30 flex items-center justify-center shrink-0">
              <span class="text-[var(--accent)] font-serif text-2xl">“</span>
            </div>
            <div class="space-y-4">
              <p id="motivation-quote" class="text-lg font-medium leading-relaxed italic">${q.text}</p>
              <p id="motivation-auth" class="label-mono text-[var(--accent)]">// ${q.auth}</p>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      return '<div class="card opacity-40">System Idle</div>';
    }
  }
};
