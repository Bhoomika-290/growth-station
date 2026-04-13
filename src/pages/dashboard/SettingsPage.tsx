import { Bell, Shield, User, Globe } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Settings</h1>
      {[
        { icon: User, title: 'Account', desc: 'Update your name, email, and password' },
        { icon: Bell, title: 'Notifications', desc: 'Daily reminders, weekly reports, rank updates' },
        { icon: Globe, title: 'Language & Region', desc: 'Preferred language and locality settings' },
        { icon: Shield, title: 'Privacy', desc: 'Manage data visibility and profile sharing' },
      ].map((s) => (
        <div key={s.title} className="bg-card rounded-xl border border-border p-5 flex items-center gap-4 cursor-pointer hover:border-accent/50 transition-all">
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <s.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-sm">{s.title}</p>
            <p className="text-xs text-muted-foreground">{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
