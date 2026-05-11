import { useEffect, useRef, useState } from "react";
import PhoneFrame from "./components/PhoneFrame";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import SensorPairScreen from "./components/SensorPairScreen";
import AlarmOverlay from "./components/AlarmOverlay";
import SmsEscalation from "./components/SmsEscalation";
import AuthScreen from "./components/AuthScreen";
import DetectorScreen from "./components/screens/DetectorScreen";
import MonitorScreen from "./components/screens/MonitorScreen";
import GuideScreen from "./components/screens/GuideScreen";
import LogScreen from "./components/screens/LogScreen";
import SettingsScreen from "./components/screens/SettingsScreen";
import { nextLiveReading, statusForReading, STATUS } from "./lib/simulator";
import { startAlarm, stopAlarm } from "./lib/audio";
import {
  DEFAULT_ACCOUNT_SETTINGS,
  getAccountById,
  loadSession,
  saveSession,
  updateAccount,
} from "./lib/auth";

const HISTORY_LEN = 60;
const ALARM_LOG_COOLDOWN_MS = 8000;

export default function App() {
  // ----- auth -----
  const [user, setUser] = useState(() => {
    const sess = loadSession();
    return sess ? getAccountById(sess.accountId) : null;
  });
  const [showAuth, setShowAuth] = useState(false); // for switching accounts while logged in

  // ----- per-account state (settings, alertLog) persists; volatile state resets per session -----
  const [settings, setSettings] = useState(
    () => user?.settings || { ...DEFAULT_ACCOUNT_SETTINGS }
  );
  const [alertLog, setAlertLog] = useState(() => user?.alertLog || []);

  // ----- volatile UI / runtime state -----
  const [activeTab, setActiveTab] = useState("detector");
  const [sensorPairOpen, setSensorPairOpen] = useState(false);
  const [connectedSensor, setConnectedSensor] = useState(null);

  const [lastScan, setLastScan] = useState(null);
  const [monitoringOn, setMonitoringOn] = useState(false);
  const [liveReading, setLiveReading] = useState(0);
  const [history, setHistory] = useState([]);
  const [alarmActive, setAlarmActive] = useState(false);
  const [escalationActive, setEscalationActive] = useState(false);
  const lastAlarmLogRef = useRef(0);

  // Reset volatile state when user changes
  useEffect(() => {
    setSettings(user?.settings || { ...DEFAULT_ACCOUNT_SETTINGS });
    setAlertLog(user?.alertLog || []);
    setLastScan(null);
    setMonitoringOn(false);
    setLiveReading(0);
    setHistory([]);
    setAlarmActive(false);
    setEscalationActive(false);
    setConnectedSensor(null);
    setActiveTab("detector");
  }, [user?.id]);

  // Persist settings + alertLog into the user's account whenever they change
  useEffect(() => {
    if (!user) return;
    updateAccount(user.id, { settings, alertLog });
  }, [settings, alertLog, user?.id]);

  // Live monitoring loop
  useEffect(() => {
    if (!monitoringOn) return;
    setHistory([liveReading]);
    const id = setInterval(() => {
      setLiveReading((prev) => {
        const next = nextLiveReading(prev);
        setHistory((h) => {
          const out = [...h, next];
          if (out.length > HISTORY_LEN) out.shift();
          return out;
        });
        const status = statusForReading(next, settings.threshold);
        if (status === STATUS.DANGER) {
          setAlarmActive(true);
          const now = Date.now();
          if (now - lastAlarmLogRef.current > ALARM_LOG_COOLDOWN_MS) {
            lastAlarmLogRef.current = now;
            setAlertLog((log) => [
              ...log,
              {
                id: now,
                datetime: now,
                gas: lastScan?.gas || "Unknown",
                peak: next,
                location: "Kitchen — Home",
                source: "Live monitoring",
              },
            ]);
            if (settings.vibrationOn && navigator.vibrate)
              navigator.vibrate([80, 60, 80, 60, 200]);
          }
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoringOn, settings.threshold, settings.vibrationOn]);

  // Drive alarm audio
  useEffect(() => {
    if (alarmActive && settings.soundOn) {
      startAlarm();
    } else {
      stopAlarm();
    }
    return () => stopAlarm();
  }, [alarmActive, settings.soundOn]);

  // Auto-clear alarm when reading returns to SAFE
  useEffect(() => {
    if (!alarmActive) return;
    const status = statusForReading(liveReading, settings.threshold);
    if (status === STATUS.SAFE) setAlarmActive(false);
  }, [liveReading, settings.threshold, alarmActive]);

  // Trigger the SMS-then-call escalation when alarm fires WITH a connected sensor.
  useEffect(() => {
    if (alarmActive && connectedSensor && !escalationActive) {
      setEscalationActive(true);
    }
    if (!alarmActive && escalationActive) {
      setEscalationActive(false);
    }
  }, [alarmActive, connectedSensor, escalationActive]);

  const appendAlertLog = (entry) => setAlertLog((log) => [...log, entry]);
  const clearAlertLog = () => setAlertLog([]);

  const toggleMonitoring = () => {
    setMonitoringOn((on) => {
      if (on) {
        setAlarmActive(false);
        setEscalationActive(false);
        stopAlarm();
      }
      return !on;
    });
  };

  const handleLogout = () => {
    saveSession(null);
    setUser(null);
    setShowAuth(false);
  };

  const handleSwitchAccount = () => {
    saveSession(null);
    setShowAuth(true);
  };

  // ----- auth gate -----
  if (!user || showAuth) {
    return (
      <AuthScreen
        onAuthed={(acc) => {
          setUser(acc);
          setShowAuth(false);
        }}
      />
    );
  }

  return (
    <PhoneFrame darkMode={settings.darkMode}>
      <Header
        darkMode={settings.darkMode}
        connectedSensor={connectedSensor}
        onOpenSensorPair={() => setSensorPairOpen(true)}
        user={user}
        onOpenSettings={() => setActiveTab("settings")}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === "detector" && (
          <DetectorScreen
            lastScan={lastScan}
            setLastScan={setLastScan}
            threshold={settings.threshold}
            units={settings.units}
            vibrationOn={settings.vibrationOn}
            appendAlertLog={appendAlertLog}
            connectedSensor={connectedSensor}
          />
        )}
        {activeTab === "monitor" && (
          <MonitorScreen
            monitoringOn={monitoringOn}
            toggleMonitoring={toggleMonitoring}
            liveReading={liveReading}
            history={history}
            threshold={settings.threshold}
            units={settings.units}
            connectedSensor={connectedSensor}
          />
        )}
        {activeTab === "guide" && <GuideScreen />}
        {activeTab === "log" && (
          <LogScreen
            alertLog={alertLog}
            threshold={settings.threshold}
            clearAlertLog={clearAlertLog}
          />
        )}
        {activeTab === "settings" && (
          <SettingsScreen
            settings={settings}
            setSettings={setSettings}
            user={user}
            onLogout={handleLogout}
            onSwitchAccount={handleSwitchAccount}
          />
        )}

        {alarmActive && (
          <AlarmOverlay
            ppm={liveReading}
            units={settings.units}
            gas={lastScan?.gas}
            emergencyContact={settings.emergencyContact}
            onSilence={() => {
              setAlarmActive(false);
              setEscalationActive(false);
            }}
          />
        )}

        {/* SMS-then-call escalation popup (only when a sensor is paired) */}
        <SmsEscalation
          active={escalationActive}
          user={user}
          gas={lastScan?.gas}
          ppm={liveReading}
          onAcknowledge={() => setEscalationActive(false)}
        />
      </main>

      <BottomNav
        activeTab={activeTab}
        onChange={setActiveTab}
        darkMode={settings.darkMode}
      />

      <SensorPairScreen
        open={sensorPairOpen}
        onClose={() => setSensorPairOpen(false)}
        connectedSensor={connectedSensor}
        onConnect={(device) => {
          setConnectedSensor(device);
          setSensorPairOpen(false);
        }}
        darkMode={settings.darkMode}
      />
    </PhoneFrame>
  );
}
