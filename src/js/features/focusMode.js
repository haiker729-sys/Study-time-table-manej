/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const FocusMode = {
  init(app) {
    this.app = app;
    this.timer = null;
    
    // Reset state if not present
    if (!this.app.state.focus) {
       this.app.state.focus = {
          timeLeft: 1500,
          isActive: false,
          isBreak: false,
          sessionsCompleted: 0
       };
    }
  },

  start() {
    if (this.timer) return;
    this.app.state.focus.isActive = true;
    this.timer = setInterval(() => {
      if (this.app.state.focus.timeLeft > 0) {
        this.app.state.focus.timeLeft--;
        this.updateDisplay();
      } else {
        this.completeSession();
      }
    }, 1000);
    this.render();
  },

  stop() {
    clearInterval(this.timer);
    this.timer = null;
    this.app.state.focus.isActive = false;
    this.render();
  },

  reset() {
    this.stop();
    this.app.state.focus.isBreak = false;
    this.app.state.focus.timeLeft = 1500;
    this.render();
  },

  completeSession() {
    this.stop();
    const isBreak = this.app.state.focus.isBreak;
    
    if (!isBreak) {
      this.app.state.focus.sessionsCompleted++;
      // Award XP
      const gamification = this.app.modules.get('gamification');
      if (gamification) gamification.updateXP(25);
      
      // Notify
      const notifications = this.app.modules.get('notifications');
      if (notifications) notifications.showNotification('Focus Session Complete!', 'Time for a 5 minute break.');
      
      this.app.state.focus.isBreak = true;
      this.app.state.focus.timeLeft = 300; // 5 mins
    } else {
      const notifications = this.app.modules.get('notifications');
      if (notifications) notifications.showNotification('Break Over!', 'Ready to focus again?');
      
      this.app.state.focus.isBreak = false;
      this.app.state.focus.timeLeft = 1500;
    }
    
    this.app.saveState();
    this.render();
  },

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  updateDisplay() {
    const el = document.getElementById('focus-timer-display');
    if (el) {
      el.innerText = this.formatTime(this.app.state.focus.timeLeft);
    }
  },

  render() {
    const content = this.app.getContentContainer();
    if (!content) return;

    try {
      const focus = this.app.state.focus;
      
      content.innerHTML = `
        <div class="space-y-8">
          <div>
            <span class="label-mono text-[var(--accent)] mb-1 block">Module // focus</span>
            <h2 class="title-large">Deep Work Chamber</h2>
          </div>

          <div class="flex flex-col items-center justify-center py-12 space-y-8">
             <div class="relative w-64 h-64 flex items-center justify-center">
                <div class="absolute inset-0 rounded-full border-4 border-[var(--border)] opacity-20"></div>
                <div class="absolute inset-0 rounded-full border-4 border-[var(--accent)] transition-all duration-1000" 
                     style="clip-path: inset(0 0 0 0); transform: rotate(-90deg); stroke-dasharray: 100; stroke-dashoffset: ${100 - (focus.timeLeft / (focus.isBreak ? 300 : 1500)) * 100}"></div>
                <div class="text-center">
                   <p class="label-mono opacity-40 mb-2 uppercase">${focus.isBreak ? 'Break Protocol' : 'Focus Active'}</p>
                   <h1 id="focus-timer-display" class="text-6xl font-mono font-bold">${this.formatTime(focus.timeLeft)}</h1>
                </div>
             </div>

             <div class="flex gap-4">
                ${!focus.isActive ? `
                   <button id="start-focus-btn" class="btn btn-primary px-8 py-4 label-mono uppercase text-xs">Initialize Session</button>
                ` : `
                   <button id="stop-focus-btn" class="btn btn-ghost border border-[var(--error)] text-[var(--error)] px-8 py-4 label-mono uppercase text-xs">Abort Session</button>
                `}
                <button id="reset-focus-btn" class="btn btn-ghost border border-[var(--border)] px-8 py-4 label-mono uppercase text-xs">Reset</button>
             </div>

             <div class="grid grid-cols-2 gap-4 w-full max-w-md">
                <div class="card text-center py-6">
                   <p class="label-mono opacity-40 text-[9px] mb-1">COMPLETED</p>
                   <p class="text-2xl font-bold">${focus.sessionsCompleted}</p>
                </div>
                <div class="card text-center py-6">
                   <p class="label-mono opacity-40 text-[9px] mb-1">XP EARNED</p>
                   <p class="text-2xl font-bold text-[var(--accent)]">${focus.sessionsCompleted * 25}</p>
                </div>
             </div>
          </div>
          
          <div class="card bg-[var(--bg-secondary)]/50 border-l-4 border-[var(--accent)]">
             <h3 class="label-mono text-xs mb-2 opacity-60">System Instruction</h3>
             <p class="text-xs leading-relaxed opacity-80">
                The Pomodoro Technique uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks. 
                Focus sessions award **25 XP** each to your evolution profile.
             </p>
          </div>
        </div>
      `;

      this.attachEvents();
    } catch (e) {
      this.app.renderError('Focus System Failure');
    }
  },

  attachEvents() {
    const startBtn = document.getElementById('start-focus-btn');
    const stopBtn = document.getElementById('stop-focus-btn');
    const resetBtn = document.getElementById('reset-focus-btn');

    if (startBtn) startBtn.onclick = () => this.start();
    if (stopBtn) stopBtn.onclick = () => this.stop();
    if (resetBtn) resetBtn.onclick = () => this.reset();
  }
};
