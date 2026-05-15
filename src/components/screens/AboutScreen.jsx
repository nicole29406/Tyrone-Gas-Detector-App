import { Github, ExternalLink, Cpu, Mail } from "lucide-react";
import Card from "../ui/Card";

export default function AboutScreen() {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-5 bg-slate-950">
      <Card className="text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-500/15 ring-1 ring-brand-500/40 flex items-center justify-center mb-3">
          <Cpu size={28} className="text-brand-300" />
        </div>
        <div className="text-[10px] tracking-[0.3em] text-brand-300 font-bold">
          JKC
        </div>
        <div className="text-xl font-extrabold tracking-wider text-slate-100">
          GAS DETECTOR
        </div>
        <div className="text-[12px] text-slate-400 mt-1">
          Gas Leakage Detection & Alert System
        </div>
        <div className="text-[10px] text-slate-500 mt-3">Version 0.4.0</div>
      </Card>

      <Card padded={false} className="mt-4 divide-y divide-slate-800 overflow-hidden">
        <a
          href="https://github.com/nicole29406/Tyrone-Gas-Detector-App"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-800/60"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
            <Github size={17} className="text-slate-200" />
          </div>
          <div className="flex-1 text-sm font-semibold text-slate-100">
            Source on GitHub
          </div>
          <ExternalLink size={14} className="text-slate-500" />
        </a>
        <a
          href="mailto:mudzvitinicky@gmail.com"
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-800/60"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-500/15 flex items-center justify-center">
            <Mail size={17} className="text-brand-300" />
          </div>
          <div className="flex-1 text-sm font-semibold text-slate-100">
            Contact developer
          </div>
          <ExternalLink size={14} className="text-slate-500" />
        </a>
      </Card>

      <div className="mt-4 px-3 text-[11px] text-slate-500 leading-relaxed">
        <p>
          JKC GAS DETECTOR is a mobile-first gas leak detection and alert system.
          Live readings are simulated in this build; pair a real Bluetooth gas
          sensor (e.g. MQ-series module on an ESP32) for production use.
        </p>
        <p className="mt-2">
          Real SMS alerts are sent through a Cloudflare Worker that proxies to
          Twilio. No sensitive credentials live in the frontend bundle.
        </p>
      </div>
    </div>
  );
}
