/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const Gamification = {
  levels: [
    { name: 'Beginner', minXp: 0, color: 'var(--text-secondary)' },
    { name: 'Intermediate', minXp: 500, color: 'var(--accent)' },
    { name: 'Advanced', minXp: 1500, color: 'var(--warning)' },
    { name: 'Topper', minXp: 3000, color: 'var(--success)' }
  ],

  badges: [
    { id: 'streak_7', name: 'Week Warrior', desc: '7 Day Streak reached', icon: '⚡' },
    { id: 'no_skip', name: 'Iron Will', desc: 'No days skipped in tracker', icon: '🛡️' }
  ],

  init(app) {
    this.app = app;
    this.syncXPFromTracker();
  },

  syncXPFromTracker() {
    try {
      const tracker = this.app.state?.tracker || {};
      const completedDays = Object.values(tracker).filter(v => v === true).length;
      if (!this.app.state.gamification) this.app.state.gamification = { xp: 0, badges: [] };
      
      this.app.state.gamification.xp = completedDays * 100;
      this.checkBadges();
      this.app.saveState();
    } catch (e) {
      console.error('[Gamification] XP Sync Failure:', e);
    }
  },

  updateXP(amount) {
    if (!this.app.state.gamification) return;
    this.app.state.gamification.xp += amount;
    this.checkBadges();
    this.app.saveState();
    
    // Only re-render if we are actually viewing the module
    if (this.app.state.currentTab === 'evolution') {
      this.app.renderSafe('evolution');
    }
  },

  checkBadges() {
    try {
      const gamification = this.app.state?.gamification;
      const goals = this.app.state?.goals || {};
      if (!gamification) return;

      const earned = Array.isArray(gamification.badges) ? gamification.badges : [];

      if (goals.streak >= 7 && !earned.includes('streak_7')) {
        earned.push('streak_7');
      }

      gamification.badges = earned;
    } catch (e) {
      console.error('[Gamification] Badge Check Error:', e);
    }
  },

  getCurrentLevel() {
    try {
      const xp = this.app.state?.gamification?.xp || 0;
      return [...this.levels].reverse().find(l => xp >= l.minXp) || this.levels[0];
    } catch (e) {
      return this.levels[0];
    }
  },

  render() {
    const content = this.app.getContentContainer();
    if (!content) return;

    try {
      const gamification = this.app.state?.gamification || { xp: 0, badges: [] };
      const currentLevel = this.getCurrentLevel();
      const currentLevelIdx = this.levels.indexOf(currentLevel);
      const nextLevel = this.levels[currentLevelIdx + 1];
      
      let progress = 100;
      if (nextLevel) {
        const range = nextLevel.minXp - currentLevel.minXp;
        const currentProgress = gamification.xp - currentLevel.minXp;
        progress = Math.min(100, (currentProgress / range) * 100);
      }

      const earnedBadges = this.badges.filter(b => (gamification.badges || []).includes(b.id));

      content.innerHTML = `
        <div class="space-y-8">
          <div>
            <span class="label-mono text-[var(--accent)] mb-1 block">Module // rewards</span>
            <h2 class="title-large">Evolution Progress</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="card bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] overflow-hidden">
              <div class="space-y-6">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="label-mono opacity-60 mb-1">Status</p>
                    <h3 class="text-3xl font-bold" style="color: ${currentLevel.color}">${currentLevel.name}</h3>
                  </div>
                  <div class="text-right">
                    <p class="label-mono opacity-60 mb-1">Total XP</p>
                    <p class="text-2xl font-mono text-[var(--accent)]">${gamification.xp}</p>
                  </div>
                </div>

                <div class="space-y-1">
                  <div class="flex justify-between text-[10px] label-mono opacity-40">
                    <span>${currentLevel.name}</span>
                    <span>${nextLevel ? nextLevel.name : 'Max Level'}</span>
                  </div>
                  <div class="w-full h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                    <div class="h-full bg-[var(--accent)] transition-all duration-1000" style="width: ${progress}%"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <h3 class="font-medium mb-4">Badges Locked</h3>
              <div class="grid grid-cols-2 gap-3">
                ${this.badges.map(b => {
                  const has = gamification.badges?.includes(b.id);
                  return `
                    <div class="p-2 border border-[var(--border)] rounded flex items-center gap-2 ${has ? 'opacity-100' : 'opacity-20'}">
                      <span class="text-xl">${b.icon}</span>
                      <span class="text-[10px] label-mono uppercase">${b.name}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      this.app.renderError('Gamification Module Failure');
    }
  }
};
