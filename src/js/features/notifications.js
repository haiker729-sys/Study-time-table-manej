/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const Notifications = {
  init(app) {
    this.app = app;
    this.requestPermission();
    if (this.checkInterval) clearInterval(this.checkInterval);
    this.checkInterval = setInterval(() => {
      try {
        this.checkSchedule();
      } catch (e) {
        console.warn('[Notifications] Interval check fault');
      }
    }, 60000); // Check every minute
  },

  async requestPermission() {
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    } catch (e) {
      console.warn('[Notifications] Permission request failed');
    }
  },

  showNotification(title, body) {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
      this.showPopup(title, body);
    } catch (e) {
      console.error('[Notifications] UI failure:', e);
    }
  },

  showPopup(title, body) {
    try {
      let container = document.getElementById('notification-overlay');
      if (!container) {
        container = document.createElement('div');
        container.id = 'notification-overlay';
        container.className = 'fixed top-4 right-4 z-[100] space-y-4 max-w-sm w-full';
        document.body.appendChild(container);
      }
      
      const popup = document.createElement('div');
      popup.className = 'card bg-[var(--bg-tertiary)] border-[var(--accent)] fade-in shadow-xl p-4';
      popup.innerHTML = `
        <div class="flex gap-4">
          <div class="w-10 h-10 bg-[var(--accent)] rounded-lg flex items-center justify-center shrink-0">
             <span class="text-white font-bold">!</span>
          </div>
          <div class="flex-1 overflow-hidden">
            <p class="label-mono text-[var(--accent)] text-[10px] mb-1">System Alert</p>
            <p class="font-bold text-sm mb-1 truncate">${title}</p>
            <p class="text-xs text-[var(--text-secondary)] line-clamp-2">${body}</p>
          </div>
          <button class="close-popup opacity-40 hover:opacity-100 p-1">×</button>
        </div>
      `;

      container.appendChild(popup);
      
      const close = popup.querySelector('.close-popup');
      if (close) {
        close.onclick = () => popup.remove();
      }
      setTimeout(() => { if (popup.parentNode) popup.remove(); }, 8000);
    } catch (e) {
      console.error('[Notifications] Popup failed:', e);
    }
  },

  checkSchedule() {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    try {
      const subjects = this.app.state?.timetable || [];
      subjects.forEach(subject => {
        if (subject.time === currentTime) {
          this.showNotification(`Class Starting: ${subject.subject}`, `${subject.className || ''} (${subject.type}) is active now.`);
        }
      });

      const targetTime = this.app.state?.settings?.alertTiming;
      if (targetTime && currentTime === targetTime) {
        this.showNotification("Daily Goal Reminder", "Have you started your focus sessions for today?");
      }
    } catch (e) {
      console.error('[Notifications] Schedule check error:', e);
    }
  },

  render() {
    const content = this.app.getContentContainer();
    if (!content) return;

    try {
      content.innerHTML = `
         <div class="space-y-8">
          <div>
            <span class="label-mono text-[var(--accent)] mb-1 block">Module // tips</span>
            <h2 class="title-large">Communication Bus</h2>
          </div>

          <div class="card">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-medium">Active Monitoring</h3>
              <span class="label-mono text-[var(--success)] text-xs">System Online</span>
            </div>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)]">
                 <div class="flex items-center gap-3">
                    <div class="w-1.5 h-1.5 bg-[var(--accent)] rounded-full"></div>
                    <span class="text-sm">Subject Proximity Alerts</span>
                 </div>
                 <span class="label-mono opacity-40 text-[9px]">EN_AUTO</span>
              </div>
              <div class="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)]">
                 <div class="flex items-center gap-3">
                    <div class="w-1.5 h-1.5 bg-[var(--warning)] rounded-full"></div>
                    <span class="text-sm">Target Synchronization</span>
                 </div>
                 <span class="label-mono opacity-40 text-[9px]">EN_AUTO</span>
              </div>
            </div>
          </div>

          <div class="card">
             <h3 class="font-medium mb-4">Signal Test</h3>
             <button id="test-notif-btn" class="btn btn-ghost border border-[var(--border)] w-full py-4 label-mono text-xs">
                PING SYSTEM BUS
             </button>
          </div>
        </div>
      `;

      this.attachEvents();
    } catch (e) {
      this.app.renderError('Notifications Logic Corrupted');
    }
  },

  attachEvents() {
    const testBtn = document.getElementById('test-notif-btn');
    if (testBtn) {
      testBtn.onclick = () => {
        this.showNotification("Ping Result", "Aether communication link validated. Signal strength nominal.");
      };
    }
  }
};
