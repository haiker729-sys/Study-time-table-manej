/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const Goals = {
  init(app) {
    this.app = app;
    try {
      this.checkStreak();
    } catch (e) {
      console.error('[Goals] Initialization error:', e);
    }
  },

  checkStreak() {
    try {
      const goals = this.app.state?.goals;
      if (!goals || !goals.lastCompletedDate) return;

      const today = new Date().toISOString().split('T')[0];
      const lastDate = new Date(goals.lastCompletedDate);
      const diffTime = Math.abs(new Date(today) - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        goals.streak = 0;
        this.app.saveState();
      }
    } catch (e) {
      console.warn('[Goals] Streak check failure');
    }
  },

  completeDailyTarget() {
    try {
      const goals = this.app.state?.goals;
      if (!goals) return;

      const today = new Date().toISOString().split('T')[0];
      if (goals.lastCompletedDate === today) return;

      goals.streak = (goals.streak || 0) + 1;
      if (goals.streak > (goals.longestStreak || 0)) {
        goals.longestStreak = goals.streak;
      }
      goals.lastCompletedDate = today;
      
      this.app.saveState();
      
      if (this.app.state.currentTab === 'analytics') {
        this.app.renderSafe('analytics');
      }
      
      // Award XP via gamification if possible
      const gamification = this.app.modules?.get('gamification');
      if (gamification && typeof gamification.updateXP === 'function') {
        gamification.updateXP(50); // Bonus for daily target
      }
    } catch (e) {
      console.error('[Goals] Resource update error:', e);
    }
  },

  render() {
    const content = this.app.getContentContainer();
    if (!content) return;

    try {
      const goals = this.app.state?.goals || { streak: 0, longestStreak: 0 };
      const settings = this.app.state?.settings || { studyHours: 0 };
      const today = new Date().toISOString().split('T')[0];
      const isCompletedToday = goals.lastCompletedDate === today;

      content.innerHTML = `
        <div class="space-y-8">
          <div>
            <span class="label-mono text-[var(--accent)] mb-1 block">Module // analytics</span>
            <h2 class="title-large">Growth Metrics</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="card flex flex-col items-center justify-center py-8">
              <span class="label-mono opacity-60 text-[10px] uppercase mb-2">Current Streak</span>
              <span class="text-4xl font-bold text-[var(--accent)]">${goals.streak}</span>
              <span class="label-mono text-[var(--success)] text-[9px] mt-2">Days Sync</span>
            </div>

            <div class="card flex flex-col items-center justify-center py-8">
              <span class="label-mono opacity-60 text-[10px] uppercase mb-2">Peak Streak</span>
              <span class="text-4xl font-bold">${goals.longestStreak}</span>
              <span class="label-mono opacity-40 text-[9px] mt-2">Historical High</span>
            </div>

            <div class="card flex flex-col items-center justify-center py-8">
              <span class="label-mono opacity-60 text-[10px] uppercase mb-2">Active Target</span>
              <span class="text-4xl font-bold text-[var(--warning)]">${settings.studyHours}h</span>
              <span class="label-mono opacity-40 text-[9px] mt-2">Daily Threshold</span>
            </div>
          </div>

          <div class="card border-l-4 border-[var(--accent)]">
            <h3 class="font-medium mb-6 uppercase label-mono text-xs opacity-60">Objective Control</h3>
            <div class="space-y-6">
              <div>
                <div class="flex justify-between text-[10px] label-mono mb-2 uppercase">
                  <span>Logic Synchronization</span>
                  <span class="${isCompletedToday ? 'text-[var(--success)]' : 'text-[var(--warning)]'}">
                    ${isCompletedToday ? 'SECURED' : 'PENDING'}
                  </span>
                </div>
                <div class="w-full h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                  <div class="h-full bg-[var(--accent)] transition-all duration-1000" style="width: ${isCompletedToday ? '100%' : '5%'}"></div>
                </div>
              </div>
              
              ${!isCompletedToday ? `
                <button id="complete-goal-btn" class="btn btn-primary w-full py-4 text-xs label-mono">
                  COMMIT DAILY OBJECTIVE
                </button>
              ` : `
                <div class="bg-[var(--success)]/5 text-[var(--success)] p-4 rounded border border-[var(--success)]/20 text-center label-mono text-xs">
                  OBJECTIVE SECURED // DATA COMMITTED TO ARCHIVE
                </div>
              `}
            </div>
          </div>
        </div>
      `;

      this.attachEvents();
    } catch (e) {
      this.app.renderError('Analytics Engine Failure');
    }
  },

  attachEvents() {
    const btn = document.getElementById('complete-goal-btn');
    if (btn) {
      btn.onclick = () => this.completeDailyTarget();
    }
  }
};
