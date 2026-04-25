/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Motivation } from './motivation.js';

export const Tracker = {
  init(app) {
    this.app = app;
  },

  toggleDay(dayIndex) {
    try {
      const tracker = this.app.state?.tracker || {};
      tracker[dayIndex] = !tracker[dayIndex];
      this.app.state.tracker = tracker;
      this.app.saveState();
      
      // Sync XP if gamification is registered
      const gamification = this.app.modules?.get('gamification');
      if (gamification && typeof gamification.syncXPFromTracker === 'function') {
        gamification.syncXPFromTracker();
      }

      if (this.app.state.currentTab === 'tracker') {
        this.app.renderSafe('tracker');
      }
    } catch (e) {
      console.error('[Tracker] State update failure:', e);
    }
  },

  calculateProgress() {
    try {
      const totalDays = this.app.state?.settings?.totalDays || 60;
      const tracker = this.app.state?.tracker || {};
      const completedCount = Object.values(tracker).filter(val => val === true).length;
      return {
        completed: completedCount,
        total: totalDays,
        percentage: Math.min(100, Math.round((completedCount / totalDays) * 100)) || 0
      };
    } catch (e) {
      return { completed: 0, total: 60, percentage: 0 };
    }
  },

  render() {
    const content = this.app.getContentContainer();
    if (!content) return;

    try {
      const totalDays = this.app.state?.settings?.totalDays || 60;
      const tracker = this.app.state?.tracker || {};
      const progress = this.calculateProgress();

      content.innerHTML = `
        <div class="space-y-8">
          ${Motivation.renderWidget ? Motivation.renderWidget() : ''}
          
          <div class="flex items-center justify-between">
            <div>
              <span class="label-mono text-[var(--accent)] mb-1 block">Module // tracker</span>
              <h2 class="title-large">Success Tracker</h2>
            </div>
            <div class="flex items-center gap-4">
               <div class="text-right">
                  <p class="label-mono opacity-60">Success Rate</p>
                  <p class="font-bold text-xl text-[var(--accent)]">${progress.percentage}%</p>
               </div>
               <div class="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center bg-[var(--bg-secondary)]">
                  <span class="label-mono text-[var(--accent)] text-[10px]">${progress.completed}/${progress.total}</span>
               </div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-medium">Active Sprint Progress</h3>
              <span class="label-mono opacity-40 text-[9px]">ID: TRACKER_GRID_01</span>
            </div>
            
            <div class="grid grid-cols-5 sm:grid-cols-10 gap-3">
              ${Array.from({ length: totalDays }).map((_, i) => {
                const dayNum = i + 1;
                const isCompleted = tracker[dayNum] === true;
                return `
                  <button 
                    class="tracker-day h-12 rounded-lg border flex flex-col items-center justify-center transition-all ${isCompleted ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-[var(--bg-primary)] border-[var(--border)] opacity-60 hover:opacity-100 hover:border-[var(--accent)]'}"
                    data-day="${dayNum}"
                  >
                    <span class="label-mono text-[8px] opacity-40 ${isCompleted ? 'text-white/80' : ''}">DAY</span>
                    <span class="font-mono text-sm font-bold">${dayNum.toString().padStart(2, '0')}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div class="card bg-[var(--bg-secondary)]/30 border-l-4 border-[var(--warning)]">
                <h3 class="label-mono text-[10px] opacity-60 mb-2 uppercase">Penalty Protocol</h3>
                <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
                  ${this.app.state.settings?.penaltyRules || 'No penalties defined.'}
                </p>
             </div>
             <div class="card bg-[var(--bg-secondary)]/30 border-l-4 border-[var(--accent)]">
                <h3 class="label-mono text-[10px] opacity-60 mb-2 uppercase">Reward Protocol</h3>
                <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
                  ${this.app.state.settings?.rewardRules || 'No rewards defined.'}
                </p>
             </div>
          </div>
        </div>
      `;

      this.attachEvents();
    } catch (e) {
      this.app.renderError('Tracker Module Offline');
    }
  },

  attachEvents() {
    const days = document.querySelectorAll('.tracker-day');
    days.forEach(day => {
      day.onclick = () => {
        const dayNum = day.getAttribute('data-day');
        this.toggleDay(dayNum);
      };
    });
  }
};
