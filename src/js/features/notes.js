/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const Notes = {
  init(app) {
    this.app = app;
  },

  addNote(text, subjectId) {
    try {
      if (!text || text.trim() === '') return;
      const notes = this.app.state?.notes || [];
      notes.push({
        id: Date.now().toString(),
        text: text.trim(),
        subjectId,
        date: new Date().toISOString()
      });
      this.app.state.notes = notes;
      this.app.saveState();
      this.render();
    } catch (e) {
      console.error('[Notes] Add Error:', e);
    }
  },

  deleteNote(id) {
    try {
      const notes = this.app.state?.notes || [];
      this.app.state.notes = notes.filter(n => n.id !== id);
      this.app.saveState();
      this.render();
    } catch (e) {
      console.error('[Notes] Delete Error:', e);
    }
  },

  updateNote(id, newText) {
    try {
      const notes = this.app.state?.notes || [];
      const note = notes.find(n => n.id === id);
      if (note && newText) {
        note.text = newText.trim();
        this.app.saveState();
        this.render();
      }
    } catch (e) {
      console.error('[Notes] Update Error:', e);
    }
  },

  render() {
    const content = this.app.getContentContainer();
    if (!content) return;

    try {
      const notes = this.app.state?.notes || [];
      const subjects = this.app.state?.timetable || [];

      content.innerHTML = `
        <div class="space-y-8">
          <div>
            <span class="label-mono text-[var(--accent)] mb-1 block">Module // archive</span>
            <h2 class="title-large">Study Notebook</h2>
          </div>

          <div class="card">
            <h3 class="font-medium mb-4">New Entry</h3>
            <form id="note-form" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="md:col-span-2">
                  <label class="label-mono opacity-60 mb-1 block">Content</label>
                  <textarea id="note-text" required class="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--accent)] h-24" placeholder="Log node.."></textarea>
                </div>
                <div class="space-y-4">
                  <div>
                    <label class="label-mono opacity-60 mb-1 block">Subject Reference</label>
                    <select id="note-subject" class="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-3 text-sm">
                      <option value="general">General Observation</option>
                      ${subjects.map(s => `<option value="${s.id}">${s.subject}</option>`).join('')}
                    </select>
                  </div>
                  <button type="submit" class="btn btn-primary w-full py-4 uppercase">Register Entry</button>
                </div>
              </div>
            </form>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${notes.length === 0 ? `
              <div class="md:col-span-2 py-12 text-center opacity-40 border-2 border-dashed border-[var(--border)] rounded-xl">
                 <p class="label-mono">Archive Empty</p>
              </div>
            ` : notes.slice().reverse().map(note => `
              <div class="card group transition-all hover:border-[var(--accent)]/40">
                <div class="flex justify-between items-start mb-3">
                  <span class="label-mono text-[9px] text-[var(--accent)] px-2 py-1 border border-[var(--accent)]/20 rounded">
                    ${subjects.find(s => s.id === note.subjectId)?.subject || 'General'}
                  </span>
                  <div class="flex gap-2">
                    <button class="edit-note-btn text-[10px] label-mono opacity-40 hover:opacity-100" data-id="${note.id}">EDIT</button>
                    <button class="delete-note-btn text-[10px] label-mono opacity-40 hover:text-[var(--error)]" data-id="${note.id}">FLUSH</button>
                  </div>
                </div>
                <p class="text-sm whitespace-pre-wrap">${note.text}</p>
                <div class="mt-4 pt-3 border-t border-[var(--border)] label-mono text-[8px] opacity-20">
                   ${new Date(note.date).toLocaleString()}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      this.attachEvents();
    } catch (e) {
      this.app.renderError('Notebook System Corrupted');
    }
  },

  attachEvents() {
    const form = document.getElementById('note-form');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const text = document.getElementById('note-text').value;
        const sub = document.getElementById('note-subject').value;
        this.addNote(text, sub);
        form.reset();
      };
    }

    const editBtns = document.querySelectorAll('.edit-note-btn');
    editBtns.forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const note = this.app.state.notes.find(n => n.id === id);
        const next = prompt('Edit record:', note?.text || '');
        if (next) this.updateNote(id, next);
      };
    });

    const delBtns = document.querySelectorAll('.delete-note-btn');
    delBtns.forEach(btn => {
      btn.onclick = () => {
        if (confirm('Flush this record?')) this.deleteNote(btn.getAttribute('data-id'));
      };
    });
  }
};
