/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Goals } from './goals.js';

export const Analytics = {
  init(app) {
    this.app = app;
  },

  calculateSubjectStats() {
    try {
      const subjects = this.app.state?.timetable || [];
      const tracker = this.app.state?.tracker || {};
      const totalCompleted = Object.values(tracker).filter(v => v === true).length;
      const totalDays = this.app.state?.settings?.totalDays || 60;
      
      return subjects.map(s => ({
        name: s.subject || 'Unknown',
        type: s.type || 'N/A',
        completed: Math.min(100, Math.round((totalCompleted / totalDays) * 100)) || 0
      }));
    } catch (e) {
      console.error('[Analytics] Stats calculation failed:', e);
      return [];
    }
  },

  getWeeklyData() {
    try {
      const tracker = this.app.state?.tracker || {};
      const days = [];
      const currentProgress = Object.keys(tracker).length || 0;
      
      for (let i = 6; i >= 0; i--) {
        const dayNum = Math.max(1, currentProgress - i);
        days.push({
          label: `Day ${dayNum}`,
          active: tracker[dayNum] === true
        });
      }
      return days;
    } catch (e) {
      return Array(7).fill({ label: 'N/A', active: false });
    }
  },

  drawChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    try {
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      const padding = 20;
      const chartWidth = width - padding * 2;
      const barWidth = chartWidth / data.length - 10;

      ctx.clearRect(0, 0, width, height);

      data.forEach((d, i) => {
        const x = padding + i * (barWidth + 10);
        const barHeight = d.active ? (height - padding * 2) : 5;
        const y = height - padding - barHeight;

        ctx.fillStyle = d.active ? (getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#3B82F6') : '#27272A';
        
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 4);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, barWidth, barHeight);
        }

        ctx.fillStyle = '#A1A1AA';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(d.label.split(' ')[1] || '', x + barWidth / 2, height - 5);
      });
    } catch (e) {
      console.error('[Analytics] Chart Draw Error:', e);
    }
  },

  render() {
    const content = this.app.getContentContainer();
    if (!content) return;

    try {
      const subjectStats = this.calculateSubjectStats();
      const weeklyData = this.getWeeklyData();

      content.innerHTML = `
        <div class="space-y-12">
          <!-- Growth Metrics Insertion -->
          <div id="goals-performance-anchor"></div>

          <div class="space-y-8">
            <div class="flex items-center justify-between">
              <div>
                <span class="label-mono text-[var(--accent)] mb-1 block">Module // performance</span>
                <h2 class="title-large">System Efficiency</h2>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div class="card lg:col-span-2">
                <h3 class="font-medium mb-6">Weekly Pulse</h3>
                <div class="h-48 rounded-lg border border-[var(--border)] p-4 bg-[var(--bg-primary)]">
                  <canvas id="weekly-chart" class="w-full h-full"></canvas>
                </div>
              </div>

              <div class="card">
                <h3 class="font-medium mb-4">Subject Map</h3>
                <div class="space-y-4">
                  ${subjectStats.length === 0 ? '<p class="opacity-40 text-xs italic">Awaiting timetable subjects to begin mapping.</p>' : subjectStats.map(s => `
                    <div class="space-y-1">
                      <div class="flex justify-between text-[10px] label-mono">
                        <span>${s.name}</span>
                        <span>${s.completed}%</span>
                      </div>
                      <div class="w-full h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                        <div class="h-full bg-[var(--accent)]" style="width: ${s.completed}%"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Compose sub-module: Goals
      const goalsAnchor = document.getElementById('goals-performance-anchor');
      if (goalsAnchor && typeof Goals.render === 'function') {
        const originalContainer = this.app.getContentContainer;
        this.app.getContentContainer = () => goalsAnchor;
        Goals.render();
        this.app.getContentContainer = originalContainer;
      }

      requestAnimationFrame(() => this.drawChart('weekly-chart', weeklyData));
    } catch (e) {
      this.app.renderError('Analytics Module Corrupted');
      console.error('[Analytics] Render failure:', e);
    }
  }
};
