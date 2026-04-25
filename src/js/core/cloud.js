/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Firebase } from './firebase.js';

export const Cloud = {
  init(app) {
    this.app = app;
    this.isSyncing = false;

    Firebase.onAuth(async (user) => {
      if (user) {
        this.app.log(`Cloud Identity: ${user.email}`);
        this.app.state.user.id = user.uid;
        this.app.state.user.email = user.email;
        this.app.state.user.isLoggedIn = true;
        
        // Initial sync from cloud to local
        await this.syncFromCloud();
      } else {
        this.app.log('Cloud Disconnected');
        this.app.state.user.isLoggedIn = false;
        this.app.state.user.id = null;
      }
      this.app.renderLayout();
    });
  },

  async syncToCloud() {
    if (!this.app.state.user.isLoggedIn || this.isSyncing) return;
    
    this.isSyncing = true;
    this.app.log('Syncing Upstream...');
    
    // Prepare data (exclude UI state if needed)
    const dataToSync = {
      timetable: this.app.state.timetable,
      tracker: this.app.state.tracker,
      settings: this.app.state.settings,
      notes: this.app.state.notes,
      gamification: this.app.state.gamification,
      goals: this.app.state.goals
    };

    const success = await Firebase.saveData(this.app.state.user.id, dataToSync);
    this.isSyncing = false;
    
    if (success) {
      this.app.log('Sync Success');
    }
  },

  async syncFromCloud() {
    if (!this.app.state.user.isLoggedIn || this.isSyncing) return;

    this.isSyncing = true;
    this.app.log('Syncing Downstream...');
    
    const cloudData = await Firebase.loadData(this.app.state.user.id);
    this.isSyncing = false;

    if (cloudData) {
      // Merge cloud data into state
      this.app.state = {
        ...this.app.state,
        ...cloudData
      };
      this.app.saveState(); // Update local storage too
      this.app.log('Archived Data Restored');
      
      // Notify modules of state change if needed, but avoid full re-render
      // unless on a specific action. 
    }
  }
};
