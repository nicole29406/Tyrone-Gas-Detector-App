import { useEffect, useRef, useState } from "react";
import PhoneFrame from "./components/PhoneFrame";
import AppHeader from "./components/ui/AppHeader";
import BottomNav from "./components/BottomNav";
import SensorPairScreen from "./components/SensorPairScreen";
import AlarmOverlay from "./components/AlarmOverlay";
import SmsEscalation from "./components/SmsEscalation";
import AuthScreen from "./components/AuthScreen";

import DashboardScreen from "./components/screens/DashboardScreen";
import AlertsScreen from "./components/screens/AlertsScreen";
import HistoryScreen from "./components/screens/HistoryScreen";
import ProfileScreen from "./components/screens/ProfileScreen";
import ChatbotScreen from "./components/screens/ChatbotScreen";
import PersonalInfoScreen from "./components/screens/PersonalInfoScreen";
import NotificationPrefsScreen from "./components/screens/NotificationPrefsScreen";
import EmergencyContactsScreen from "./components/screens/EmergencyContactsScreen";
import SecurityScreen from "./components/screens/SecurityScreen";
import SystemSettingsScreen from "./components/screens/SystemSettingsScreen";
import AboutScreen from "./components/screens/AboutScreen";

import {
  STATUS,
  nextLiveReading,
  nextTemperature,
  randomGas,
  randomScanPpm,
  statusForReading,
} from "./lib/simulator";
import { startAlarm, stopAlarm } from "./lib/audio";
import {
  DEFAULT_ACCOUNT_SETTINGS,
  saveSession,
  updateAccount,
} from "./lib/auth";

const ALARM_LOG_COOLDOWN_MS = 8000;

// Maps each screen to which bottom-tab should appear active when on it.
const SCREEN_TO_TAB = {
  home: "home",
  alerts: "alerts",
  history: "history",
  profile: "profile",
  chatbot: "home",
  // Profile sub-screens
  "personal-info": "profile",
  "notification-prefs": "profile",
  "emergency-contacts": "profile",
  security: "profile",
  "system-settings": "profile",
  about: "profile",
};

// Where "back" navigates to from each sub-screen.
const BACK_TARGET = {
  alerts: "home",
  history: "home",
  profile: "home",
  chatbot: "home",
  "personal-info": "profile",
  "notification-prefs": "profile",
  "emergency-contacts": "profile",
  security: "profile",
  "system-settings": "profile",
  about: "profile",
};

const TITLE_FOR = {
  alerts: "Notifications",
  history: "History",
  profile: "Profile",
  chatbot: "Chatbot",
  "personal-info": "Personal Information",
  "notification-prefs": "Notification Preferences",
  "emergency-contacts": "Emergency Contacts",
  security: "Security",
  "system-settings": "System Settings",
  about: "About",
};

export default function App() {
  // ----- auth -----
  // Always start signed-out. Even though a session may be persisted in
  // localStorage from a previous run, we deliberately ignore it so every
  // app launch returns the user to the login screen — a more secure default.
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  // One-time cleanup: drop any stale session token from a previous run.
  useEffect(() => {
    saveSession(null);
  }, []);

  // ----- per-account state (persisted) -----
  const [settings, setSettings] = useState(
    () => user?.settings || { ...DEFAULT_ACCOUNT_SETTINGS }
  );
  const [alertLog, setAlertLog] = useState(() => user?.alertLog || []);

  // ----- volatile state -----
  const [screen, setScreen] = useState("home");
  const [sensorPairOpen, setSensorPairOpen] = useState(false);
  const [connectedSensor, setConnectedSensor] = useState(null);

  const [liveReading, setLiveReading] = useState(0);
  const [temperature, setTemperature] = useState(27);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [lastGas, setLastGas] = useState(randomGas());

  const [alarmActive, setAlarmActive] = useState(false);
  const [escalationActive, setEscalationActive] = useState(false);
  const lastAlarmLogRef = useRef(0);

  // Reset on user switch
  useEffect(() => {
    setSettings(user?.settings || { ...DEFAULT_ACCOUNT_SETTINGS });
    setAlertLog(user?.alertLog || []);
    setLiveReading(0);
    setTemperature(27);
    setLastUpdated(Date.now());
    setAlarmActive(false);
    setEscalationActive(false);
    setConnectedSensor(null);
    setScreen("home");
  }, [user?.id]);

  // Persist settings + alertLog into the user's account whenever they change
  useEffect(() => {
    if (!user) return;
    updateAccount(user.id, { settings, alertLog });
  }, [settings, alertLog, user?.id]);

  // Reset live readings to zero whenever the sensor disconnects (or is not
  // yet paired). Without a sensor the dashboard shows 0 PPM + "Pair sensor".
  useEffect(() => {
    if (!connectedSensor) {
      setLiveReading(0);
      setAlarmActive(false);
      setEscalationActive(false);
      stopAlarm();
    } else {
      setLastUpdated(Date.now());
    }
  }, [connectedSensor]);

  // Live monitoring loop. Only runs when a sensor is paired — matching the
  // real-world behavior of the app (no sensor → no readings).
  useEffect(() => {
    if (!user || !connectedSensor) return;
    const id = setInterval(() => {
      setLiveReading((prev) => {
        const next = nextLiveReading(prev);
        setLastUpdated(Date.now());
        const status = statusForReading(next, settings.threshold);
        if (status === STATUS.DANGER) {
          setAlarmActive(true);
          const now = Date.now();
          if (now - lastAlarmLogRef.current > ALARM_LOG_COOLDOWN_MS) {
            lastAlarmLogRef.current = now;
            const gas = lastGas;
            setAlertLog((log) => [
              ...log,
              {
                id: now,
                datetime: now,
                gas,
                peak: next,
                status: STATUS.DANGER,
                message: "High gas level detected!",
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
      setTemperature((t) => nextTemperature(t));
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, connectedSensor?.id, settings.threshold, settings.vibrationOn]);

  // Periodically pick a fresh "last detected gas" candidate so the log entries
  // aren't all the same gas. Cheap — once a minute.
  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => setLastGas(randomGas()), 60000);
    return () => clearInterval(id);
  }, [user?.id]);

  // Audio
  useEffect(() => {
    if (alarmActive && settings.soundOn) startAlarm();
    else stopAlarm();
    return () => stopAlarm();
  }, [alarmActive, settings.soundOn]);

  // Auto-clear alarm when reading returns to SAFE
  useEffect(() => {
    if (!alarmActive) return;
    const status = statusForReading(liveReading, settings.threshold);
    if (status === STATUS.SAFE) setAlarmActive(false);
  }, [liveReading, settings.threshold, alarmActive]);

  // SMS escalation only triggers when a sensor is paired
  useEffect(() => {
    if (alarmActive && connectedSensor && !escalationActive) {
      setEscalationActive(true);
    }
    if (!alarmActive && escalationActive) {
      setEscalationActive(false);
    }
  }, [alarmActive, connectedSensor, escalationActive]);

  // ----- handlers -----
  const clearAlertLog = () => setAlertLog([]);
  const activeTab = SCREEN_TO_TAB[screen] || "home";

  const handleQuickAction = (action) => {
    if (action === "history") setScreen("history");
    else if (action === "tips" || action === "chatbot") setScreen("chatbot");
  };

  const handleLogout = () => {
    saveSession(null);
    setUser(null);
    setShowAuth(false);
  };

  const goBack = () => {
    const target = BACK_TARGET[screen];
    if (target) setScreen(target);
  };

  const firstName = user?.fullName?.split(" ")[0] || "User";
  const unseenAlerts = alertLog.length;

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

  // ----- header props per screen -----
  const headerProps =
    screen === "home"
      ? {
          variant: "dashboard",
          greeting: `Hello, ${firstName}`,
          subtitle: connectedSensor
            ? "System is monitoring"
            : "Sensor not connected",
          onMenu: () => setScreen("profile"),
          onBell: () => setScreen("alerts"),
          bellBadge: unseenAlerts,
        }
      : {
          variant: "title",
          title: TITLE_FOR[screen] || "",
          onBack: goBack,
        };

  return (
    <PhoneFrame darkMode={settings.darkMode}>
      <AppHeader {...headerProps} />

      <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-50">
        {screen === "home" && (
          <DashboardScreen
            liveReading={liveReading}
            threshold={settings.threshold}
            units={settings.units}
            temperature={temperature}
            lastUpdated={lastUpdated}
            connectedSensor={connectedSensor}
            onQuickAction={handleQuickAction}
            onPairSensor={() => setSensorPairOpen(true)}
          />
        )}
        {screen === "alerts" && (
          <AlertsScreen alertLog={alertLog} clearAlertLog={clearAlertLog} />
        )}
        {screen === "history" && (
          <HistoryScreen
            alertLog={alertLog}
            threshold={settings.threshold}
            clearAlertLog={clearAlertLog}
          />
        )}
        {screen === "profile" && (
          <ProfileScreen
            user={user}
            onNavigate={(sub) => setScreen(sub)}
            onLogout={handleLogout}
          />
        )}
        {screen === "chatbot" && <ChatbotScreen />}

        {screen === "personal-info" && (
          <PersonalInfoScreen user={user} onUpdate={setUser} />
        )}
        {screen === "notification-prefs" && (
          <NotificationPrefsScreen
            settings={settings}
            setSettings={setSettings}
          />
        )}
        {screen === "emergency-contacts" && (
          <EmergencyContactsScreen
            settings={settings}
            setSettings={setSettings}
            user={user}
          />
        )}
        {screen === "security" && (
          <SecurityScreen user={user} onUpdate={setUser} />
        )}
        {screen === "system-settings" && (
          <SystemSettingsScreen
            settings={settings}
            setSettings={setSettings}
            connectedSensor={connectedSensor}
            onOpenSensorPair={() => setSensorPairOpen(true)}
          />
        )}
        {screen === "about" && <AboutScreen />}

        {alarmActive && (
          <AlarmOverlay
            ppm={liveReading}
            units={settings.units}
            gas={lastGas}
            emergencyContact={settings.emergencyContact}
            onSilence={() => {
              setAlarmActive(false);
              setEscalationActive(false);
            }}
          />
        )}

        <SmsEscalation
          active={escalationActive}
          user={user}
          additionalContacts={settings.additionalContacts || []}
          gas={lastGas}
          ppm={liveReading}
          onAcknowledge={() => setEscalationActive(false)}
        />
      </main>

      <BottomNav
        activeTab={activeTab}
        onChange={(tab) => setScreen(tab)}
        alertBadge={unseenAlerts}
      />

      <SensorPairScreen
        open={sensorPairOpen}
        onClose={() => setSensorPairOpen(false)}
        connectedSensor={connectedSensor}
        onConnect={(device) => {
          setConnectedSensor(device);
          setSensorPairOpen(false);
          // Log an INFO event so it shows in Alerts
          const now = Date.now();
          setAlertLog((log) => [
            ...log,
            {
              id: now,
              datetime: now,
              status: STATUS.INFO,
              message: `${device.name} connected`,
              source: "System",
            },
          ]);
        }}
        darkMode={settings.darkMode}
      />
    </PhoneFrame>
  );
}
