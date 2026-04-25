/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { APP_CONFIG } from './config.js';

export class Router {
  constructor(onRouteMatch) {
    this.onRouteMatch = typeof onRouteMatch === 'function' ? onRouteMatch : () => {};
    this.isValidRoute = (route) => APP_CONFIG.tabs.some(t => t.id === route);
    this.init();
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }

  handleRoute() {
    try {
      let hash = window.location.hash.substring(1);
      
      // Validation & Fallback
      if (!hash || !this.isValidRoute(hash)) {
        hash = APP_CONFIG.defaultTab;
        if (window.location.hash !== `#${hash}`) {
          window.location.hash = hash;
          return; // Hash change will trigger this again
        }
      }
      
      this.onRouteMatch(hash);
    } catch (e) {
      console.error('[Router] Fatal Error:', e);
    }
  }

  navigate(route) {
    if (this.isValidRoute(route)) {
      window.location.hash = route;
    } else {
      console.warn(`[Router] Navigation rejected: Invalid route "${route}"`);
    }
  }
}
