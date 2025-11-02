/**
 * Supabase Sync Utility for Electron App
 * Synchronizes user profile and license data between website and Electron app
 */

export class SupabaseSync {
  constructor(config) {
    this.supabaseUrl = config.supabaseUrl;
    this.supabaseAnonKey = config.supabaseAnonKey;
    this.deviceId = config.deviceId;
    this.userEmail = null;
    this.userToken = null;
  }

  /**
   * Initialize sync with user credentials
   */
  async initialize(email, token) {
    this.userEmail = email;
    this.userToken = token;
    return await this.syncProfile();
  }

  /**
   * Sync user profile from Supabase
   */
  async syncProfile() {
    if (!this.userEmail || !this.userToken) {
      throw new Error('User not initialized');
    }

    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(this.userEmail)}`, {
        headers: {
          'apikey': this.supabaseAnonKey,
          'Authorization': `Bearer ${this.userToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('[SupabaseSync] Error syncing profile:', error);
      throw error;
    }
  }

  /**
   * Sync license status from Supabase
   */
  async syncLicense() {
    if (!this.userEmail || !this.userToken) {
      throw new Error('User not initialized');
    }

    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/licenses?email=eq.${encodeURIComponent(this.userEmail)}&select=*`, {
        headers: {
          'apikey': this.supabaseAnonKey,
          'Authorization': `Bearer ${this.userToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('[SupabaseSync] Error syncing license:', error);
      throw error;
    }
  }

  /**
   * Update device status in Supabase
   */
  async updateDeviceStatus(deviceSerial, status) {
    if (!this.userEmail || !this.userToken) {
      throw new Error('User not initialized');
    }

    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/device_status`, {
        method: 'POST',
        headers: {
          'apikey': this.supabaseAnonKey,
          'Authorization': `Bearer ${this.userToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          email: this.userEmail,
          device_id: this.deviceId,
          device_serial: deviceSerial,
          status,
          last_seen: new Date().toISOString()
        })
      });

      return response.ok;
    } catch (error) {
      console.error('[SupabaseSync] Error updating device status:', error);
      return false;
    }
  }

  /**
   * Start periodic sync
   */
  startPeriodicSync(intervalMs = 60000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      try {
        await this.syncLicense();
        await this.syncProfile();
      } catch (error) {
        console.error('[SupabaseSync] Periodic sync error:', error);
      }
    }, intervalMs);
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

