/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const Timetable = {
  init(app) {
    this.app = app;
  },

  addSubject(subjectData) {
    try {
      const subjects = this.app.state?.timetable || [];
      subjects.push({
        id: Date.now().toString(),
        ...subjectData
      });
      this.app.state.timetable = subjects;
      this.app.saveState();
      this.render();
    } catch (e) {
      console.error('[Timetable] Add failure:', e);
    }
  },

  deleteSubject(id) {
    try {
      const subjects = this.app.state?.timetable || [];
      this.app.state.timetable = subjects.filter(s => s.id !== id);
      this.app.saveState();
      this.render();
    } catch (e) {
      console.error('[Timetable] Delete failure:', e);
    }
  },

  render() {
    const content = this.app.getContentContainer();
    if (!content) return;

    try {
      const subjects = this.app.state?.timetable || [];

      content.innerHTML = `
        <div class="space-y-8">
          <div class="flex items-center justify-between">
            <div>
              <span class="label-mono text-[var(--accent)] mb-1 block">Module // schedule</span>
              <h2 class="title-large">Study Schedule</h2>
            </div>
            <button id="add-subject-btn" class="btn btn-primary">
              Add Subject
            </button>
          </div>

          <div id="subject-form-container" class="hidden">
             <div class="card bg-[var(--bg-tertiary)] mb-8">
              <h3 class="font-medium mb-4">Add/Edit Subject</h3>
              <form id="subject-form" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="label-mono opacity-60">Subject Name</label>
                  <input type="text" name="subject" required class="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-2 text-sm focus:border-[var(--accent)]" placeholder="e.g. Mathematics">
                </div>
                <div class="space-y-2">
                  <label class="label-mono opacity-60">Class Name</label>
                  <input type="text" name="className" required class="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-2 text-sm focus:border-[var(--accent)]" placeholder="e.g. Linear Algebra">
                </div>
                <div class="space-y-2">
                  <label class="label-mono opacity-60">Book/Reference</label>
                  <input type="text" name="book" class="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-2 text-sm focus:border-[var(--accent)]" placeholder="e.g. Thomas Calculus">
                </div>
                <div class="space-y-2">
                  <label class="label-mono opacity-60">Time</label>
                  <input type="time" name="time" required class="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-2 text-sm focus:border-[var(--accent)]">
                </div>
                <div class="space-y-2">
                  <label class="label-mono opacity-60">Type</label>
                  <select name="type" class="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-2 text-sm focus:border-[var(--accent)]">
                    <option value="LIVE">LIVE</option>
                    <option value="BACKLOOK">BACKLOOK</option>
                    <option value="ONLINE">ONLINE</option>
                    <option value="OFFLINE">OFFLINE</option>
                    <option value="RESEARCH">RESEARCH</option>
                  </select>
                </div>
                <div class="md:col-span-2 flex justify-end gap-2 mt-2">
                  <button type="button" id="cancel-form-btn" class="btn btn-ghost border border-[var(--border)]">Cancel</button>
                  <button type="submit" class="btn btn-primary">Save Subject</button>
                </div>
              </form>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${subjects.length === 0 ? `
              <div class="card md:col-span-3 text-center py-12 opacity-40">
                <p class="label-mono uppercase">Archive Empty // No active nodes</p>
              </div>
            ` : subjects.map(s => `
              <div class="card group relative hover:border-[var(--accent)]/50 transition-colors">
                <button class="delete-subject-btn absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--error)] hover:bg-[var(--error)]/10 px-2 py-1 rounded text-[10px] label-mono" data-id="${s.id}">
                  FLUSH
                </button>
                <div class="flex items-center gap-2 mb-4">
                  <span class="label-mono text-[var(--accent)] text-xs">${s.time}</span>
                  <span class="w-1 h-1 bg-[var(--border)] rounded-full"></span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono border border-[var(--border)] bg-[var(--bg-tertiary)] uppercase">${s.type}</span>
                </div>
                <h3 class="font-bold text-lg mb-1">${s.subject}</h3>
                <p class="text-sm text-[var(--text-secondary)] mb-4">${s.className}</p>
                <div class="pt-4 border-t border-[var(--border)] flex items-center gap-2">
                  <span class="label-mono opacity-40 text-[9px]">REF //</span>
                  <span class="text-[10px] truncate">${s.book || 'N/A'}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      this.attachEvents();
    } catch (e) {
      this.app.renderError('Timetable Engine Fault');
    }
  },

  attachEvents() {
    const addBtn = document.getElementById('add-subject-btn');
    const formContainer = document.getElementById('subject-form-container');
    const form = document.getElementById('subject-form');
    const cancelBtn = document.getElementById('cancel-form-btn');
    const deleteBtns = document.querySelectorAll('.delete-subject-btn');

    if (addBtn) {
      addBtn.onclick = () => {
        formContainer?.classList.remove('hidden');
        addBtn.classList.add('hidden');
      };
    }

    if (cancelBtn) {
      cancelBtn.onclick = () => {
        formContainer?.classList.add('hidden');
        addBtn?.classList.remove('hidden');
        form?.reset();
      };
    }

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        this.addSubject(data);
      };
    }

    deleteBtns.forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Disconnect this module?')) {
          this.deleteSubject(id);
        }
      };
    });
  }
};
