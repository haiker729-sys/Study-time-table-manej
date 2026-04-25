/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { APP_CONFIG, INITIAL_STATE } from './config.js';
import { Storage } from './storage.js';
import { Router } from './router.js';

// Static Module Imports
import { Timetable } from '../features/timetable.js';
import { Tracker } from '../features/tracker.js';
import { Settings } from '../features/settings.js';
import { Goals } from '../features/goals.js';
import { Motivation } from '../features/motivation.js';
import { Notifications } from '../features/notifications.js';
import { Analytics } from '../features/analytics.js';
import { Gamification } from '../features/gamification.js';
import { Notes } from '../features/notes.js';
import { FocusMode } from '../features/focusMode.js';
import { AI } from './ai.js';
import { Firebase } from './firebase.js';
import { Cloud } from './cloud.js';
import { AIAssistant } from '../features/aiAssistant.js';

class App {
  constructor() {
    this.modules = new Map();
    this.isRendering = false;
    this.state = this.loadState();
    
    this.setupGlobalHandlers();
    this.init();
  }

  log(...args) {
    if (APP_CONFIG.debug) {
      console.log(`[Aether]`, ...args);
    }
  }

  setupGlobalHandlers() {
    window.onerror = (msg, url, lineNo, columnNo, error) => {
      this.log('Terminal Failure:', msg, error);
      return false;
    };

    window.onunhandledrejection = (event) => {
      this.log('Unhandled Promise Rejection:', event.reason);
    };
  }

  registerModule(id, module) {
    try {
      if (typeof module.init === 'function') {
        module.init(this);
        this.modules.set(id, module);
        this.log(`Module loaded: ${id}`);
      }
    } catch (e) {
      console.error(`[Aether] Module "${id}" failed to load:`, e);
    }
  }

  getContentContainer() {
    const container = document.getElementById('app-content');
    if (!container) {
      this.renderLayout();
      return document.getElementById('app-content');
    }
    return container;
  }

  loadState() {
    return Storage.load('app_state', INITIAL_STATE);
  }

  saveState() {
    Storage.save('app_state', this.state);
    this.log('System state synchronized to storage');
  }

  init() {
    try {
      this.log('Initializing System Engine...');
      const layoutMounted = this.renderLayout();
      
      if (!layoutMounted) {
        throw new Error('Storage or Root Element inaccessible');
      }

      // Core Module Registration
      this.registerModule('timetable', Timetable);
      this.registerModule('tracker', Tracker);
      this.registerModule('settings', Settings);
      this.registerModule('goals', Goals);
      this.registerModule('motivation', Motivation);
      this.registerModule('notifications', Notifications);
      this.registerModule('analytics', Analytics);
      this.registerModule('gamification', Gamification);
      this.registerModule('notes', Notes);
      this.registerModule('focus', FocusMode);

      // Advanced Modules
      AI.init();
      this.registerModule('cloud', Cloud);
      this.registerModule('ai', AIAssistant);

      this.router = new Router((tab) => this.switchTab(tab));
      
      // Force initial render of the current tab
      this.renderSafe(this.state.currentTab);
      this.updateActiveTabUI();

      this.log('Core Engine Online');
    } catch (e) {
      console.error('[Aether] Boot Failure:', e);
      this.renderError(`Critical System Boot Error: ${e.message}`);
    }
  }

  renderLayout() {
    const root = document.getElementById('app');
    if (!root) {
      console.error('[Aether] Target root element "#app" not found in DOM');
      return false;
    }
    
    // Quick Render Test
    root.innerHTML = "<h1>App Loaded</h1>";
    
    if (root.querySelector('.layout-grid')) return true;

    try {
      root.innerHTML = `
        <div class="layout-grid">
          <div id="motivation-ticker-container">
            ${Motivation.renderTicker ? Motivation.renderTicker() : ''}
          </div>
          <header class="header-blur">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
                    <span class="font-mono font-bold text-white text-xs">AE</span>
                  </div>
                  <div>
                    <h1 class="text-lg font-semibold tracking-tight">${APP_CONFIG.name}</h1>
                    <div class="flex items-center gap-2">
                      <p class="label-mono opacity-60">Architect // v${APP_CONFIG.version}</p>
                      <div class="w-1 h-1 bg-[var(--border)] rounded-full"></div>
                      <span id="sync-status" class="label-mono text-[8px] ${this.state.user.isLoggedIn ? 'text-[var(--success)]' : 'opacity-30'}">
                        ${this.state.user.isLoggedIn ? 'CLOUD_SYNC_ACTIVE' : 'LOCAL_ONLY'}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <nav id="main-nav" class="flex items-center space-x-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                    ${APP_CONFIG.tabs.map(tab => `
                      <button 
                        class="nav-tab ${this.state.currentTab === tab.id ? 'active' : ''}" 
                        data-tab="${tab.id}"
                      >
                        ${tab.label}
                      </button>
                    `).join('')}
                  </nav>
                  
                  <div class="flex items-center pl-4 border-l border-[var(--border)] gap-3">
                    ${this.state.user.isLoggedIn ? `
                      <div class="text-right hidden sm:block">
                        <p class="text-[10px] font-bold leading-none">${this.state.user.email?.split('@')[0]}</p>
                        <button id="logout-btn" class="text-[8px] label-mono opacity-40 hover:opacity-100 uppercase">Sign Out</button>
                      </div>
                      <div class="w-8 h-8 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center">
                        <span class="text-[10px] font-bold text-[var(--accent)] font-mono">${this.state.user.email?.[0].toUpperCase()}</span>
                      </div>
                    ` : `
                      <button id="login-btn" class="btn btn-primary py-1 px-3 text-[10px] label-mono">LOGIN</button>
                    `}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main id="app-content" class="main-container fade-in">
            <div class="flex items-center justify-center h-full opacity-20">
               <p class="label-mono">Initializing Interface...</p>
            </div>
          </main>

          <footer class="border-t border-[var(--border)] py-4 bg-[var(--bg-secondary)]">
            <div class="max-w-7xl mx-auto px-4 text-center">
              <p class="label-mono opacity-40">Aether Dynamic Architecture © 2026</p>
            </div>
          </footer>
        </div>
      `;

      this.attachEvents();
      return true;
    } catch (e) {
      console.error('[Aether] Layout Render Error:', e);
      return false;
    }
  }

  attachEvents() {
    const nav = document.getElementById('main-nav');
    if (nav) {
      nav.addEventListener('click', (e) => {
        const btn = e.target.closest('.nav-tab');
        if (btn) {
          const tabId = btn.getAttribute('data-tab');
          this.router.navigate(tabId);
        }
      });
    }

    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.onclick = async () => {
        try {
          await Firebase.signIn();
        } catch (e) {
          console.error('Login system fault:', e);
        }
      };
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.onclick = async () => {
        await Firebase.signOut();
      };
    }
  }

  switchTab(tabId) {
    if (this.state.currentTab === tabId) return;
    
    this.log(`Routing Node: ${tabId}`);
    this.state.currentTab = tabId;
    this.saveState();
    this.updateActiveTabUI();
    this.renderSafe(tabId);
  }

  renderSafe(tabId) {
    if (this.isRendering) return;
    this.renderTabContent(tabId);
  }

  updateActiveTabUI() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      const isActive = tab.getAttribute('data-tab') === this.state.currentTab;
      tab.classList.toggle('active', isActive);
    });
  }

  renderTabContent(tabId) {
    this.log(`Rendering View Layer: ${tabId}`);
    const content = this.getContentContainer();
    if (!content) {
      console.error('[Aether] Content container missing during render');
      return;
    }

    this.isRendering = true;

    try {
      // Pre-render clear
      content.innerHTML = "";
      
      content.classList.remove('fade-in');
      void content.offsetWidth;
      content.classList.add('fade-in');

      const moduleMap = {
        'schedule': 'timetable',
        'tracker': 'tracker',
        'focus': 'focus',
        'ai': 'ai',
        'analytics': 'analytics',
        'evolution': 'gamification',
        'notes': 'notes',
        'tips': 'notifications',
        'settings': 'settings'
      };

      const moduleId = moduleMap[tabId];
      const module = this.modules.get(moduleId);

      if (module && typeof module.render === 'function') {
        this.log(`Executing Module Render: ${moduleId}`);
        module.render();
      } else {
        this.log(`No active module found for: ${tabId}, showing placeholder`);
        this.renderPlaceholder(tabId);
      }
    } catch (e) {
      this.renderError(`Interface Error: ${tabId}`);
      console.error(`[Aether] Render Failure in ${tabId}:`, e);
    } finally {
      this.isRendering = false;
    }
  }

  renderError(message) {
    const content = this.getContentContainer();
    if (!content) return;

    content.innerHTML = `
      <div class="card border-[var(--error)] bg-[var(--error)]/5 p-12 text-center">
        <h3 class="text-xl font-bold text-[var(--error)] mb-2">Interface Corrupted</h3>
        <p class="text-[var(--text-secondary)] mb-6">${message}</p>
        <button onclick="window.location.reload()" class="btn btn-primary bg-[var(--error)] hover:bg-red-700">
          Reboot System
        </button>
      </div>
    `;
  }

  renderPlaceholder(tabId) {
    const content = this.getContentContainer();
    const tabInfo = APP_CONFIG.tabs.find(t => t.id === tabId);
    if (!content || !tabInfo) return;
    
    content.innerHTML = `
      <div class="space-y-8">
        <div>
          <span class="label-mono text-[var(--accent)] mb-1 block">Module // ${tabId}</span>
          <h2 class="title-large">${tabInfo.label}</h2>
        </div>
        <div class="card opacity-60">
          <p class="text-[var(--text-secondary)] italic">Logic for "${tabInfo.label}" is currently offline or not registered.</p>
        </div>
      </div>
    `;
  }
}

// Global initialization
document.addEventListener("DOMContentLoaded", () => {
  if (!window.__appInitialized) {
    window.__appInitialized = true;
    window.app = new App();
  }
});
