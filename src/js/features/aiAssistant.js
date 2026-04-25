/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AI } from '../core/ai.js';

export const AIAssistant = {
  init(app) {
    this.app = app;
    this.history = [];
    this.isLoading = false;
  },

  async sendMessage(text) {
    if (!text.trim() || this.isLoading) return;

    this.isLoading = true;
    this.history.push({ role: 'user', text });
    if (this.app.state.currentTab === 'ai') {
      this.app.renderSafe('ai');
    }
    
    try {
      const response = await AI.askAI(text, this.app.state);
      this.history.push({ role: 'assistant', text: response });
    } catch (e) {
      this.history.push({ role: 'error', text: 'Cognitive loop failed. Check connection.' });
    } finally {
      this.isLoading = false;
      if (this.app.state.currentTab === 'ai') {
        this.app.renderSafe('ai');
      }
      this.scrollToBottom();
    }
  },

  scrollToBottom() {
    const list = document.getElementById('chat-history');
    if (list) list.scrollTop = list.scrollHeight;
  },

  render() {
    const content = this.app.getContentContainer();
    if (!content) return;

    content.innerHTML = `
      <div class="space-y-8 animate-fade-in">
        <div>
          <span class="label-mono text-[var(--accent)] mb-1 block">Module // intelligence</span>
          <h2 class="title-large">Aether Core AI</h2>
        </div>

        <div class="card flex flex-col h-[500px] p-0 overflow-hidden border-[var(--accent)]/20 shadow-lg shadow-[var(--accent)]/5">
          <div id="chat-history" class="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-custom bg-[var(--bg-primary)]/50">
            ${this.history.length === 0 ? `
              <div class="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-4">
                <div class="w-12 h-12 bg-[var(--accent)]/10 rounded-full flex items-center justify-center">
                  <span class="text-xl">✨</span>
                </div>
                <p class="text-sm label-mono">Aether Neural Link Ready.<br>Ask about your study plan or performance.</p>
              </div>
            ` : this.history.map(msg => `
              <div class="flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}">
                <div class="max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-[var(--accent)] text-white' 
                    : msg.role === 'error'
                      ? 'bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/20'
                      : 'bg-[var(--bg-secondary)] border border-[var(--border)]'
                }">
                  ${msg.text}
                </div>
              </div>
            `).join('')}
            ${this.isLoading ? `
              <div class="flex justify-start">
                <div class="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-4 py-3">
                  <div class="flex gap-1">
                    <div class="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse"></div>
                    <div class="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                    <div class="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>

          <div class="p-4 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
            <form id="ai-chat-form" class="flex gap-2">
              <input 
                id="ai-input"
                type="text" 
                placeholder="Ask Aether..." 
                class="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
                ${this.isLoading ? 'disabled' : ''}
              >
              <button type="submit" class="btn btn-primary px-4" ${this.isLoading ? 'disabled' : ''}>
                <span class="label-mono text-xs">SEND</span>
              </button>
            </form>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button class="suggestion-chip" data-query="Suggest a 60 day plan based on my subjects.">
            <span class="block font-medium">60 Day Plan</span>
            <span class="text-[10px] opacity-60">Generate roadmap</span>
          </button>
          <button class="suggestion-chip" data-query="Which subject should I focus on today?">
            <span class="block font-medium">Daily Focus</span>
            <span class="text-[10px] opacity-60">Optimal subject</span>
          </button>
          <button class="suggestion-chip" data-query="What are my weakest areas based on stats?">
            <span class="block font-medium">Weakness Audit</span>
            <span class="text-[10px] opacity-60">Performance review</span>
          </button>
        </div>
      </div>

      <style>
        .suggestion-chip {
          @apply card text-left p-4 hover:border-[var(--accent)] transition-colors;
        }
        .scrollbar-custom::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 10px;
        }
      </style>
    `;

    this.attachEvents();
  },

  attachEvents() {
    const form = document.getElementById('ai-chat-form');
    const input = document.getElementById('ai-input');
    
    if (form && input) {
      form.onsubmit = (e) => {
        e.preventDefault();
        this.sendMessage(input.value);
        input.value = '';
      };
    }

    document.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.onclick = () => this.sendMessage(chip.dataset.query);
    });
  }
};
