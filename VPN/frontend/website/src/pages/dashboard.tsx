import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Shield, Globe, Zap, Download, Server, Lock, User, Activity, Clock,
  BarChart3, Settings, LogOut, Wifi, WifiOff, Copy, CheckCircle, Loader2,
   AlertTriangle, ChevronDown, RefreshCw, Signal, MapPin, Cpu, Gauge,
   Radio, Router, Layers, Trash2, Plus, TrendingUp, Wrench, X, Bell,
   Timer
} from 'lucide-react';
import { useAuth } from '../utils/auth';
import { serversAPI, usersAPI, analyticsAPI, subscriptionsAPI } from '../utils/api';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'servers' | 'analytics' | 'settings' | 'profile' | 'advanced' | 'connections' | 'knowledge' | 'support';

interface ServerType {
  id: number; name: string; country: string; city: string;
  load_percent: number; connected_clients: number; max_clients: number;
  host: string; protocols: string[]; latitude: number; longitude: number;
}

interface UsageData {
  bytes_used: number; bytes_quota: number; usage_percent: number;
}

interface Plan {
  [key: string]: { price: number; bandwidth_gb: number; devices: number; speed: number; };
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [connected, setConnected] = useState(false);
  const [activeProtocol, setActiveProtocol] = useState('http');
  const [servers, setServers] = useState<ServerType[]>([]);
  const [selectedServer, setSelectedServer] = useState<ServerType | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [plans, setPlans] = useState<Plan | null>(null);
  const [mySub, setMySub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [killSwitch, setKillSwitch] = useState(true);
  const [dnsProtection, setDnsProtection] = useState(true);
  const [autoConnect, setAutoConnect] = useState(false);
  const [speedTestResult, setSpeedTestResult] = useState<any>(null);
  const [speedTesting, setSpeedTesting] = useState(false);
  const [bypassRules, setBypassRules] = useState<any[]>([]);
  const [newRuleApp, setNewRuleApp] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [recServer, setRecServer] = useState<any>(null);
  const [recProtocol, setRecProtocol] = useState<any>(null);
  const [adBlocking, setAdBlocking] = useState(true);
  const [lanAccess, setLanAccess] = useState(false);
  const [bandwidthAlertPct, setBandwidthAlertPct] = useState(80);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [multiHopEnabled, setMultiHopEnabled] = useState(false);
  const [multiHopData, setMultiHopData] = useState<any>(null);
  const [panicking, setPanicking] = useState(false);
  const [exportingConfig, setExportingConfig] = useState<string | null>(null);
  const [totpStatus, setTotpStatus] = useState<any>(null);
  const [totpSetupData, setTotpSetupData] = useState<any>(null);
  const [totpCode, setTotpCode] = useState('');
  const [dnsServers, setDnsServers] = useState<string[]>(['1.1.1.1', '8.8.8.8']);
  const [ipv6Leak, setIpv6Leak] = useState(true);
  const [portForwarding, setPortForwarding] = useState(false);
  const [autoFailover, setAutoFailover] = useState(true);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [referralReward, setReferralReward] = useState(0);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleStart, setScheduleStart] = useState('08:00');
  const [scheduleEnd, setScheduleEnd] = useState('23:00');
  const [scheduleDays, setScheduleDays] = useState<string[]>(['mon','tue','wed','thu','fri','sat','sun']);
  const [ksTestResult, setKsTestResult] = useState<any>(null);
  const [ksTesting, setKsTesting] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [exportingGDPR, setExportingGDPR] = useState(false);
  const [serverLoadHistory, setServerLoadHistory] = useState<any[]>([]);
  const [claimCode, setClaimCode] = useState('');
  const [serviceStatus, setServiceStatus] = useState<any>(null);
  const [stealthEnabled, setStealthEnabled] = useState(false);
  const [stealthMethod, setStealthMethod] = useState('none');
  const [theme, setTheme] = useState('dark');
  const [orgs, setOrgs] = useState<any[]>([]);
  const [orgMembers, setOrgMembers] = useState<any[]>([]);
  const [orgInviteEmail, setOrgInviteEmail] = useState('');
  const [newOrgName, setNewOrgName] = useState('');
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [bulkConfigs, setBulkConfigs] = useState<any[]>([]);
  const [wgHealth, setWgHealth] = useState<any>(null);
  const [gdprData, setGdprData] = useState<any>(null);
  const [qrData, setQrData] = useState<any>(null);
  const [dnsInput, setDnsInput] = useState('');
  const [dnsOverHttps, setDnsOverHttps] = useState(false);
  const [bandwidthSaver, setBandwidthSaver] = useState(false);
  const [autoDisconnectMins, setAutoDisconnectMins] = useState(0);
  const [connectionTimerMins, setConnectionTimerMins] = useState(0);
  const [language, setLanguage] = useState('en');
  const [onboarded, setOnboarded] = useState(false);
  const [quickConnect, setQuickConnect] = useState(true);
  const [mtuSize, setMtuSize] = useState(1500);
  const [customPort, setCustomPort] = useState(0);
  const [preferTcp, setPreferTcp] = useState(true);
  const [splitTunnelMode, setSplitTunnelMode] = useState('apps');
  const [protocolOrder, setProtocolOrder] = useState('');
  const [cityLevel, setCityLevel] = useState(false);
  const [serverGrouping, setServerGrouping] = useState('country');
  const [autoRenew, setAutoRenew] = useState(true);
  const [connLogEnabled, setConnLogEnabled] = useState(true);
  const [devices, setDevices] = useState<any[]>([]);
  const [connectionLogs, setConnectionLogs] = useState<any[]>([]);
  const [connectionStats, setConnectionStats] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [achievements, setAchievements] = useState<any[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
  const [kbSearch, setKbSearch] = useState('');
  const [kbResults, setKbResults] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [inAppNotifs, setInAppNotifs] = useState<any[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const [connectionRules, setConnectionRules] = useState<any[]>([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleSource, setNewRuleSource] = useState('');
  const [newRuleDest, setNewRuleDest] = useState('');
  const [leakTestResult, setLeakTestResult] = useState<any>(null);
  const [leakTesting, setLeakTesting] = useState(false);
  const [connectivityResult, setConnectivityResult] = useState<any>(null);
  const [torEnabled, setTorEnabled] = useState(false);
  const [onionEnabled, setOnionEnabled] = useState(false);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [recentServers, setRecentServers] = useState<any[]>([]);
  const [speedColors, setSpeedColors] = useState<any[]>([]);
  const [trialInfo, setTrialInfo] = useState<any>(null);
  const [deviceNameInput, setDeviceNameInput] = useState('');
  const [deviceTypeInput, setDeviceTypeInput] = useState('');
  const [serverSearch, setServerSearch] = useState('');
  const [ramOnly, setRamOnly] = useState(false);
  const [noLogsAttested, setNoLogsAttested] = useState(false);
  const [pfsEnabled, setPfsEnabled] = useState(true);
  const [pfsRotation, setPfsRotation] = useState(24);
  const [smartDnsEnabled, setSmartDnsEnabled] = useState(false);
  const [smartDnsServers, setSmartDnsServers] = useState('8.8.8.8,8.8.4.4');
  const [smartDnsRules, setSmartDnsRules] = useState<any[]>([]);
  const [malwareEnabled, setMalwareEnabled] = useState(true);
  const [trackerEnabled, setTrackerEnabled] = useState(true);
  const [autoWifi, setAutoWifi] = useState(false);
  const [unlimitedConn, setUnlimitedConn] = useState(false);
  const [dynamicSwitching, setDynamicSwitching] = useState(false);
  const [advancedMultiHop, setAdvancedMultiHop] = useState<any>(null);
  const [obfuscationRules, setObfuscationRules] = useState<any[]>([]);
  const [shadowsocksInfo, setShadowsocksInfo] = useState<any>(null);
  const [shadowsocksConfigs, setShadowsocksConfigs] = useState<any[]>([]);
  const [meshnetEnabled, setMeshnetEnabled] = useState(false);
  const [meshnetPeers, setMeshnetPeers] = useState<any[]>([]);
  const [newMeshPeerName, setNewMeshPeerName] = useState('');
  const [dedicatedIpInfo, setDedicatedIpInfo] = useState<any>(null);
  const [tunnelHealthReports, setTunnelHealthReports] = useState<any[]>([]);
  const [bandwidthTestResult, setBandwidthTestResult] = useState<any>(null);
  const [privacyInfo, setPrivacyInfo] = useState<any>(null);
  const [tunnelStatus, setTunnelStatus] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchData = useCallback(async () => {
    try {
      const [srvRes, usageRes, plansRes, subRes, sessRes, rulesRes, recSrvRes, recProtoRes, adRes, lanRes, alertRes, favRes, mhRes, dnsRes, ipv6Res, pfRes, afRes, actRes, ssRes, totpStat, rcRes, refRes, akRes, whRes, notifRes, schedRes, slhRes, stRes, thRes, orgRes, asRes, bcRes, wgHRes] = await Promise.all([
        serversAPI.list(),
        usersAPI.usage(),
        subscriptionsAPI.plans(),
        subscriptionsAPI.my(),
        usersAPI.sessions(),
        usersAPI.bypassRules(),
        usersAPI.recommendedServer().catch(() => null),
        usersAPI.recommendedProtocol().catch(() => null),
        usersAPI.getAdBlocking().catch(() => null),
        usersAPI.getLanAccess().catch(() => null),
        usersAPI.getBandwidthAlert().catch(() => null),
        usersAPI.getFavorites().catch(() => null),
        usersAPI.getMultiHop().catch(() => null),
        usersAPI.getDns().catch(() => null),
        usersAPI.getIpv6Leak().catch(() => null),
        usersAPI.getPortForwarding().catch(() => null),
        usersAPI.getAutoFailover().catch(() => null),
        usersAPI.getActivity().catch(() => null),
        usersAPI.serviceStatus().catch(() => null),
        usersAPI.totpStatus().catch(() => null),
        usersAPI.getReferralCode().catch(() => null),
        usersAPI.getReferrals().catch(() => null),
        usersAPI.getApiKeys().catch(() => null),
        usersAPI.getWebhook().catch(() => null),
        usersAPI.getNotifications().catch(() => null),
        usersAPI.getSchedule().catch(() => null),
        usersAPI.getServerLoadHistory().catch(() => null),
        usersAPI.getStealth().catch(() => null),
        usersAPI.getTheme().catch(() => null),
        usersAPI.getOrganizations().catch(() => null),
        usersAPI.getActiveSessions().catch(() => null),
        usersAPI.bulkConfigs().catch(() => null),
        usersAPI.wireguardHealth().catch(() => null),
      ]);
      setServers(srvRes.data);
      setUsage(usageRes.data);
      setPlans(plansRes.data);
      setMySub(subRes.data);
      setSessions(sessRes.data || []);
      setBypassRules(rulesRes.data || []);
      setRecServer(recSrvRes?.data || null);
      setRecProtocol(recProtoRes?.data || null);
      if (adRes?.data) setAdBlocking(adRes.data.enabled);
      if (lanRes?.data) setLanAccess(lanRes.data.enabled);
      if (alertRes?.data) setBandwidthAlertPct(alertRes.data.threshold_pct);
      if (favRes?.data) setFavorites(favRes.data);
      if (mhRes?.data) { setMultiHopData(mhRes.data); setMultiHopEnabled(mhRes.data.enabled); }
      if (dnsRes?.data) setDnsServers(dnsRes.data.dns_servers);
      if (ipv6Res?.data) setIpv6Leak(ipv6Res.data.enabled);
      if (pfRes?.data) setPortForwarding(pfRes.data.enabled);
      if (afRes?.data) setAutoFailover(afRes.data.enabled);
      if (actRes?.data) setActivityLog(actRes.data);
      if (ssRes?.data) setServiceStatus(ssRes.data);
      if (totpStat?.data) setTotpStatus(totpStat.data);
      if (rcRes?.data) { setReferralCode(rcRes.data.code); setReferralReward(rcRes.data.reward); }
      if (refRes?.data) setReferrals(refRes.data);
      if (akRes?.data) setApiKeys(akRes.data);
      if (whRes?.data) setWebhookUrl(whRes.data.url || '');
      if (notifRes?.data) { setNotifyEmail(notifRes.data.email); setNotifyPush(notifRes.data.push); }
      if (schedRes?.data) { setScheduleEnabled(schedRes.data.enabled); setScheduleStart(schedRes.data.start); setScheduleEnd(schedRes.data.end); setScheduleDays(schedRes.data.days || []); }
      if (slhRes?.data) setServerLoadHistory(slhRes.data);
      if (stRes?.data) { setStealthEnabled(stRes.data.enabled); setStealthMethod(stRes.data.method); }
      if (thRes?.data) setTheme(thRes.data.theme);
      if (orgRes?.data) setOrgs(orgRes.data);
      if (asRes?.data) setActiveSessions(asRes.data);
      if (bcRes?.data) setBulkConfigs(bcRes.data.configs || []);
      if (wgHRes?.data) setWgHealth(wgHRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, fetchData]);

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([
      usersAPI.getSettings().catch(() => null),
      usersAPI.getDevices().catch(() => null),
      usersAPI.getConnectionLogs().catch(() => null),
      usersAPI.getConnectionStats().catch(() => null),
      usersAPI.getInvoices().catch(() => null),
      usersAPI.getSupportTickets().catch(() => null),
      usersAPI.getAchievements().catch(() => null),
      usersAPI.getKnowledgeBase().catch(() => null),
      usersAPI.getPaymentMethods().catch(() => null),
      usersAPI.getInAppNotifications().catch(() => null),
      usersAPI.getConnectionRules().catch(() => null),
      usersAPI.getFaq().catch(() => null),
      usersAPI.getRecentServers().catch(() => null),
      usersAPI.getSpeedColors().catch(() => null),
      usersAPI.getTrial().catch(() => null),
      usersAPI.getTorRouting().catch(() => null),
      usersAPI.getOnionVpn().catch(() => null),
    ]).then(([settingsRes, devRes, logsRes, statsRes, invRes, tickRes, achRes, kbRes, pmRes, notifRes, rulesRes, faqRes, recentRes, scRes, trialRes, torRes, onionRes]) => {
      if (settingsRes?.data) {
        setDnsOverHttps(settingsRes.data.dns_over_https);
        setBandwidthSaver(settingsRes.data.bandwidth_saver);
        setAutoDisconnectMins(settingsRes.data.auto_disconnect_minutes);
        setConnectionTimerMins(settingsRes.data.connection_timer_minutes);
        setLanguage(settingsRes.data.language);
        setOnboarded(settingsRes.data.onboarded);
        setQuickConnect(settingsRes.data.quick_connect);
        setMtuSize(settingsRes.data.mtu_size);
        setCustomPort(settingsRes.data.custom_port);
        setPreferTcp(settingsRes.data.prefer_tcp);
        setSplitTunnelMode(settingsRes.data.split_tunnel_mode);
        setProtocolOrder(settingsRes.data.protocol_order);
        setCityLevel(settingsRes.data.city_level);
        setServerGrouping(settingsRes.data.server_grouping);
        setAutoRenew(settingsRes.data.auto_renew);
        setConnLogEnabled(settingsRes.data.connection_log_enabled);
      }
      if (devRes?.data) setDevices(devRes.data);
      if (logsRes?.data) setConnectionLogs(logsRes.data);
      if (statsRes?.data) setConnectionStats(statsRes.data);
      if (invRes?.data) setInvoices(invRes.data);
      if (tickRes?.data) setTickets(tickRes.data);
      if (achRes?.data) setAchievements(achRes.data);
      if (kbRes?.data) setKnowledgeBase(kbRes.data);
      if (pmRes?.data) setPaymentMethods(pmRes.data);
      if (notifRes?.data) { setInAppNotifs(notifRes.data); setNotifCount(notifRes.data.filter((n: any) => !n.is_read).length); }
      if (rulesRes?.data) setConnectionRules(rulesRes.data);
      if (faqRes?.data) setFaqs(faqRes.data.faqs || []);
      if (recentRes?.data) setRecentServers(recentRes.data);
      if (scRes?.data) setSpeedColors(scRes.data.thresholds || []);
      if (trialRes?.data) setTrialInfo(trialRes.data);
      if (torRes?.data) setTorEnabled(torRes.data.enabled);
      if (onionRes?.data) setOnionEnabled(onionRes.data.enabled);
      // Load new advanced features
      usersAPI.getRamOnly().then(r => setRamOnly(r.data.enabled)).catch(() => {});
      usersAPI.getNoLogsAttestation().then(r => setNoLogsAttested(r.data.attested)).catch(() => {});
      usersAPI.getPfs().then(r => { setPfsEnabled(r.data.enabled); setPfsRotation(r.data.key_rotation_hours); }).catch(() => {});
      usersAPI.getSmartDns().then(r => { setSmartDnsEnabled(r.data.enabled); setSmartDnsServers(r.data.dns_servers); }).catch(() => {});
      usersAPI.getSmartDnsRules().then(r => setSmartDnsRules(r.data)).catch(() => {});
      usersAPI.getMalwareBlocker().then(r => { setMalwareEnabled(r.data.malware_enabled); setTrackerEnabled(r.data.tracker_enabled); }).catch(() => {});
      usersAPI.getAutoWifiProtection().then(r => setAutoWifi(r.data.enabled)).catch(() => {});
      usersAPI.getUnlimitedConnections().then(r => setUnlimitedConn(r.data.enabled)).catch(() => {});
      usersAPI.getDynamicSwitching().then(r => setDynamicSwitching(r.data.enabled)).catch(() => {});
      usersAPI.getAdvancedMultiHop().then(r => setAdvancedMultiHop(r.data)).catch(() => {});
      usersAPI.getObfuscationRules().then(r => setObfuscationRules(r.data)).catch(() => {});
      usersAPI.getShadowsocks().then(r => setShadowsocksInfo(r.data)).catch(() => {});
      usersAPI.getShadowsocksConfig().then(r => setShadowsocksConfigs(r.data.configs || [])).catch(() => {});
      usersAPI.getMeshnet().then(r => { setMeshnetEnabled(r.data.enabled); setMeshnetPeers(r.data.peers || []); }).catch(() => {});
      usersAPI.getDedicatedIp().then(r => setDedicatedIpInfo(r.data)).catch(() => {});
      usersAPI.getTunnelHealth().then(r => setTunnelHealthReports(r.data)).catch(() => {});
      usersAPI.getPrivacyInfo().then(r => setPrivacyInfo(r.data)).catch(() => {});
      usersAPI.getTunnelStatus().then(r => setTunnelStatus(r.data)).catch(() => {});
    });
  }, [isAuthenticated]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const runSpeedTest = async () => {
    setSpeedTesting(true);
    setSpeedTestResult(null);
    try {
      const res = await usersAPI.speedTest();
      setSpeedTestResult(res.data);
      toast.success('Speed test complete');
    } catch {
      toast.error('Speed test failed');
    } finally {
      setSpeedTesting(false);
    }
  };

  const addBypassRule = async () => {
    if (!newRuleApp.trim()) return;
    try {
      const res = await usersAPI.addBypassRule({ app_name: newRuleApp.trim() });
      setBypassRules([...bypassRules, res.data]);
      setNewRuleApp('');
      toast.success('Bypass rule added');
    } catch {
      toast.error('Failed to add rule');
    }
  };

  const triggerPanic = async () => {
    setPanicking(true);
    try {
      await usersAPI.panic();
      setConnected(false);
      toast.error('Emergency shutdown activated - all connections terminated');
    } catch {
      toast.error('Panic action failed');
    } finally {
      setPanicking(false);
    }
  };

  const exportConfig = async (serverId: number, protocol: string) => {
    try {
      const res = await usersAPI.exportConfig(serverId, protocol);
      const blob = new Blob([res.data.config_body], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${protocol.toUpperCase()} config downloaded`);
    } catch {
      toast.error('Failed to export config');
    }
  };

  const toggleFavorite = async (serverId: number) => {
    const isFav = favorites.some(f => f.id === serverId);
    try {
      if (isFav) {
        await usersAPI.removeFavorite(serverId);
        setFavorites(favorites.filter(f => f.id !== serverId));
      } else {
        await usersAPI.addFavorite(serverId);
        const srv = servers.find(s => s.id === serverId);
        if (srv) setFavorites([...favorites, srv]);
      }
      toast.success(isFav ? 'Removed from favorites' : 'Added to favorites');
    } catch {
      toast.error('Failed to update favorites');
    }
  };

  const removeBypassRule = async (id: number) => {
    try {
      await usersAPI.deleteBypassRule(id);
      setBypassRules(bypassRules.filter(r => r.id !== id));
      toast.success('Rule removed');
    } catch {
      toast.error('Failed to remove rule');
    }
  };

  const getConfigString = (protocol: string) => {
    const host = selectedServer?.host || 'proxy.securevpn.com';
    const ports: Record<string, number> = { http: 8080, socks5: 1080, wireguard: 51820, ws: 3001 };
    const port = ports[protocol] || 8080;
    return `${host}:${port}`;
  };

  const bytesToGB = (bytes: number) => (bytes / (1024 ** 3)).toFixed(2);
  const bytesToMB = (bytes: number) => (bytes / (1024 ** 2)).toFixed(1);

  // Connection timer countdown
  const [connStartTime, setConnStartTime] = useState<number | null>(null);
  const [connElapsed, setConnElapsed] = useState(0);
  useEffect(() => {
    if (connected && !connStartTime) {
      setConnStartTime(Date.now());
    } else if (!connected) {
      setConnStartTime(null);
      setConnElapsed(0);
    }
    const interval = setInterval(() => {
      if (connected && connStartTime) {
        setConnElapsed(Math.floor((Date.now() - connStartTime) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [connected, connStartTime]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const sidebarItems: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'overview', icon: <Activity className="h-5 w-5" />, label: 'Overview' },
    { id: 'servers', icon: <Globe className="h-5 w-5" />, label: 'Servers' },
    { id: 'analytics', icon: <BarChart3 className="h-5 w-5" />, label: 'Analytics' },
    { id: 'settings', icon: <Settings className="h-5 w-5" />, label: 'Settings' },
    { id: 'advanced', icon: <Cpu className="h-5 w-5" />, label: 'Advanced' },
    { id: 'connections', icon: <Activity className="h-5 w-5" />, label: 'Connections' },
    { id: 'knowledge', icon: <Shield className="h-5 w-5" />, label: 'Help' },
    { id: 'support', icon: <AlertTriangle className="h-5 w-5" />, label: 'Support' },
    { id: 'profile', icon: <User className="h-5 w-5" />, label: 'Profile' },
  ];

  const themeClasses: Record<string, string> = {
    dark: 'bg-gray-950 text-white',
    light: 'bg-white text-gray-900',
    midnight: 'bg-slate-950 text-blue-100',
    emerald: 'bg-emerald-950 text-emerald-100',
  };
  const sidebarTheme: Record<string, string> = {
    dark: 'bg-gray-900/50 border-white/10',
    light: 'bg-gray-100 border-gray-200',
    midnight: 'bg-slate-900/50 border-blue-900/30',
    emerald: 'bg-emerald-900/30 border-emerald-800/30',
  };
  const cardTheme: Record<string, string> = {
    dark: 'bg-gray-900/50 border-white/10',
    light: 'bg-white border-gray-200 shadow-sm',
    midnight: 'bg-slate-900/50 border-blue-900/30',
    emerald: 'bg-emerald-900/30 border-emerald-800/30',
  };
  const currentTheme = themeClasses[theme] || themeClasses.dark;
  const currentSidebar = sidebarTheme[theme] || sidebarTheme.dark;
  const currentCard = cardTheme[theme] || cardTheme.dark;

  return (
    <div className={`min-h-screen flex ${currentTheme}`}>
      <aside className={`w-64 border-r p-6 hidden md:flex flex-col ${currentSidebar}`}>
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold">SecureVPN</span>
        </div>

        <nav className="space-y-1 flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer ${
                activeTab === item.id
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-white/10 pt-4">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 transition rounded-xl hover:bg-white/5"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-auto max-h-screen">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold capitalize">{activeTab}</h1>
            <p className="text-gray-400 mt-1">
              {user?.full_name || user?.username ? `Welcome back, ${user.full_name || user.username}` : 'Dashboard'}
              {mySub?.plan && mySub.plan !== 'free' && (
                <span className="ml-2 px-2 py-0.5 bg-indigo-600/20 text-indigo-400 text-xs rounded-full border border-indigo-500/30">
                  {mySub.plan}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setConnected(!connected)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition text-sm ${
              connected ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {connected ? <><WifiOff className="h-4 w-4" /> Disconnect</> : <><Wifi className="h-4 w-4" /> Connect</>}
          </button>
        </header>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-800/50 rounded-2xl" />)}
            </div>
            <div className="h-64 bg-gray-800/50 rounded-2xl" />
            <div className="grid md:grid-cols-2 gap-4">
              {[1,2].map(i => <div key={i} className="h-48 bg-gray-800/50 rounded-2xl" />)}
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
                  {[
                    { icon: <Activity className="h-5 w-5 text-indigo-400" />, label: 'Status', value: connected ? 'Connected' : 'Disconnected', color: connected ? 'text-emerald-400' : 'text-gray-400' },
                    { icon: <Zap className="h-5 w-5 text-amber-400" />, label: 'Protocol', value: activeProtocol.toUpperCase() },
                    { icon: <Globe className="h-5 w-5 text-emerald-400" />, label: 'Bandwidth Used', value: usage ? `${bytesToGB(usage.bytes_used)} GB` : '0 GB' },
                    { icon: <Server className="h-5 w-5 text-rose-400" />, label: 'Server', value: selectedServer ? selectedServer.country : 'Auto' },
                    { icon: <Shield className="h-5 w-5 text-violet-400" />, label: 'Kill Switch', value: killSwitch ? 'Active' : 'Off', color: killSwitch ? 'text-emerald-400' : 'text-gray-400' },
                    { icon: <Lock className="h-5 w-5 text-sky-400" />, label: 'DNS Protect', value: dnsProtection ? 'Active' : 'Off', color: dnsProtection ? 'text-emerald-400' : 'text-gray-400' },
                    { icon: <Layers className="h-5 w-5 text-emerald-400" />, label: 'Ad Blocking', value: adBlocking ? 'Active' : 'Off', color: adBlocking ? 'text-emerald-400' : 'text-gray-400' },
                    { icon: <Timer className="h-5 w-5 text-cyan-400" />, label: 'Connected', value: connected ? formatDuration(connElapsed) : 'Disconnected', color: connected ? 'text-cyan-400' : 'text-gray-400' },
                  ].map((stat, i) => (
                    <div key={i} className={`${currentCard} rounded-xl p-4`}>
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">{stat.icon} {stat.label}</div>
                      <div className={`text-lg font-bold ${stat.color || 'text-white'}`}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className={`${currentCard} rounded-2xl p-6 mb-8 overflow-hidden`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Global Server Map</h2>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Low</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Med</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> High</span>
                    </div>
                  </div>
                  <svg viewBox="0 0 800 400" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                    <rect width="800" height="400" fill="transparent" />
                    {/* Simplified world map paths */}
                    <path d="M50,180 Q80,160 120,170 L150,165 L170,180 L200,170 Q220,185 240,175 L260,190 L250,210 L220,220 L190,230 L160,225 L140,240 L110,230 L80,215 L50,200 Z" fill="currentColor" opacity="0.06" />
                    <path d="M280,170 Q310,155 340,160 L370,155 L400,165 L420,175 L430,200 L410,220 L380,230 L350,235 L320,230 L300,215 L280,195 Z" fill="currentColor" opacity="0.06" />
                    <path d="M450,160 Q480,145 520,150 L560,145 L600,155 L620,170 L630,200 L610,220 L580,230 L550,235 L520,230 L490,220 L470,200 L450,180 Z" fill="currentColor" opacity="0.06" />
                    <path d="M650,170 Q680,160 720,165 L760,170 L780,190 L770,210 L740,220 L700,218 L670,210 L650,195 Z" fill="currentColor" opacity="0.06" />
                    <path d="M120,250 Q150,240 200,245 L250,250 L280,260 L250,275 L200,280 L150,278 L120,265 Z" fill="currentColor" opacity="0.06" />
                    <path d="M380,250 Q420,240 480,245 L540,250 L580,260 L540,275 L480,280 L420,278 L380,265 Z" fill="currentColor" opacity="0.06" />
                    <path d="M300,290 Q340,280 400,285 L460,290 L500,300 L460,310 L400,315 L340,312 L300,305 Z" fill="currentColor" opacity="0.06" />
                    {servers.filter(s => s.latitude && s.longitude).map((s, i) => {
                      const x = ((s.longitude + 180) / 360) * 800;
                      const y = ((90 - s.latitude) / 180) * 400;
                      const loadColor = s.load_percent < 35 ? '#34d399' : s.load_percent < 70 ? '#fbbf24' : '#f87171';
                      const isSelected = selectedServer?.id === s.id;
                      return (
                        <g key={s.id} onClick={() => setSelectedServer(s)} className="cursor-pointer">
                          <circle cx={x} cy={y} r={isSelected ? 10 : 6} fill={loadColor} opacity={isSelected ? 0.25 : 0.15} />
                          <circle cx={x} cy={y} r={isSelected ? 6 : 4} fill={loadColor} />
                          {isSelected && <circle cx={x} cy={y} r={12} fill="none" stroke={loadColor} strokeWidth={1.5} opacity={0.5} />}
                          <text x={x} y={y - 10} textAnchor="middle" fill="currentColor" fontSize="9" opacity={isSelected ? 1 : 0.6} className="pointer-events-none">{s.country}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="md:col-span-2 bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Quick Connect</h2>
                      <div className="flex items-center gap-2">
                        {recProtocol && (
                          <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> {recProtocol.protocol.toUpperCase()} recommended
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'http', name: 'HTTP Proxy', desc: 'Best for web browsing', port: 8080 },
                        { id: 'socks5', name: 'SOCKS5', desc: 'Handles all TCP traffic', port: 1080 },
                        { id: 'wireguard', name: 'WireGuard', desc: 'Full system VPN', port: 51820 },
                        { id: 'ws', name: 'WebSocket Tunnel', desc: 'Works behind firewalls', port: 3001 },
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setActiveProtocol(p.id)}
                          className={`text-left p-4 rounded-xl border transition ${
                            activeProtocol === p.id
                              ? 'bg-indigo-600/20 border-indigo-500/30'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="font-semibold text-sm mb-0.5">{p.name}</div>
                          <div className="text-xs text-gray-400">{p.desc}</div>
                          <div className="text-xs text-gray-500 mt-1">Port: {p.port}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4">Data Usage</h2>
                    {usage ? (
                      <>
                        <div className="text-3xl font-bold text-indigo-400 mb-1">
                          {bytesToGB(usage.bytes_used)} GB
                        </div>
                        <div className="text-gray-400 text-xs mb-4">
                          of {bytesToGB(usage.bytes_quota)} GB
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                          <div
                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(usage.usage_percent, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">Resets monthly</div>
                        {mySub?.plan === 'free' && mySub?.plan !== 'none' && (
                          <button
                            onClick={() => setActiveTab('settings')}
                            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-semibold transition"
                          >
                            Upgrade Plan
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-500 text-sm">No usage data yet</div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Your Configurations</h2>
                  <div className="space-y-2">
                    {['http', 'socks5', 'wireguard', 'ws'].map((proto) => (
                      <div key={proto} className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/5">
                        <div>
                          <div className="font-semibold text-sm capitalize">{proto === 'ws' ? 'WebSocket Tunnel' : proto === 'http' ? 'HTTP Proxy' : proto === 'socks5' ? 'SOCKS5' : 'WireGuard'}</div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">{getConfigString(proto)}</div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(getConfigString(proto), proto)}
                          className="flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-3 py-2 rounded-lg text-xs transition"
                        >
                          {copied === proto ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          {copied === proto ? 'Copied' : 'Copy Config'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Speed Test</h2>
                    <button
                      onClick={runSpeedTest}
                      disabled={speedTesting}
                      className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
                    >
                      {speedTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gauge className="h-4 w-4" />}
                      {speedTesting ? 'Testing...' : 'Run Test'}
                    </button>
                  </div>
                  {speedTestResult && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                        <div className="text-xs text-gray-500 mb-1">Ping</div>
                        <div className="text-xl font-bold text-emerald-400">{speedTestResult.ping_ms} ms</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                        <div className="text-xs text-gray-500 mb-1">Download</div>
                        <div className="text-xl font-bold text-indigo-400">{speedTestResult.download_mbps} Mbps</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                        <div className="text-xs text-gray-500 mb-1">Upload</div>
                        <div className="text-xl font-bold text-amber-400">{speedTestResult.upload_mbps} Mbps</div>
                      </div>
                    </div>
                  )}
                  {!speedTestResult && !speedTesting && (
                    <p className="text-gray-500 text-sm">Test your connection speed to the nearest server.</p>
                  )}
                </div>

                {serviceStatus && (
                  <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 mt-6">
                    <h2 className="text-lg font-semibold mb-4">Service Status</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                        <div className={`text-xs font-semibold mb-1 ${serviceStatus.status === 'operational' ? 'text-emerald-400' : serviceStatus.status === 'degraded' ? 'text-amber-400' : 'text-red-400'}`}>
                          {serviceStatus.status === 'operational' ? 'Operational' : serviceStatus.status === 'degraded' ? 'Degraded' : 'Down'}
                        </div>
                        <div className="text-xs text-gray-500">Status</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                        <div className="text-lg font-bold text-indigo-400">{serviceStatus.healthy_servers}/{serviceStatus.total_servers}</div>
                        <div className="text-xs text-gray-500">Servers Healthy</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                        <div className="text-lg font-bold text-amber-400">{serviceStatus.avg_load}%</div>
                        <div className="text-xs text-gray-500">Avg Load</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                        <div className="text-lg font-bold text-emerald-400">{serviceStatus.total_clients}</div>
                        <div className="text-xs text-gray-500">Active Clients</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'servers' && (
              <>
                {recServer && (
                  <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-2xl p-5 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-indigo-400" />
                      <div>
                        <div className="font-semibold text-sm">Recommended: {recServer.name} ({recServer.country})</div>
                        <div className="text-xs text-gray-400">Load: {recServer.load_percent}% | Clients: {recServer.connected_clients}/{recServer.max_clients}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedServer(servers.find(s => s.id === recServer.id) || null)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition"
                    >
                      Connect
                    </button>
                  </div>
                )}
                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Server Locations</h2>
                  <div className="flex items-center gap-3">
                    <input type="text" value={serverSearch} onChange={(e) => setServerSearch(e.target.value)} placeholder="Search servers..." className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white outline-none w-48" />
                    {favorites.length > 0 && (
                      <span className="text-xs text-gray-500">{favorites.length} favorites</span>
                    )}
                  </div>
                </div>
                {servers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No servers available</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {servers
                      .filter(s => !serverSearch || s.name.toLowerCase().includes(serverSearch.toLowerCase()) || s.country.toLowerCase().includes(serverSearch.toLowerCase()) || (s.city || '').toLowerCase().includes(serverSearch.toLowerCase()))
                      .map((srv) => {
                      const isFav = favorites.some(f => f.id === srv.id);
                      return (
                      <div
                        key={srv.id}
                        className={`bg-white/5 border rounded-xl p-4 transition hover:bg-white/10 ${
                          selectedServer?.id === srv.id ? 'border-indigo-500/50 bg-indigo-600/10' : 'border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleFavorite(srv.id)} className="text-amber-400 hover:scale-110 transition">
                              {isFav ? '★' : '☆'}
                            </button>
                            <button onClick={() => setSelectedServer(srv)} className="flex items-center gap-2">
                              <Signal className="h-4 w-4 text-emerald-400" />
                              <span className="font-semibold">{srv.country}</span>
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            {(srv as any).p2p_allowed && <span className="text-xs px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded">P2P</span>}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              srv.load_percent < 50 ? 'bg-emerald-500/10 text-emerald-400' :
                              srv.load_percent < 80 ? 'bg-amber-500/10 text-amber-400' :
                              'bg-red-500/10 text-red-400'
                            }`}>
                              {srv.load_percent}% load
                            </span>
                          </div>
                        </div>
                        {srv.city && <div className="text-xs text-gray-500 mb-2">{srv.city}</div>}
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>{srv.connected_clients}/{srv.max_clients} clients</span>
                          <span>{srv.protocols?.join(', ').toUpperCase()}</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex gap-2">
                          <select
                            defaultValue=""
                            onChange={(e) => { if (e.target.value) exportConfig(srv.id, e.target.value); e.target.value = ''; }}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                          >
                            <option value="">Export config...</option>
                            <option value="openvpn">OpenVPN</option>
                            <option value="wireguard">WireGuard</option>
                            <option value="http">HTTP Proxy</option>
                            <option value="socks5">SOCKS5</option>
                          </select>
                          <button
                            onClick={async () => { const res = await usersAPI.wireguardQR(srv.id).catch(() => null); if (res?.data) { setQrData(res.data); toast.success('QR code generated'); } }}
                            className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-2 py-1.5 rounded-lg text-xs transition"
                            title="WireGuard QR for mobile"
                          >
                            QR
                          </button>
                          <button
                            onClick={() => { setSelectedServer(srv); setConnected(true); toast.success(`Connecting to ${srv.country}`); }}
                            className={`px-3 py-1.5 rounded-lg text-xs transition font-medium ${
                              connected && selectedServer?.id === srv.id
                                ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                                : 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30'
                            }`}
                          >
                            {connected && selectedServer?.id === srv.id ? 'Disconnect' : 'Connect'}
                          </button>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
              </>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Usage Analytics</h2>
                  {usage ? (
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <div className="text-gray-400 text-xs mb-1">Total Bandwidth</div>
                        <div className="text-2xl font-bold text-indigo-400">{bytesToGB(usage.bytes_used)} GB</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <div className="text-gray-400 text-xs mb-1">Bandwidth Quota</div>
                        <div className="text-2xl font-bold text-emerald-400">{bytesToGB(usage.bytes_quota)} GB</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <div className="text-gray-400 text-xs mb-1">Usage</div>
                        <div className="text-2xl font-bold text-amber-400">{usage.usage_percent}%</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No analytics data available yet.</p>
                  )}
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-indigo-600 h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(usage?.usage_percent || 0, 100)}%` }} />
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Connection History</h2>
                  {sessions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-400 border-b border-white/10">
                            <th className="text-left py-3 font-medium">Server</th>
                            <th className="text-left py-3 font-medium">Protocol</th>
                            <th className="text-right py-3 font-medium">Download</th>
                            <th className="text-right py-3 font-medium">Upload</th>
                            <th className="text-right py-3 font-medium">Duration</th>
                            <th className="text-right py-3 font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessions.slice(0, 20).map((s: any) => {
                            const srv = servers.find(x => x.id === s.server_id);
                            return (
                              <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-3">{srv?.country || s.server_id || 'Unknown'}</td>
                                <td className="py-3 text-indigo-400 uppercase">{s.protocol}</td>
                                <td className="py-3 text-right text-emerald-400">{bytesToMB(s.bytes_received || 0)} MB</td>
                                <td className="py-3 text-right text-amber-400">{bytesToMB(s.bytes_sent || 0)} MB</td>
                                <td className="py-3 text-right">{Math.floor((s.duration || 0) / 60)}m</td>
                                <td className="py-3 text-right text-gray-400">{s.recorded_at ? new Date(s.recorded_at).toLocaleDateString() : '-'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No connection history yet.</p>
                  )}
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Bandwidth Over Time (Last 7 Days)</h2>
                  <div className="flex items-end gap-2 h-32">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const h = 30 + Math.random() * 70;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-indigo-600/80 rounded-t" style={{ height: `${h}%`, opacity: 0.5 + (h / 200) }} />
                          <span className="text-xs text-gray-500">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-4">Simulated bandwidth usage chart. Real-time data available with detailed monitoring.</p>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Server Load Overview</h2>
                  {serverLoadHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-400 border-b border-white/10">
                            <th className="text-left py-2 font-medium">Server</th>
                            <th className="text-left py-2 font-medium">Country</th>
                            <th className="text-right py-2 font-medium">Load</th>
                            <th className="text-right py-2 font-medium">Clients</th>
                          </tr>
                        </thead>
                        <tbody>
                          {serverLoadHistory.map((s: any) => (
                            <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-2">{s.name}</td>
                              <td className="py-2 text-gray-400">{s.country}</td>
                              <td className="py-2 text-right">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${s.current_load < 50 ? 'bg-emerald-500/10 text-emerald-400' : s.current_load < 80 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                                  {s.current_load}%
                                </span>
                              </td>
                              <td className="py-2 text-right text-gray-400">{s.current_clients}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No server load data available.</p>
                  )}
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Data Export</h2>
                    <button
                      onClick={async () => { setExportingData(true); try { const res = await usersAPI.exportUsage(); const blob = new Blob([res.data.csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'securevpn-usage.csv'; a.click(); URL.revokeObjectURL(url); toast.success(`${res.data.rows} records exported`); } catch { toast.error('Export failed'); } finally { setExportingData(false); } }}
                      disabled={exportingData}
                      className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-4 py-2 rounded-lg text-sm transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {exportingData ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      {exportingData ? 'Exporting...' : 'Export CSV'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Download your usage history as a CSV file.</p>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">WireGuard Peer Health</h2>
                  {wgHealth ? (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400 mb-2">Active peers: <span className="text-emerald-400 font-bold">{wgHealth.total_active}</span> / {wgHealth.peers.length}</div>
                      {wgHealth.peers.map((p: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/5 text-sm">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${p.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            <span className="font-mono text-xs">{p.endpoint}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>🤝 {p.latest_handshake}</span>
                            <span>⬇ {p.transfer_rx}</span>
                            <span>⬆ {p.transfer_tx}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No WireGuard peer data available.</p>
                  )}
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Bulk Config Generation</h2>
                    <button
                      onClick={async () => { const res = await usersAPI.bulkConfigs().catch(() => null); if (res?.data) { const json = JSON.stringify(res.data.configs, null, 2); const blob = new Blob([json], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'securevpn-all-configs.json'; a.click(); URL.revokeObjectURL(url); toast.success(`${res.data.count} configs exported`); } }}
                      className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-4 py-2 rounded-lg text-sm transition flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" /> Download All
                    </button>
                  </div>
                  {bulkConfigs.length > 0 && (
                    <div className="text-xs text-gray-500">{bulkConfigs.length} configurations across all servers and protocols.</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="max-w-2xl space-y-6">
                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">DNS over HTTPS</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">DoH</div>
                      <div className="text-xs text-gray-500">Encrypt DNS queries with HTTPS</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={dnsOverHttps} onChange={async (e) => { setDnsOverHttps(e.target.checked); await usersAPI.setDnsOverHttps(e.target.checked).catch(() => {}); }} />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Bandwidth Saver</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Bandwidth Saver</div>
                      <div className="text-xs text-gray-500">Reduce data usage by compressing traffic</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={bandwidthSaver} onChange={async (e) => { setBandwidthSaver(e.target.checked); await usersAPI.setBandwidthSaver(e.target.checked).catch(() => {}); }} />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Timer Settings</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Auto-Disconnect</div>
                        <div className="text-xs text-gray-500">Disconnect after inactivity</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" min={0} max={999} value={autoDisconnectMins} onChange={async (e) => { const v = parseInt(e.target.value) || 0; setAutoDisconnectMins(v); await usersAPI.setAutoDisconnect(v).catch(() => {}); }} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white outline-none w-20 text-center" />
                        <span className="text-xs text-gray-500">min</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Connection Timer</div>
                        <div className="text-xs text-gray-500">Auto-disconnect after set time</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" min={0} max={999} value={connectionTimerMins} onChange={async (e) => { const v = parseInt(e.target.value) || 0; setConnectionTimerMins(v); await usersAPI.setConnectionTimer(v).catch(() => {}); }} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white outline-none w-20 text-center" />
                        <span className="text-xs text-gray-500">min</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Set to 0 to disable.</p>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Network</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">MTU Size</div>
                        <div className="text-xs text-gray-500">Maximum Transmission Unit</div>
                      </div>
                      <select value={mtuSize} onChange={async (e) => { const v = parseInt(e.target.value); setMtuSize(v); await usersAPI.setMtu(v).catch(() => {}); }} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none">
                        <option value={1400}>1400</option>
                        <option value={1450}>1450</option>
                        <option value={1500}>1500</option>
                        <option value={1280}>1280 (IPv6)</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Custom Port</div>
                        <div className="text-xs text-gray-500">Override default connection port (0 = auto)</div>
                      </div>
                      <input type="number" min={0} max={65535} value={customPort} onChange={async (e) => { const v = parseInt(e.target.value) || 0; setCustomPort(v); await usersAPI.setCustomPort(v).catch(() => {}); }} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white outline-none w-24 text-center" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Prefer TCP</div>
                        <div className="text-xs text-gray-500">Use TCP instead of UDP when possible</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={preferTcp} onChange={async (e) => { setPreferTcp(e.target.checked); await usersAPI.setTcpMode(e.target.checked).catch(() => {}); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Server Display</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">City-Level Selection</div>
                        <div className="text-xs text-gray-500">Choose servers by city</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={cityLevel} onChange={async (e) => { setCityLevel(e.target.checked); await usersAPI.setCityLevel(e.target.checked).catch(() => {}); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Server Grouping</div>
                      </div>
                      <select value={serverGrouping} onChange={async (e) => { setServerGrouping(e.target.value); await usersAPI.setServerGrouping(e.target.value).catch(() => {}); }} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none">
                        <option value="country">By Country</option>
                        <option value="region">By Region</option>
                        <option value="type">By Type</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Protocol Order</div>
                        <div className="text-xs text-gray-500">Preferred protocol priority</div>
                      </div>
                      <input type="text" value={protocolOrder} onChange={async (e) => { setProtocolOrder(e.target.value); await usersAPI.setProtocolOrder(e.target.value).catch(() => {}); }} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white outline-none w-48 text-center" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Split Tunnel Mode</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Mode</div>
                      <div className="text-xs text-gray-500">How split tunneling is applied</div>
                    </div>
                    <select value={splitTunnelMode} onChange={async (e) => { setSplitTunnelMode(e.target.value); await usersAPI.setSplitTunnelMode(e.target.value).catch(() => {}); }} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none">
                      <option value="apps">By Application</option>
                      <option value="domains">By Domain</option>
                      <option value="ips">By IP Range</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Tor & Onion Routing</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">VPN over Tor</div>
                        <div className="text-xs text-gray-500">Route traffic through Tor network first</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={torEnabled} onChange={async (e) => { setTorEnabled(e.target.checked); await usersAPI.setTorRouting(e.target.checked).catch(() => {}); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Onion over VPN</div>
                        <div className="text-xs text-gray-500">Route traffic through VPN then Tor</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={onionEnabled} onChange={async (e) => { setOnionEnabled(e.target.checked); await usersAPI.setOnionVpn(e.target.checked).catch(() => {}); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Language</h2>
                  <select value={language} onChange={async (e) => { setLanguage(e.target.value); await usersAPI.setLanguage(e.target.value).catch(() => {}); }} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none w-full">
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                    <option value="pt">Português</option>
                    <option value="ru">Русский</option>
                  </select>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Auto-Renew</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Auto-Renew Subscription</div>
                      <div className="text-xs text-gray-500">Automatically renew your plan</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={autoRenew} onChange={async (e) => { setAutoRenew(e.target.checked); await usersAPI.setAutoRenew(e.target.checked).catch(() => {}); }} />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Leak Test</h2>
                  <p className="text-xs text-gray-500 mb-3">Check for IP, DNS, and WebRTC leaks</p>
                  <button onClick={async () => { setLeakTesting(true); setLeakTestResult(null); const res = await usersAPI.leakTest().catch(() => null); if (res?.data) setLeakTestResult(res.data); setLeakTesting(false); }} disabled={leakTesting} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm transition flex items-center gap-2">
                    {leakTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Run Leak Test
                  </button>
                  {leakTestResult && (
                    <div className="mt-3 space-y-2">
                      <div className={`flex items-center gap-2 text-sm ${leakTestResult.ip_leak ? 'text-red-400' : 'text-emerald-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${leakTestResult.ip_leak ? 'bg-red-400' : 'bg-emerald-400'}`} />
                        IP Leak: {leakTestResult.ip_leak ? 'Detected' : 'None'}
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${leakTestResult.dns_leak ? 'text-red-400' : 'text-emerald-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${leakTestResult.dns_leak ? 'bg-red-400' : 'bg-emerald-400'}`} />
                        DNS Leak: {leakTestResult.dns_leak ? 'Detected' : 'None'}
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${leakTestResult.webrtc_leak ? 'text-red-400' : 'text-emerald-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${leakTestResult.webrtc_leak ? 'bg-red-400' : 'bg-emerald-400'}`} />
                        WebRTC Leak: {leakTestResult.webrtc_leak ? 'Detected' : 'None'}
                      </div>
                      <div className={`text-sm font-semibold ${leakTestResult.overall_safe ? 'text-emerald-400' : 'text-red-400'}`}>
                        {leakTestResult.overall_safe ? '✅ You are safe' : '❌ Leaks detected'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Free Trial</h2>
                  {trialInfo && !trialInfo.used ? (
                    <div>
                      <p className="text-xs text-gray-500 mb-3">Start your 7-day free trial with 10 GB bandwidth.</p>
                      <button onClick={async () => { const res = await usersAPI.startTrial().catch(() => null); if (res?.data) { setTrialInfo(res.data); toast.success('Trial started!'); } }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition">Start Free Trial</button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">
                      {trialInfo?.used ? 'Trial already used.' : 'Log in to see trial options.'}
                    </div>
                  )}
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Quick Connect</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Quick Connect Button</div>
                      <div className="text-xs text-gray-500">Show quick connect in overview</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={quickConnect} onChange={async (e) => { setQuickConnect(e.target.checked); await usersAPI.setQuickConnect(e.target.checked).catch(() => {}); }} />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Connectivity Check</h2>
                  <button onClick={async () => { const res = await usersAPI.connectivityCheck().catch(() => null); if (res?.data) setConnectivityResult(res.data); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm transition">Check Connectivity</button>
                  {connectivityResult && (
                    <div className="mt-3 space-y-2">
                      <div className={`text-sm ${connectivityResult.overall === 'operational' ? 'text-emerald-400' : 'text-amber-400'}`}>Overall: {connectivityResult.overall}</div>
                      {Object.entries(connectivityResult.protocols).map(([proto, info]: any) => (
                        <div key={proto} className="flex items-center justify-between text-sm">
                          <span className="text-gray-400 capitalize">{proto}</span>
                          <span className={info.status === 'ok' ? 'text-emerald-400' : 'text-amber-400'}>{info.status} ({info.latency_ms}ms)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* --- NEW ADVANCED FEATURES --- */}

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">RAM-Only / TrustedServer</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">RAM-Only Mode</div>
                      <div className="text-xs text-gray-500">No data persists on server reboot — like ExpressVPN TrustedServer</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={ramOnly} onChange={async (e) => { setRamOnly(e.target.checked); await usersAPI.setRamOnly(e.target.checked).catch(() => {}); }} />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">No-Logs Attestation</h2>
                  <div className="text-xs text-gray-500 mb-3">We do not log browsing history, connection timestamps, IP addresses, or DNS queries. Operated from Switzerland (outside 5/9/14 Eyes).</div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Accept No-Logs Policy</div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={noLogsAttested} onChange={async (e) => { setNoLogsAttested(e.target.checked); await usersAPI.setNoLogsAttestation(e.target.checked).catch(() => {}); }} />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Perfect Forward Secrecy (PFS)</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">PFS Enabled</div>
                        <div className="text-xs text-gray-500">Changes encryption keys every few minutes for past-session safety</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={pfsEnabled} onChange={async (e) => { setPfsEnabled(e.target.checked); await usersAPI.setPfs({ enabled: e.target.checked, key_rotation_hours: pfsRotation }).catch(() => {}); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Key Rotation (hours)</div>
                      <input type="number" min={1} max={168} value={pfsRotation} onChange={async (e) => { const v = parseInt(e.target.value) || 24; setPfsRotation(v); await usersAPI.setPfs({ enabled: pfsEnabled, key_rotation_hours: v }).catch(() => {}); }} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white outline-none w-20 text-center" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Smart DNS</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Smart DNS</div>
                        <div className="text-xs text-gray-500">Unblock streaming on devices that don't support VPN (TVs, consoles)</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={smartDnsEnabled} onChange={async (e) => { setSmartDnsEnabled(e.target.checked); await usersAPI.setSmartDns({ enabled: e.target.checked, dns_servers: smartDnsServers }).catch(() => {}); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                    {smartDnsEnabled && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">DNS Servers</div>
                          <input type="text" value={smartDnsServers} onChange={async (e) => { setSmartDnsServers(e.target.value); await usersAPI.setSmartDns({ enabled: true, dns_servers: e.target.value }).catch(() => {}); }} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white outline-none w-36 text-center" />
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-2">Domain Rules</div>
                          {smartDnsRules.map(r => (
                            <div key={r.id} className="flex items-center justify-between text-sm text-gray-400 bg-white/5 rounded-lg px-3 py-2 mb-1">
                              <span>{r.domain}</span>
                              <button onClick={async () => { await usersAPI.deleteSmartDnsRule(r.id).catch(() => {}); setSmartDnsRules(prev => prev.filter(x => x.id !== r.id)); }} className="text-red-400 hover:text-red-300"><X className="h-3 w-3" /></button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Malware & Tracker Blocker</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Malware Blocking</div>
                        <div className="text-xs text-gray-500">Block known malicious domains at server level</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={malwareEnabled} onChange={async (e) => { setMalwareEnabled(e.target.checked); await usersAPI.setMalwareBlocker({ malware_enabled: e.target.checked, tracker_enabled: trackerEnabled }).catch(() => {}); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Tracker & Ad Blocking</div>
                        <div className="text-xs text-gray-500">Block trackers and intrusive ads</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={trackerEnabled} onChange={async (e) => { setTrackerEnabled(e.target.checked); await usersAPI.setMalwareBlocker({ malware_enabled: malwareEnabled, tracker_enabled: e.target.checked }).catch(() => {}); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Auto WiFi Protection</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Auto-Connect on Untrusted WiFi</div>
                      <div className="text-xs text-gray-500">Automatically boots VPN on untrusted networks</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={autoWifi} onChange={async (e) => { setAutoWifi(e.target.checked); await usersAPI.setAutoWifiProtection(e.target.checked).catch(() => {}); }} />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Unlimited Connections</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Unlimited Simultaneous Devices</div>
                      <div className="text-xs text-gray-500">No artificial device limits — secure every device</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={unlimitedConn} onChange={async (e) => { setUnlimitedConn(e.target.checked); await usersAPI.setUnlimitedConnections(e.target.checked).catch(() => {}); }} />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Dynamic Server Switching</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Auto-Switch on Overload</div>
                      <div className="text-xs text-gray-500">Switch to less crowded server if performance drops</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={dynamicSwitching} onChange={async (e) => { setDynamicSwitching(e.target.checked); await usersAPI.setDynamicSwitching(e.target.checked).catch(() => {}); }} />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Enhanced Multi-Hop (Chained)</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Multi-Hop Chain</div>
                        <div className="text-xs text-gray-500">Route through 2-3 servers for double encryption</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={advancedMultiHop?.enabled || false} onChange={async (e) => { const v = e.target.checked; await usersAPI.setAdvancedMultiHop({ enabled: v }).catch(() => {}); setAdvancedMultiHop((prev: any) => ({ ...prev, enabled: v })); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                    {advancedMultiHop?.hops && (
                      <div className="text-xs text-gray-500 space-y-1">
                        {advancedMultiHop.hops.map((hop: any) => (
                          <div key={hop.position} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-400" />
                            Hop {hop.position}: {hop.name} ({hop.country})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Obfuscation Rules (DPI Bypass)</h2>
                  <div className="space-y-3">
                    <div className="text-xs text-gray-500">Scramble VPN traffic to bypass Deep Packet Inspection in restricted countries</div>
                    <select value={stealthMethod} onChange={async (e) => { setStealthMethod(e.target.value); await usersAPI.setStealth({ enabled: stealthEnabled, method: e.target.value }).catch(() => {}); }} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none w-full">
                      <option value="none">None</option>
                      <option value="tls">TLS Obfuscation</option>
                      <option value="noise">Noise Protocol</option>
                      <option value="shadow">Shadow Protocol</option>
                      <option value="wss">WebSocket Secure (WSS)</option>
                    </select>
                    {obfuscationRules.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-gray-400 mb-1">Custom Rules:</div>
                        {obfuscationRules.map(r => (
                          <div key={r.id} className="flex items-center justify-between text-sm text-gray-400 bg-white/5 rounded-lg px-3 py-2 mb-1">
                            <span>{r.name} ({r.type}:{r.port})</span>
                            <button onClick={async () => { await usersAPI.deleteObfuscationRule(r.id).catch(() => {}); setObfuscationRules(prev => prev.filter(x => x.id !== r.id)); }} className="text-red-400 hover:text-red-300"><X className="h-3 w-3" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Shadowsocks Proxy</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Shadowsocks</div>
                        <div className="text-xs text-gray-500">Lightweight proxy for piercing tough firewalls</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={shadowsocksInfo?.enabled || false} onChange={async (e) => { const v = e.target.checked; await usersAPI.setShadowsocks({ enabled: v, port: shadowsocksInfo?.port || 8443, method: shadowsocksInfo?.method || 'aes-256-gcm' }).catch(() => {}); setShadowsocksInfo((prev: any) => ({ ...prev, enabled: v })); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                    {shadowsocksInfo?.enabled && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Port</span>
                          <span className="text-sm text-white">{shadowsocksInfo.port || 8443}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Encryption</span>
                          <span className="text-sm text-white">{shadowsocksInfo.method || 'aes-256-gcm'}</span>
                        </div>
                        {shadowsocksConfigs.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs font-medium text-gray-400 mb-1">Server Configs:</div>
                            <pre className="text-xs bg-gray-800 p-2 rounded overflow-auto max-h-32">{JSON.stringify(shadowsocksConfigs.slice(0, 3), null, 2)}</pre>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Meshnet (P2P Device Mesh)</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Meshnet</div>
                        <div className="text-xs text-gray-500">Create direct P2P connections between your devices worldwide</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={meshnetEnabled} onChange={async (e) => { setMeshnetEnabled(e.target.checked); await usersAPI.setMeshnet(e.target.checked).catch(() => {}); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                    {meshnetEnabled && (
                      <>
                        <div className="flex gap-2">
                          <input type="text" value={newMeshPeerName} onChange={(e) => setNewMeshPeerName(e.target.value)} placeholder="Peer name" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white outline-none" />
                          <button onClick={async () => { if (!newMeshPeerName) return; const res = await usersAPI.addMeshnetPeer({ name: newMeshPeerName }).catch(() => null); if (res?.data) { setMeshnetPeers((prev: any) => [...prev, res.data]); setNewMeshPeerName(''); toast.success('Peer added'); } }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm transition">Add Peer</button>
                        </div>
                        {meshnetPeers.map(p => (
                          <div key={p.id} className="flex items-center justify-between text-sm bg-white/5 rounded-lg px-3 py-2">
                            <div>
                              <span className="text-white">{p.name}</span>
                              <span className="text-gray-500 ml-2">{p.ip_address}</span>
                              <span className={`ml-2 ${p.is_online ? 'text-emerald-400' : 'text-gray-500'}`}>{p.is_online ? 'Online' : 'Offline'}</span>
                            </div>
                            <button onClick={async () => { await usersAPI.removeMeshnetPeer(p.id).catch(() => {}); setMeshnetPeers((prev: any) => prev.filter((x: any) => x.id !== p.id)); }} className="text-red-400 hover:text-red-300"><X className="h-3 w-3" /></button>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Dedicated IP</h2>
                  <div className="space-y-3">
                    {dedicatedIpInfo?.assigned ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">IP Address</span>
                          <span className="text-sm font-mono text-emerald-400">{dedicatedIpInfo.ip_address}</span>
                        </div>
                        <button onClick={async () => { await usersAPI.releaseDedicatedIp().catch(() => {}); setDedicatedIpInfo({ assigned: false }); toast.success('Dedicated IP released'); }} className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-1.5 rounded-lg text-sm transition">Release IP</button>
                      </>
                    ) : (
                      <div>
                        <p className="text-xs text-gray-500 mb-3">Get a static, clean IP that hasn't been flagged by streaming sites.</p>
                        <button onClick={async () => { const srv = servers[0]; if (!srv) return; const res = await usersAPI.assignDedicatedIp(srv.id).catch(() => null); if (res?.data) { setDedicatedIpInfo(res.data); toast.success(`Dedicated IP: ${res.data.ip_address}`); } }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm transition">Assign Dedicated IP</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Tunnel Stability Monitor</h2>
                  <button onClick={async () => { const res = await usersAPI.getTunnelStatus().catch(() => null); if (res?.data) setTunnelStatus(res.data); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm transition mb-3">Check Tunnel Status</button>
                  {tunnelStatus && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-400">Type</span><span className="text-white">{tunnelStatus.tunnel_type}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Encapsulation</span><span className="text-white">{tunnelStatus.encapsulation}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Encryption</span><span className="text-white">{tunnelStatus.encryption}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">PFS</span><span className={tunnelStatus.pfs_enabled ? 'text-emerald-400' : 'text-gray-400'}>{tunnelStatus.pfs_enabled ? 'Active' : 'Off'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Stability Score</span><span className="text-emerald-400">{tunnelStatus.stability_score}%</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Uptime</span><span className="text-white">{Math.floor(tunnelStatus.uptime_seconds / 60)} min</span></div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">10 Gbps Server Ports</h2>
                  <button onClick={async () => { const res = await usersAPI.bandwidthTest().catch(() => null); if (res?.data) setBandwidthTestResult(res.data); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm transition mb-3">Check Bandwidth</button>
                  {bandwidthTestResult && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-400">Capacity</span><span className="text-white">{bandwidthTestResult.server_capacity_gbps} Gbps</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Current Load</span><span className="text-amber-400">{bandwidthTestResult.current_load_mbps} Mbps</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Available</span><span className="text-emerald-400">{bandwidthTestResult.available_mbps} Mbps</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Congestion</span><span className="text-gray-400 capitalize">{bandwidthTestResult.congestion}</span></div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Privacy Jurisdiction</h2>
                  {privacyInfo && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-400">Jurisdiction</span><span className="text-white">{privacyInfo.jurisdiction}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Data Protection</span><span className="text-white">{privacyInfo.data_protection}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Surveillance Alliances</span><span className="text-emerald-400">{privacyInfo.surveillance_alliances}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Audited By</span><span className="text-white">{privacyInfo.audited_by}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Server Technology</span><span className="text-white">{privacyInfo.trusted_server_technology}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">No-Logs Policy</span><span className="text-emerald-400">{privacyInfo.no_logs_policy}</span></div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Tunnel Health Reports</h2>
                  {tunnelHealthReports.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {tunnelHealthReports.slice(0, 10).map(r => (
                        <div key={r.id} className="flex items-center justify-between text-sm bg-white/5 rounded-lg px-3 py-2">
                          <div>
                            <span className={r.is_stable ? 'text-emerald-400' : 'text-red-400'}>{r.is_stable ? 'Stable' : 'Unstable'}</span>
                            <span className="text-gray-500 ml-2">{r.protocol} — {r.latency_ms}ms</span>
                          </div>
                          <span className="text-xs text-gray-500">{r.packet_loss_pct}% loss | {r.jitter_ms}ms jitter</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No tunnel health reports yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'connections' && (
              <div className="space-y-6">
                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Connection Statistics</h2>
                  {connectionStats ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                        <div className="text-2xl font-bold">{connectionStats.total_connections}</div>
                        <div className="text-xs text-gray-500">Total Connections</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                        <div className="text-2xl font-bold">{Math.round(connectionStats.total_duration_seconds / 60)}</div>
                        <div className="text-xs text-gray-500">Minutes Connected</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                        <div className="text-2xl font-bold">{(connectionStats.total_bytes / 1073741824).toFixed(2)}</div>
                        <div className="text-xs text-gray-500">GB Total</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                        <div className="text-2xl font-bold">{connectionStats.avg_quality_score}</div>
                        <div className="text-xs text-gray-500">Avg Quality</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Loading statistics...</p>
                  )}
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Connection Log</h2>
                    <label className="relative inline-flex items-center cursor-pointer gap-2">
                      <span className="text-xs text-gray-500">Logging</span>
                      <input type="checkbox" className="sr-only peer" checked={connLogEnabled} onChange={async (e) => { setConnLogEnabled(e.target.checked); await usersAPI.setConnectionLogEnabled(e.target.checked).catch(() => {}); }} />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>
                  {connectionLogs.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-2 font-medium">Server</th>
                            <th className="text-left py-2 font-medium">Protocol</th>
                            <th className="text-right py-2 font-medium">Duration</th>
                            <th className="text-right py-2 font-medium">Data</th>
                            <th className="text-right py-2 font-medium">Quality</th>
                          </tr>
                        </thead>
                        <tbody>
                          {connectionLogs.slice(0, 20).map((l: any) => (
                            <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-2">{l.server_name || `Server #${l.server_id}`}</td>
                              <td className="py-2 text-gray-400">{l.protocol}</td>
                              <td className="py-2 text-right">{Math.round(l.duration_seconds / 60)} min</td>
                              <td className="py-2 text-right">{((l.bytes_sent + l.bytes_received) / 1048576).toFixed(1)} MB</td>
                              <td className="py-2 text-right"><span className={`text-xs px-2 py-0.5 rounded-full ${l.quality_score >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{l.quality_score}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No connection logs yet.</p>
                  )}
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Connection Rules (Custom Routing)</h2>
                  {connectionRules.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {connectionRules.map((r: any) => (
                        <div key={r.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/5 text-sm">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${r.enabled ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                            <span>{r.name || r.source_value}</span>
                            <span className="text-xs text-gray-500">{r.source_type}: {r.source_value} → {r.destination_type}: {r.destination_value}</span>
                          </div>
                          <button onClick={async () => { await usersAPI.deleteConnectionRule(r.id).catch(() => {}); setConnectionRules(connectionRules.filter((x: any) => x.id !== r.id)); }} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" value={newRuleName} onChange={(e) => setNewRuleName(e.target.value)} placeholder="Rule name..." className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                    <input type="text" value={newRuleSource} onChange={(e) => setNewRuleSource(e.target.value)} placeholder="Source (domain/IP)..." className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                    <input type="text" value={newRuleDest} onChange={(e) => setNewRuleDest(e.target.value)} placeholder="Destination..." className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                  </div>
                  <button onClick={async () => { if (!newRuleSource.trim()) return; await usersAPI.createConnectionRule({ name: newRuleName || 'Route', source_type: 'domain', source_value: newRuleSource, destination_value: newRuleDest || 'proxy', action: 'route' }).catch(() => {}); toast.success('Rule added'); setNewRuleName(''); setNewRuleSource(''); setNewRuleDest(''); }} className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm transition">Add Rule</button>
                </div>
              </div>
            )}

            {activeTab === 'knowledge' && (
              <div className="max-w-2xl space-y-6">
                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Search Knowledge Base</h2>
                  <input type="text" value={kbSearch} onChange={async (e) => { setKbSearch(e.target.value); if (e.target.value.trim()) { const res = await usersAPI.searchKnowledgeBase(e.target.value).catch(() => null); setKbResults(res?.data || []); } else { setKbResults([]); } }} placeholder="Search articles..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                  {kbResults.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {kbResults.map((a: any) => (
                        <div key={a.id} className="bg-white/5 rounded-xl p-3 border border-white/5">
                          <div className="text-sm font-medium">{a.title}</div>
                          <div className="text-xs text-gray-500 mt-1">{a.content}</div>
                          <span className="text-xs text-indigo-400 mt-1 inline-block">{a.category}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Knowledge Base</h2>
                  {knowledgeBase.length > 0 ? (
                    <div className="space-y-3">
                      {knowledgeBase.map((a: any) => (
                        <details key={a.id} className="bg-white/5 rounded-xl border border-white/5">
                          <summary className="p-3 cursor-pointer hover:bg-white/5 text-sm font-medium">{a.title}</summary>
                          <div className="px-3 pb-3 text-xs text-gray-400">{a.content}</div>
                        </details>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No articles available.</p>
                  )}
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">FAQ</h2>
                  {faqs.length > 0 ? (
                    <div className="space-y-3">
                      {faqs.map((faq: any, i: number) => (
                        <details key={i} className="bg-white/5 rounded-xl border border-white/5">
                          <summary className="p-3 cursor-pointer hover:bg-white/5 text-sm font-medium">{faq.question}</summary>
                          <div className="px-3 pb-3 text-xs text-gray-400">{faq.answer}</div>
                        </details>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No FAQs available.</p>
                  )}
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Speed Colors Reference</h2>
                  {speedColors.length > 0 ? (
                    <div className="space-y-2">
                      {speedColors.map((sc: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <div className={`w-4 h-4 rounded-full bg-${sc.color}-400`} />
                          <span className="capitalize">{sc.label}</span>
                          <span className="text-xs text-gray-500">(&lt; {sc.max_load}% load)</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="max-w-2xl space-y-6">
                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Create Support Ticket</h2>
                  <div className="space-y-3">
                    <input type="text" value={newTicketSubject} onChange={(e) => setNewTicketSubject(e.target.value)} placeholder="Subject..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                    <textarea value={newTicketMessage} onChange={(e) => setNewTicketMessage(e.target.value)} placeholder="Describe your issue..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none h-24 resize-none" />
                    <button onClick={async () => { if (!newTicketSubject.trim() || !newTicketMessage.trim()) return; const res = await usersAPI.createSupportTicket({ subject: newTicketSubject, message: newTicketMessage, category: 'general' }).catch(() => null); if (res?.data) { toast.success('Ticket created'); setNewTicketSubject(''); setNewTicketMessage(''); } }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition">Submit Ticket</button>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Your Tickets</h2>
                  {tickets.length > 0 ? (
                    <div className="space-y-2">
                      {tickets.map((t: any) => (
                        <div key={t.id} className="bg-white/5 rounded-xl p-3 border border-white/5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{t.subject}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' : t.status === 'open' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>{t.status}</span>
                          </div>
                          <div className="text-xs text-gray-500 mb-2">{t.message?.slice(0, 200)}</div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Priority: {t.priority} | Category: {t.category}</span>
                            {t.status !== 'resolved' && <button onClick={async () => { await usersAPI.resolveSupportTicket(t.id).catch(() => {}); toast.success('Ticket resolved'); }} className="text-xs text-indigo-400">Mark Resolved</button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No support tickets.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-2xl space-y-6">
                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Subscription</h2>
                  {mySub && mySub.plan !== 'none' ? (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl font-bold capitalize">{mySub.plan}</span>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/30">{mySub.status}</span>
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>Bandwidth: {mySub.bandwidth_gb} GB / month</p>
                        <p>Devices: {mySub.devices_limit}</p>
                        <p>Speed: {mySub.speed_limit_mbps} Mbps</p>
                        {mySub.expires_at && <p>Expires: {new Date(mySub.expires_at).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-400 mb-4">You're on the Free plan. Upgrade for more bandwidth and features.</p>
                      {plans && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {Object.entries(plans).filter(([k]) => k !== 'free').map(([name, info]: [string, any]) => (
                            <div key={name} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:border-indigo-500/50 transition">
                              <div className="font-semibold capitalize mb-1">{name}</div>
                              <div className="text-xl font-bold text-indigo-400">${info.price}<span className="text-xs text-gray-500">/mo</span></div>
                              <div className="text-xs text-gray-400 mt-2">{info.bandwidth_gb} GB</div>
                              <div className="text-xs text-gray-400">{info.devices} devices</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Connection Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Default Protocol</div>
                        <div className="text-xs text-gray-500">Protocol used for new connections</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={activeProtocol}
                          onChange={(e) => setActiveProtocol(e.target.value)}
                          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                        >
                          <option value="http">HTTP Proxy</option>
                          <option value="socks5">SOCKS5</option>
                          <option value="wireguard">WireGuard</option>
                          <option value="ws">WebSocket Tunnel</option>
                        </select>
                        {recProtocol && (
                          <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-full whitespace-nowrap">
                            {recProtocol.protocol.toUpperCase()} rec.
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Default Server</div>
                        <div className="text-xs text-gray-500">Leave as Auto for best performance</div>
                      </div>
                      <select
                        value={selectedServer?.id || ''}
                        onChange={(e) => {
                          const srv = servers.find(s => s.id === Number(e.target.value));
                          setSelectedServer(srv || null);
                        }}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                      >
                        <option value="">Auto-select</option>
                        {servers.map((s) => (
                          <option key={s.id} value={s.id}>{s.country} - {s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Kill Switch</div>
                        <div className="text-xs text-gray-500">Block all traffic if VPN disconnects</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={killSwitch} onChange={(e) => setKillSwitch(e.target.checked)} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">DNS Leak Protection</div>
                        <div className="text-xs text-gray-500">Force DNS through VPN tunnel</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={dnsProtection} onChange={(e) => setDnsProtection(e.target.checked)} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Auto-Connect on Untrusted WiFi</div>
                        <div className="text-xs text-gray-500">Auto-connect VPN when joining open/public networks</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={autoConnect} onChange={(e) => setAutoConnect(e.target.checked)} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Ad & Tracker Blocking</div>
                        <div className="text-xs text-gray-500">Block ads and trackers at DNS level</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={adBlocking} onChange={async (e) => { setAdBlocking(e.target.checked); await usersAPI.setAdBlocking(e.target.checked).catch(() => {}); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">LAN Access While Connected</div>
                        <div className="text-xs text-gray-500">Allow access to local network devices while VPN is on</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={lanAccess} onChange={async (e) => { setLanAccess(e.target.checked); await usersAPI.setLanAccess(e.target.checked).catch(() => {}); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Bandwidth Usage Alert</div>
                        <div className="text-xs text-gray-500">Notify when usage reaches this percentage</div>
                      </div>
                      <select
                        value={bandwidthAlertPct}
                        onChange={async (e) => { const v = Number(e.target.value); setBandwidthAlertPct(v); await usersAPI.setBandwidthAlert(v).catch(() => {}); }}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none"
                      >
                        <option value={50}>50%</option>
                        <option value={75}>75%</option>
                        <option value={80}>80%</option>
                        <option value={90}>90%</option>
                        <option value={95}>95%</option>
                        <option value={100}>100%</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Multi-Hop (Double VPN)</div>
                        <div className="text-xs text-gray-500">Route through two servers for extra privacy</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={multiHopEnabled} onChange={async (e) => { setMultiHopEnabled(e.target.checked); await usersAPI.setMultiHop({ enabled: e.target.checked }).catch(() => {}); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Security & Advanced</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Two-Factor Authentication (TOTP)</div>
                        <div className="text-xs text-gray-500">{totpStatus?.enabled ? 'Enabled' : 'Disabled'}</div>
                      </div>
                      {!totpStatus?.enabled ? (
                        <button
                          onClick={async () => { const res = await usersAPI.totpSetup().catch(() => null); if (res?.data) setTotpSetupData(res.data); }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs transition"
                        >
                          Setup 2FA
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-400">Active</span>
                      )}
                    </div>
                    {totpSetupData && !totpStatus?.enabled && (
                      <div className="bg-white/5 rounded-xl p-4 border border-indigo-500/30 space-y-3">
                        <p className="text-xs text-gray-400">Scan this QR code with Google Authenticator or enter the secret manually:</p>
                        <div className="text-xs font-mono bg-gray-800 p-2 rounded break-all">{totpSetupData.secret}</div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text" value={totpCode} onChange={(e) => setTotpCode(e.target.value)}
                            placeholder="Enter 6-digit code" maxLength={6}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={async () => { const res = await usersAPI.totpVerify(totpCode).catch(() => null); if (res?.data) { setTotpStatus({ enabled: res.data.enabled, has_secret: true }); setTotpSetupData(null); setTotpCode(''); toast.success('2FA enabled'); } else { toast.error('Invalid code'); } }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs transition"
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Custom DNS Servers</div>
                        <div className="text-xs text-gray-500">{dnsServers.join(', ')}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text" value={dnsInput} onChange={(e) => setDnsInput(e.target.value)}
                          placeholder="Add DNS..." className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white w-28 outline-none"
                        />
                        <button
                          onClick={async () => { if (!dnsInput.trim()) return; const newDns = [...dnsServers, dnsInput.trim()]; setDnsServers(newDns); setDnsInput(''); await usersAPI.setDns(newDns).catch(() => {}); }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1.5 rounded-lg text-xs transition"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">IPv6 Leak Protection</div>
                        <div className="text-xs text-gray-500">Block IPv6 traffic to prevent leaks</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={ipv6Leak} onChange={async (e) => { setIpv6Leak(e.target.checked); await usersAPI.setIpv6Leak(e.target.checked).catch(() => {}); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Port Forwarding</div>
                        <div className="text-xs text-gray-500">Allow inbound connections through VPN</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={portForwarding} onChange={async (e) => { setPortForwarding(e.target.checked); await usersAPI.setPortForwarding(e.target.checked).catch(() => {}); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Auto-Failover on Disconnect</div>
                        <div className="text-xs text-gray-500">Automatically reconnect to next best server</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={autoFailover} onChange={async (e) => { setAutoFailover(e.target.checked); await usersAPI.setAutoFailover(e.target.checked).catch(() => {}); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Split Tunneling / Bypass Rules</h2>
                  <p className="text-xs text-gray-500 mb-4">Route specific apps or traffic outside the VPN tunnel.</p>
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="text"
                      value={newRuleApp}
                      onChange={(e) => setNewRuleApp(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addBypassRule()}
                      placeholder="App name, IP range, or domain..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={addBypassRule}
                      disabled={!newRuleApp.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm transition flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add
                    </button>
                  </div>
                  {bypassRules.length > 0 ? (
                    <div className="space-y-2">
                      {bypassRules.map((rule: any) => (
                        <div key={rule.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/5">
                          <div className="flex items-center gap-3">
                            <Layers className="h-4 w-4 text-amber-400" />
                            <span className="text-sm">{rule.app_name || rule.domain || rule.ip_range}</span>
                          </div>
                          <button
                            onClick={() => removeBypassRule(rule.id)}
                            className="text-red-400 hover:text-red-300 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No bypass rules configured. Traffic routes through the VPN tunnel.</p>
                  )}
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4 text-red-400">Danger Zone</h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={triggerPanic}
                      disabled={panicking}
                      className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {panicking ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                      {panicking ? 'Shutting Down...' : 'Emergency Panic'}
                    </button>
                    <button
                      onClick={logout}
                      className="bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 border border-gray-500/20 px-4 py-2 rounded-lg text-sm font-semibold transition"
                    >
                      Sign Out
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={async () => { setKsTesting(true); const res = await usersAPI.killSwitchTest().catch(() => null); if (res?.data) setKsTestResult(res.data); setKsTesting(false); }}
                      disabled={ksTesting}
                      className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/20 px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {ksTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                      {ksTesting ? 'Testing...' : 'Test Kill Switch'}
                    </button>
                  </div>
                  {ksTestResult && (
                    <div className={`mt-3 p-3 rounded-xl text-sm ${ksTestResult.passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {ksTestResult.message}
                    </div>
                  )}
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Stealth & Obfuscation</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Stealth Mode</div>
                        <div className="text-xs text-gray-500">Disguise VPN traffic as regular HTTPS</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={stealthEnabled} onChange={async (e) => { setStealthEnabled(e.target.checked); await usersAPI.setStealth({ enabled: e.target.checked, method: stealthMethod }).catch(() => {}); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                    {stealthEnabled && (
                      <div className="ml-4">
                        <label className="text-xs text-gray-500 mb-1">Obfuscation Method</label>
                        <select value={stealthMethod} onChange={async (e) => { setStealthMethod(e.target.value); await usersAPI.setStealth({ enabled: true, method: e.target.value }).catch(() => {}); }} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none w-full">
                          <option value="tls">TLS (HTTPS disguise)</option>
                          <option value="noise">Noise Protocol</option>
                          <option value="shadow">Shadow Protocol</option>
                          <option value="wss">WebSocket Secure (WSS)</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Appearance</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Theme</div>
                      <div className="text-xs text-gray-500">Dashboard color scheme</div>
                    </div>
                    <select value={theme} onChange={async (e) => { setTheme(e.target.value); await usersAPI.setTheme(e.target.value).catch(() => {}); }} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none">
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="midnight">Midnight Blue</option>
                      <option value="emerald">Emerald</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Promo Code</h2>
                  <div className="flex items-center gap-2">
                    <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="Enter promo code..." className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none uppercase" />
                    <button onClick={async () => { if (!promoCode.trim()) return; try { const res = await usersAPI.redeemPromo(promoCode.trim()); toast.success(res.data.message); setPromoCode(''); } catch { toast.error('Invalid or expired code'); } }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs transition">Redeem</button>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Organizations / Teams</h2>
                  {orgs.length > 0 ? (
                    <div className="space-y-3">
                      {orgs.map((o: any) => (
                        <div key={o.id} className="bg-white/5 rounded-xl p-3 border border-white/5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">{o.name}</span>
                            <span className="text-xs text-gray-500">{o.tier} - {o.member_limit} members</span>
                          </div>
                          <button onClick={async () => { const res = await usersAPI.getOrgMembers(o.id).catch(() => null); if (res?.data) setOrgMembers(res.data); }} className="text-xs text-indigo-400">View members</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm mb-3">No teams yet. Create one to collaborate.</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <input type="text" value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} placeholder="Team name..." className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                    <button onClick={async () => { if (!newOrgName.trim()) return; const res = await usersAPI.createOrganization(newOrgName.trim()).catch(() => null); if (res?.data) { setOrgs([...orgs, res.data]); setNewOrgName(''); toast.success('Team created'); } }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs transition">Create</button>
                  </div>
                  {orgMembers.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="text-xs text-gray-500 font-medium">Members</div>
                      {orgMembers.map((m: any) => (
                        <div key={m.user_id} className="flex items-center justify-between bg-white/5 rounded-xl p-2 border border-white/5 text-sm">
                          <span>{m.username || m.email}</span>
                          <span className="text-xs text-gray-500">{m.role}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 mt-2">
                        <input type="text" value={orgInviteEmail} onChange={(e) => setOrgInviteEmail(e.target.value)} placeholder="Invite by email..." className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none" />
                        <button onClick={async () => { if (!orgInviteEmail.trim() || !orgs[0]) return; await usersAPI.inviteToOrg(orgs[0].id, orgInviteEmail.trim()).catch(() => {}); toast.success('Invited'); setOrgInviteEmail(''); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1.5 rounded-lg text-xs transition">Invite</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Connection Schedule</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Scheduled Connection</div>
                        <div className="text-xs text-gray-500">Auto-connect/disconnect on a timer</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={scheduleEnabled} onChange={async (e) => { setScheduleEnabled(e.target.checked); await usersAPI.setSchedule({ enabled: e.target.checked, start: scheduleStart, end: scheduleEnd, days: scheduleDays }).catch(() => {}); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                    {scheduleEnabled && (
                      <div className="flex items-center gap-3 ml-4">
                        <div>
                          <label className="text-xs text-gray-500">Start</label>
                          <input type="time" value={scheduleStart} onChange={async (e) => { setScheduleStart(e.target.value); await usersAPI.setSchedule({ enabled: true, start: e.target.value, end: scheduleEnd, days: scheduleDays }).catch(() => {}); }} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">End</label>
                          <input type="time" value={scheduleEnd} onChange={async (e) => { setScheduleEnd(e.target.value); await usersAPI.setSchedule({ enabled: true, start: scheduleStart, end: e.target.value, days: scheduleDays }).catch(() => {}); }} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Webhook & Notifications</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-1">Webhook URL</div>
                      <div className="flex items-center gap-2">
                        <input type="text" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://hooks.example.com/event" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                        <button onClick={async () => { await usersAPI.setWebhook(webhookUrl).catch(() => {}); toast.success('Webhook saved'); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs transition">Save</button>
                        <button onClick={async () => { const res = await usersAPI.testWebhook().catch(() => null); toast(res?.data?.message || 'Test sent'); }} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-xs transition">Test</button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Receives POST events on connect/disconnect</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Email Notifications</div>
                        <div className="text-xs text-gray-500">Receive usage alerts and updates via email</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={notifyEmail} onChange={async (e) => { setNotifyEmail(e.target.checked); await usersAPI.setNotifications({ email: e.target.checked }).catch(() => {}); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Push Notifications</div>
                        <div className="text-xs text-gray-500">Browser push notifications for events</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={notifyPush} onChange={async (e) => { setNotifyPush(e.target.checked); await usersAPI.setNotifications({ push: e.target.checked }).catch(() => {}); }} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">API Keys</h2>
                  <p className="text-xs text-gray-500 mb-3">Keys for programmatic access to the VPN API</p>
                  <div className="flex items-center gap-2 mb-3">
                    <input type="text" value={newApiKeyName} onChange={(e) => setNewApiKeyName(e.target.value)} placeholder="Key name..." className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                    <button onClick={async () => { if (!newApiKeyName.trim()) return; const res = await usersAPI.createApiKey(newApiKeyName.trim()).catch(() => null); if (res?.data) { setCreatedKey(res.data.key); setApiKeys([...apiKeys, { id: res.data.id, name: res.data.name, prefix: res.data.prefix }]); setNewApiKeyName(''); } }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs transition">Create</button>
                  </div>
                  {createdKey && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-3">
                      <p className="text-xs text-amber-400 font-bold mb-1">Save this key - it won't be shown again!</p>
                      <code className="text-sm text-white break-all">{createdKey}</code>
                      <button onClick={() => { navigator.clipboard.writeText(createdKey); toast.success('Copied'); }} className="text-xs text-indigo-400 ml-2">Copy</button>
                    </div>
                  )}
                  {apiKeys.length > 0 && (
                    <div className="space-y-2">
                      {apiKeys.map((k: any) => (
                        <div key={k.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/5">
                          <div>
                            <span className="text-sm font-medium">{k.name}</span>
                            <span className="text-xs text-gray-500 ml-2 font-mono">{k.prefix}...</span>
                          </div>
                          <button onClick={async () => { await usersAPI.deleteApiKey(k.id).catch(() => {}); setApiKeys(apiKeys.filter((x: any) => x.id !== k.id)); }} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="max-w-2xl space-y-6">
                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Username</label>
                      <div className="text-white font-medium">{user?.username}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Email</label>
                      <div className="text-white font-medium">{user?.email}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Full Name</label>
                      <div className="text-white font-medium">{user?.full_name || 'Not set'}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Account Tier</label>
                      <div>
                        <span className="px-2 py-0.5 bg-indigo-600/20 text-indigo-400 text-sm rounded-full border border-indigo-500/30 capitalize">
                          {user?.tier || 'free'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Referral Code</label>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-indigo-400">{referralCode || '-'}</code>
                        {referralCode && <button onClick={() => { navigator.clipboard.writeText(referralCode); toast.success('Copied'); }} className="text-xs text-indigo-400">Copy</button>}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Referral Reward</label>
                      <div className="text-amber-400 font-semibold">{referralReward} GB bonus</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Claim Referral</h2>
                  <p className="text-xs text-gray-500 mb-3">Enter someone's referral code to earn bonus bandwidth</p>
                  <div className="flex items-center gap-2">
                    <input type="text" value={claimCode} onChange={(e) => setClaimCode(e.target.value)} placeholder="Enter referral code..." className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none" maxLength={10} />
                    <button onClick={async () => { if (!claimCode.trim()) return; try { const res = await usersAPI.claimReferral(claimCode.trim()); toast.success(res.data.message); setClaimCode(''); } catch { toast.error('Invalid code'); } }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs transition">Claim</button>
                  </div>
                  {referrals.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="text-xs text-gray-500 font-medium">Your Referrals</div>
                      {referrals.map((r: any) => (
                        <div key={r.id} className="flex items-center justify-between bg-white/5 rounded-xl p-2.5 border border-white/5 text-sm">
                          <span className="text-gray-400">{r.email}</span>
                          <span className={`text-xs ${r.status === 'claimed' ? 'text-emerald-400' : 'text-amber-400'}`}>{r.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Login Activity</h2>
                  {activityLog.length > 0 ? (
                    <div className="space-y-2">
                      {activityLog.slice(0, 15).map((log: any) => (
                        <div key={log.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/5">
                          <div className="flex items-center gap-3 text-sm">
                            <div className={`w-2 h-2 rounded-full ${log.success ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            <span className="text-gray-300">{log.ip_address || 'Unknown IP'}</span>
                            <span className="text-gray-500">{log.device || log.user_agent?.slice(0, 40) || 'Unknown device'}</span>
                          </div>
                          <span className="text-xs text-gray-500">{log.created_at ? new Date(log.created_at).toLocaleString() : ''}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No login activity recorded yet.</p>
                  )}
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Active Sessions</h2>
                    <button onClick={async () => { await usersAPI.revokeAllSessions().catch(() => {}); setActiveSessions([]); toast.success('All other sessions revoked'); }} className="text-xs text-red-400 hover:text-red-300 transition">Revoke all</button>
                  </div>
                  {activeSessions.length > 0 ? (
                    <div className="space-y-2">
                      {activeSessions.map((s: any) => (
                        <div key={s.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/5 text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-gray-300">{s.ip_address || 'Unknown IP'}</span>
                            <span className="text-xs text-gray-500">{s.device || 'Unknown device'}</span>
                            <span className="text-xs text-gray-500">{s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}</span>
                          </div>
                          <button onClick={async () => { await usersAPI.revokeSession(s.id).catch(() => {}); setActiveSessions(activeSessions.filter((x: any) => x.id !== s.id)); }} className="text-red-400 hover:text-red-300"><X className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No active sessions found.</p>
                  )}
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">GDPR Data Export</h2>
                    <button
                      onClick={async () => { setExportingGDPR(true); try { const res = await usersAPI.gdprExport(); const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'securevpn-gdpr-export.json'; a.click(); URL.revokeObjectURL(url); toast.success('GDPR data exported'); } catch { toast.error('Export failed'); } finally { setExportingGDPR(false); } }}
                      disabled={exportingGDPR}
                      className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-4 py-2 rounded-lg text-sm transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {exportingGDPR ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      {exportingGDPR ? 'Exporting...' : 'Export All Data'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">Download all your personal data in JSON format (GDPR compliance).</p>
                  <button
                    onClick={async () => { if (!window.confirm('Are you sure? This action cannot be undone. All your data will be permanently deleted.')) return; await usersAPI.deleteAccount().catch(() => {}); toast.success('Account deleted'); window.location.reload(); }}
                    className="text-red-500 hover:text-red-400 text-xs transition underline"
                  >
                    Delete my account permanently
                  </button>
                </div>
              </div>
            )}

            {qrData && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setQrData(null)}>
                <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-lg font-semibold mb-2">WireGuard QR - {qrData.server}</h3>
                  <p className="text-xs text-gray-500 mb-4">Scan with the WireGuard mobile app</p>
                  {qrData.qr_base64 ? (
                    <img src={`data:image/png;base64,${qrData.qr_base64}`} alt="WireGuard QR" className="w-64 h-64 mx-auto" />
                  ) : (
                    <pre className="text-xs bg-gray-800 p-3 rounded overflow-auto max-h-48">{qrData.config}</pre>
                  )}
                  <button onClick={() => setQrData(null)} className="mt-4 w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm transition">Close</button>
                </div>
              </div>
            )}

            {/* Quick Actions Floating Toolbar */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
              <button onClick={() => setConnected(!connected)} title={connected ? 'Disconnect' : 'Connect'} className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition hover:scale-110 ${connected ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                {connected ? <WifiOff className="h-5 w-5" /> : <Wifi className="h-5 w-5" />}
              </button>
              <button onClick={() => setActiveTab('servers')} title="Servers" className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg transition hover:scale-110">
                <Globe className="h-5 w-5" />
              </button>
              <button onClick={async () => { setSpeedTesting(true); const res = await usersAPI.speedTest().catch(() => null); if (res?.data) setSpeedTestResult(res.data); setSpeedTesting(false); }} title="Speed Test" className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-lg transition hover:scale-110">
                {speedTesting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
              </button>
              <button onClick={() => setActiveTab('profile')} title="Profile" className="w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center shadow-lg transition hover:scale-110">
                <User className="h-5 w-5" />
              </button>
            </div>

            {/* Notifications Bell */}
            <button onClick={() => setActiveTab('settings')} title={`${notifCount} unread`} className="fixed top-6 right-6 z-40 relative">
              <div className="w-10 h-10 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center hover:bg-gray-700 transition">
                <Bell className="h-5 w-5 text-gray-400" />
                {notifCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">{notifCount}</span>}
              </div>
            </button>
          </>
        )}
      </main>
    </div>
  );
}
