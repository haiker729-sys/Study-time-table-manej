/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const Settings = {
  init(app) {
    this.app = app;
  },

  updateSettings(newData) {
    try {
      this.app.state.settings = {
        ...(this.app.state?.settings || {}),
        ...newData
      };
      this.app.saveState();
      this.render();
      // Safe re-render of layout
      if (typeof this.app.renderLayout === 'function') {
        this.app.renderLayout();
      }
    } catch (e) {
      console.error('[Settings] Update Failure:', e);
    }
  },

  render() {
    const content = this.app.getContentContainer();
    if (!content) return;

    try {
      const s = this.app.state?.settings || {};

      content.innerHTML = `
        <div class="space-y-8">
          <div>
            <span class="label-mono text-[var(--accent)] mb-1 block">Module // settings</span>
            <h2 class="title-large">Control Center</h2>
          </div>

          <div class="card max-w-2xl">
            <form id="settings-form" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="label-mono opacity-60">Total Challenge Days</label>
                  <input type="number" name="totalDays" value="${s.totalDays || 60}" class="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-2 text-sm focus:border-[var(--accent)]">
                </div>
                <div class="space-y-2">
                  <label class="label-mono opacity-60">Study Hours Target</label>
                  <input type="number" name="studyHours" value="${s.studyHours || 4}" class="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-2 text-sm focus:border-[var(--accent)]">
                </div>
                <div class="space-y-2">
                  <label class="label-mono opacity-60">Alert Timing</label>
                  <input type="time" name="alertTiming" value="${s.alertTiming || '08:00'}" class="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-2 text-sm focus:border-[var(--accent)]">
                </div>
              </div>

              <div class="space-y-2">
                <label class="label-mono opacity-60">Penalty Rules</label>
                <textarea name="penaltyRules" rows="3" class="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-2 text-sm focus:border-[var(--accent)]">${s.penaltyRules || ''}</textarea>
              </div>

              <div class="space-y-2">
                <label class="label-mono opacity-60">Reward Rules</label>
                <textarea name="rewardRules" rows="3" class="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-2 text-sm focus:border-[var(--accent)]">${s.rewardRules || ''}</textarea>
              </div>

              <div class="pt-4 border-t border-[var(--border)] flex justify-end">
                <button type="submit" class="btn btn-primary">Save Configuration</button>
              </div>
            </form>
          </div>

          <div class="card max-w-2xl border-[var(--error)]/20 bg-[var(--error)]/5">
             <h3 class="font-medium text-[var(--error)] mb-2">System Purge</h3>
             <p class="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
                This action will permanently delete all local data, including timetable nodes and tracker progress. This cannot be reversed.
             </p>
             <button id="reset-app-btn" class="btn btn-ghost text-[var(--error)] border border-[var(--error)]/20 hover:bg-[var(--error)] hover:text-white uppercase text-[10px] label-mono">
                Initialize Data Wipe
             </button>
          </div>
        </div>
      `;

      this.attachEvents();
    } catch (e) {
      this.app.renderError('Settings Interface Offline');
    }
  },

  attachEvents() {
    const form = document.getElementById('settings-form');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.totalDays = parseInt(data.totalDays) || 60;
        data.studyHours = parseInt(data.studyHours) || 4;
        this.updateSettings(data);
      };
    }

    const resetBtn = document.getElementById('reset-app-btn');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm('Confirm complete system purge? All progress data will be lost.')) {
          localStorage.clear();
          window.location.reload();
        }
      };
    }
  }
};
