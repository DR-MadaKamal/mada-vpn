import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const API = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, { refresh_token: refreshToken });
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return API(original);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (username: string, password: string) =>
    API.post('/auth/login', new URLSearchParams({ username, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  register: (data: { email: string; username: string; password: string; full_name?: string }) =>
    API.post('/auth/register', data),
  refresh: (refresh_token: string) => API.post('/auth/refresh', { refresh_token }),
  me: () => API.get('/auth/me'),
};

export const serversAPI = {
  list: () => API.get('/servers'),
  get: (id: number) => API.get(`/servers/${id}`),
  health: (id: number) => API.get(`/servers/${id}/health`),
  recommended: () => API.get('/users/recommended-server'),
  serviceStatus: () => API.get('/users/service-status'),
};

export const usersAPI = {
  profile: () => API.get('/users/profile'),
  updateProfile: (data: any) => API.put('/users/profile', data),
  changePassword: (current: string, newPw: string) =>
    API.post('/users/change-password', { current_password: current, new_password: newPw }),
  usage: () => API.get('/users/usage'),
  sessions: () => API.get('/users/sessions'),
  bypassRules: () => API.get('/users/bypass-rules'),
  addBypassRule: (data: any) => API.post('/users/bypass-rules', data),
  deleteBypassRule: (id: number) => API.delete(`/users/bypass-rules/${id}`),
  speedTest: () => API.get('/users/speed-test'),
  recommendedProtocol: () => API.get('/users/recommended-protocol'),
  recommendedServer: () => API.get('/users/recommended-server'),
  getAdBlocking: () => API.get('/users/ad-blocking'),
  setAdBlocking: (enabled: boolean) => API.post('/users/ad-blocking', { enabled }),
  getLanAccess: () => API.get('/users/lan-access'),
  setLanAccess: (enabled: boolean) => API.post('/users/lan-access', { enabled }),
  getBandwidthAlert: () => API.get('/users/bandwidth-alert'),
  setBandwidthAlert: (threshold_pct: number) => API.post('/users/bandwidth-alert', { threshold_pct }),
  getFavorites: () => API.get('/users/favorites'),
  addFavorite: (serverId: number) => API.post(`/users/favorites/${serverId}`),
  removeFavorite: (serverId: number) => API.delete(`/users/favorites/${serverId}`),
  panic: () => API.post('/users/panic'),
  getMultiHop: () => API.get('/users/multi-hop'),
  setMultiHop: (data: any) => API.post('/users/multi-hop', data),
  exportConfig: (serverId: number, protocol: string) => API.get(`/users/config/${serverId}/${protocol}`),
  totpSetup: () => API.get('/users/totp/setup'),
  totpVerify: (code: string) => API.post('/users/totp/verify', { code }),
  totpStatus: () => API.get('/users/totp/status'),
  getDns: () => API.get('/users/dns'),
  setDns: (dns_servers: string[]) => API.post('/users/dns', { dns_servers }),
  getIpv6Leak: () => API.get('/users/ipv6-leak-protection'),
  setIpv6Leak: (enabled: boolean) => API.post('/users/ipv6-leak-protection', { enabled }),
  getPortForwarding: () => API.get('/users/port-forwarding'),
  setPortForwarding: (enabled: boolean) => API.post('/users/port-forwarding', { enabled }),
  getAutoFailover: () => API.get('/users/auto-failover'),
  setAutoFailover: (enabled: boolean) => API.post('/users/auto-failover', { enabled }),
  getActivity: () => API.get('/users/activity'),
  logActivity: (data: any) => API.post('/users/activity/log', data),
  wireguardQR: (serverId: number) => API.get(`/users/wireguard-qr/${serverId}`),
  serviceStatus: () => API.get('/users/service-status'),
  getReferralCode: () => API.get('/users/referral/code'),
  getReferrals: () => API.get('/users/referrals'),
  claimReferral: (code: string) => API.post('/users/referrals/claim', { code }),
  getSchedule: () => API.get('/users/schedule'),
  setSchedule: (data: any) => API.post('/users/schedule', data),
  getApiKeys: () => API.get('/users/api-keys'),
  createApiKey: (name: string) => API.post('/users/api-keys', { name }),
  deleteApiKey: (keyId: number) => API.delete(`/users/api-keys/${keyId}`),
  getWebhook: () => API.get('/users/webhook'),
  setWebhook: (url: string) => API.post('/users/webhook', { url }),
  testWebhook: () => API.post('/users/webhook/test'),
  getNotifications: () => API.get('/users/notifications'),
  setNotifications: (data: any) => API.post('/users/notifications', data),
  exportUsage: () => API.get('/users/usage/export'),
  getServerLoadHistory: () => API.get('/users/server-load-history'),
  killSwitchTest: () => API.post('/users/kill-switch-test'),
  getStealth: () => API.get('/users/stealth'),
  setStealth: (data: any) => API.post('/users/stealth', data),
  getTheme: () => API.get('/users/theme'),
  setTheme: (theme: string) => API.post('/users/theme', { theme }),
  getOrganizations: () => API.get('/users/organizations'),
  createOrganization: (name: string) => API.post('/users/organizations', { name }),
  getOrgMembers: (orgId: number) => API.get(`/users/organizations/${orgId}/members`),
  inviteToOrg: (orgId: number, email: string) => API.post(`/users/organizations/${orgId}/invite`, { email }),
  getActiveSessions: () => API.get('/users/active-sessions'),
  revokeSession: (sessionId: number) => API.delete(`/users/active-sessions/${sessionId}`),
  revokeAllSessions: () => API.delete('/users/active-sessions'),
  redeemPromo: (code: string) => API.post('/users/promo/redeem', { code }),
  deleteAccount: () => API.delete('/users/account'),
  bulkConfigs: () => API.get('/users/bulk-configs'),
  wireguardHealth: () => API.get('/users/wireguard-health'),
  dataExport: () => API.get('/users/data-export'),
  gdprExport: () => API.get('/users/data-export'),
  // --- Features 43-100 ---
  getSettings: () => API.get('/users/settings'),
  updateSettings: (data: any) => API.put('/users/settings', data),
  getDnsOverHttps: () => API.get('/users/dns-over-https'),
  setDnsOverHttps: (enabled: boolean) => API.post('/users/dns-over-https', { enabled }),
  getBandwidthSaver: () => API.get('/users/bandwidth-saver'),
  setBandwidthSaver: (enabled: boolean) => API.post('/users/bandwidth-saver', { enabled }),
  getAutoDisconnect: () => API.get('/users/auto-disconnect'),
  setAutoDisconnect: (minutes: number) => API.post('/users/auto-disconnect', { minutes }),
  getConnectionTimer: () => API.get('/users/connection-timer'),
  setConnectionTimer: (minutes: number) => API.post('/users/connection-timer', { minutes }),
  getLanguage: () => API.get('/users/language'),
  setLanguage: (language: string) => API.post('/users/language', { language }),
  getOnboarded: () => API.get('/users/onboarded'),
  setOnboarded: (onboarded: boolean) => API.post('/users/onboarded', { onboarded }),
  getQuickConnect: () => API.get('/users/quick-connect'),
  setQuickConnect: (enabled: boolean) => API.post('/users/quick-connect', { enabled }),
  getMtu: () => API.get('/users/mtu'),
  setMtu: (mtu: number) => API.post('/users/mtu', { mtu }),
  getCustomPort: () => API.get('/users/custom-port'),
  setCustomPort: (port: number) => API.post('/users/custom-port', { port }),
  getTcpMode: () => API.get('/users/tcp-mode'),
  setTcpMode: (prefer_tcp: boolean) => API.post('/users/tcp-mode', { prefer_tcp }),
  getSplitTunnelMode: () => API.get('/users/split-tunnel-mode'),
  setSplitTunnelMode: (mode: string) => API.post('/users/split-tunnel-mode', { mode }),
  getProtocolOrder: () => API.get('/users/protocol-order'),
  setProtocolOrder: (order: string) => API.post('/users/protocol-order', { order }),
  getCityLevel: () => API.get('/users/city-level'),
  setCityLevel: (enabled: boolean) => API.post('/users/city-level', { enabled }),
  getServerGrouping: () => API.get('/users/server-grouping'),
  setServerGrouping: (grouping: string) => API.post('/users/server-grouping', { grouping }),
  getAutoRenew: () => API.get('/users/auto-renew'),
  setAutoRenew: (enabled: boolean) => API.post('/users/auto-renew', { enabled }),
  getConnectionLogEnabled: () => API.get('/users/connection-log'),
  setConnectionLogEnabled: (enabled: boolean) => API.post('/users/connection-log', { enabled }),
  getLastConnected: () => API.get('/users/last-connected'),
  setLastConnected: (server_id: number) => API.post('/users/last-connected', { server_id }),
  getTrial: () => API.get('/users/trial'),
  startTrial: () => API.post('/users/trial/start'),
  getDevices: () => API.get('/users/devices'),
  registerDevice: (data: any) => API.post('/users/devices', data),
  updateDevice: (deviceId: number, data: any) => API.put(`/users/devices/${deviceId}`, data),
  deleteDevice: (deviceId: number) => API.delete(`/users/devices/${deviceId}`),
  getConnectionLogs: (limit?: number) => API.get(`/users/connection-logs?limit=${limit || 50}`),
  createConnectionLog: (data: any) => API.post('/users/connection-logs', data),
  getConnectionStats: () => API.get('/users/connection-logs/stats'),
  getInvoices: () => API.get('/users/invoices'),
  getSupportTickets: () => API.get('/users/support-tickets'),
  createSupportTicket: (data: any) => API.post('/users/support-tickets', data),
  updateSupportTicket: (ticketId: number, data: any) => API.put(`/users/support-tickets/${ticketId}`, data),
  resolveSupportTicket: (ticketId: number) => API.post(`/users/support-tickets/${ticketId}/resolve`),
  getAchievements: () => API.get('/users/achievements'),
  createAchievement: (data: any) => API.post('/users/achievements', data),
  getKnowledgeBase: () => API.get('/users/knowledge-base'),
  searchKnowledgeBase: (q: string) => API.get(`/users/knowledge-base/search?q=${encodeURIComponent(q)}`),
  getPaymentMethods: () => API.get('/users/payment-methods'),
  addPaymentMethod: (data: any) => API.post('/users/payment-methods', data),
  deletePaymentMethod: (methodId: number) => API.delete(`/users/payment-methods/${methodId}`),
  setDefaultPaymentMethod: (methodId: number) => API.put(`/users/payment-methods/${methodId}/default`),
  getInAppNotifications: () => API.get('/users/notifications/in-app'),
  readNotification: (notificationId: number) => API.post(`/users/notifications/in-app/read/${notificationId}`),
  readAllNotifications: () => API.post('/users/notifications/in-app/read-all'),
  getConnectionRules: () => API.get('/users/connection-rules'),
  createConnectionRule: (data: any) => API.post('/users/connection-rules', data),
  updateConnectionRule: (ruleId: number, data: any) => API.put(`/users/connection-rules/${ruleId}`, data),
  deleteConnectionRule: (ruleId: number) => API.delete(`/users/connection-rules/${ruleId}`),
  getServerPings: (serverId: number) => API.get(`/users/server-pings/${serverId}`),
  recordServerPing: (data: any) => API.post('/users/server-pings', data),
  leakTest: () => API.get('/users/leak-test'),
  connectivityCheck: () => API.get('/users/connectivity-check'),
  getTorRouting: () => API.get('/users/tor-routing'),
  setTorRouting: (enabled: boolean) => API.post('/users/tor-routing', { enabled }),
  getOnionVpn: () => API.get('/users/onion-vpn'),
  setOnionVpn: (enabled: boolean) => API.post('/users/onion-vpn', { enabled }),
  bulkConnectionLogs: (logs: any[]) => API.post('/users/connection-logs/bulk', { logs }),
  exportAllData: () => API.get('/users/export-all'),
  getRecentServers: () => API.get('/users/recent-servers'),
  getFaq: () => API.get('/users/faq'),
  getSpeedColors: () => API.get('/users/speed-colors'),
  // --- Advanced VPN Features ---
  getRamOnly: () => API.get('/users/ram-only'),
  setRamOnly: (enabled: boolean) => API.post('/users/ram-only', { enabled }),
  getNoLogsAttestation: () => API.get('/users/no-logs-attestation'),
  setNoLogsAttestation: (attested: boolean) => API.post('/users/no-logs-attestation', { attested }),
  getPfs: () => API.get('/users/pfs'),
  setPfs: (data: any) => API.post('/users/pfs', data),
  getSmartDns: () => API.get('/users/smart-dns'),
  setSmartDns: (data: any) => API.post('/users/smart-dns', data),
  getSmartDnsRules: () => API.get('/users/smart-dns-rules'),
  createSmartDnsRule: (data: any) => API.post('/users/smart-dns-rules', data),
  deleteSmartDnsRule: (ruleId: number) => API.delete(`/users/smart-dns-rules/${ruleId}`),
  getMalwareBlocker: () => API.get('/users/malware-blocker'),
  setMalwareBlocker: (data: any) => API.post('/users/malware-blocker', data),
  getAutoWifiProtection: () => API.get('/users/auto-wifi-protection'),
  setAutoWifiProtection: (enabled: boolean) => API.post('/users/auto-wifi-protection', { enabled }),
  getUnlimitedConnections: () => API.get('/users/unlimited-connections'),
  setUnlimitedConnections: (enabled: boolean) => API.post('/users/unlimited-connections', { enabled }),
  getDynamicSwitching: () => API.get('/users/dynamic-switching'),
  setDynamicSwitching: (enabled: boolean) => API.post('/users/dynamic-switching', { enabled }),
  getAdvancedMultiHop: () => API.get('/users/multi-hop/advanced'),
  setAdvancedMultiHop: (data: any) => API.post('/users/multi-hop/advanced', data),
  getObfuscationRules: () => API.get('/users/obfuscation-rules'),
  createObfuscationRule: (data: any) => API.post('/users/obfuscation-rules', data),
  deleteObfuscationRule: (ruleId: number) => API.delete(`/users/obfuscation-rules/${ruleId}`),
  getShadowsocks: () => API.get('/users/shadowsocks'),
  setShadowsocks: (data: any) => API.post('/users/shadowsocks', data),
  getShadowsocksConfig: () => API.get('/users/shadowsocks/config'),
  getMeshnet: () => API.get('/users/meshnet'),
  setMeshnet: (enabled: boolean) => API.post('/users/meshnet', { enabled }),
  addMeshnetPeer: (data: any) => API.post('/users/meshnet/peers', data),
  removeMeshnetPeer: (peerId: number) => API.delete(`/users/meshnet/peers/${peerId}`),
  getDedicatedIp: () => API.get('/users/dedicated-ip'),
  assignDedicatedIp: (serverId: number) => API.post('/users/dedicated-ip/assign', { server_id: serverId }),
  releaseDedicatedIp: () => API.post('/users/dedicated-ip/release'),
  getTunnelHealth: () => API.get('/users/tunnel-health'),
  reportTunnelHealth: (data: any) => API.post('/users/tunnel-health', data),
  bandwidthTest: () => API.get('/users/bandwidth-test'),
  getPrivacyInfo: () => API.get('/users/privacy-info'),
  getTunnelStatus: () => API.get('/users/tunnel-status'),
};

export const subscriptionsAPI = {
  plans: () => API.get('/subscriptions/plans'),
  my: () => API.get('/subscriptions/my'),
  subscribe: (data: any) => API.post('/subscriptions/subscribe', data),
  cancel: () => API.post('/subscriptions/cancel'),
};

export const analyticsAPI = {
  dashboard: (days = 7) => API.get(`/analytics/dashboard?days=${days}`),
};

export const wireguardAPI = {
  generateConfig: (serverId: number) => API.post('/wireguard/generate-config', { server_id: serverId }),
  status: () => API.get('/wireguard/status'),
};
