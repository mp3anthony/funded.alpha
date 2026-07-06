"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Bell, Settings as SettingsIcon, CheckCircle, Clock, AlertTriangle, Circle } from "lucide-react";
import { useApp, type Notification, type NotificationSettings } from "@/context/AppContext";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { bills, markAsPaid, notifications, notificationSettings, markNotificationRead, updateNotificationSettings } = useApp();
  const [activeTab, setActiveTab] = useState<"list" | "settings">("list");

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add("modal-open");
    return () => {
      const activeModals = document.querySelectorAll(".modal-backdrop");
      if (activeModals.length <= 1) {
        document.body.classList.remove("modal-open");
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleSetting = async (key: keyof NotificationSettings) => {
    if (!notificationSettings) return;
    const currentVal = notificationSettings[key];
    if (typeof currentVal === 'boolean') {
      await updateNotificationSettings({ [key]: !currentVal });
    }
  };

  const handleUpdateDays = async (key: keyof NotificationSettings, change: number) => {
    if (!notificationSettings) return;
    const currentVal = (notificationSettings[key] as number) || 0;
    const newVal = Math.max(0, currentVal + change);
    await updateNotificationSettings({ [key]: newVal });
  };

  const handleMarkAsPaid = async (notif: Notification) => {
    if (!notif.related_entity_id) return;
    const bill = bills.find(b => b.id.toString() === notif.related_entity_id);
    if (bill) {
      await markAsPaid(bill);
    }
    await markNotificationRead(notif.id);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'manual_bill': return <Clock size={20} className="text-amber-500" />;
      case 'auto_pay': return <AlertTriangle size={20} className="text-rose-500" />;
      case 'lodge_payment': return <CheckCircle size={20} className="text-primary" />;
      default: return <Bell size={20} className="text-muted" />;
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center p-4 bg-foreground/20 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-md max-h-[90dvh] bg-surface border border-border rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-250">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex flex-col border-b border-border bg-surface/90 px-6 py-4 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne text-xl font-bold text-foreground flex items-center gap-2">
              <Bell size={20} /> Notifications
            </h2>
            <button 
              onClick={onClose}
              className="rounded-full p-2 text-muted hover:bg-white/5 hover:text-foreground transition-colors focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex space-x-4 border-b border-border-strong">
            <button
              className={`pb-2 px-1 text-sm font-semibold transition-colors relative ${activeTab === 'list' ? 'text-primary' : 'text-muted hover:text-foreground'}`}
              onClick={() => setActiveTab('list')}
            >
              Inbox
              {activeTab === 'list' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
            <button
              className={`pb-2 px-1 text-sm font-semibold transition-colors flex items-center gap-1 relative ${activeTab === 'settings' ? 'text-primary' : 'text-muted hover:text-foreground'}`}
              onClick={() => setActiveTab('settings')}
            >
              <SettingsIcon size={14} /> Settings
              {activeTab === 'settings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-0">
          {activeTab === "list" ? (
            <div className="divide-y divide-border">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted flex flex-col items-center gap-3">
                  <CheckCircle size={40} className="text-border" />
                  <p>You're all caught up!</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`p-4 flex gap-4 transition-colors ${notif.is_read ? 'opacity-60 bg-surface' : 'bg-surface-elevated'}`}
                  >
                    <div className="mt-1 flex-shrink-0">
                      {getIconForType(notif.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold text-foreground text-sm flex items-center justify-between">
                        {notif.title}
                        {!notif.is_read && <Circle size={8} fill="currentColor" className="text-primary" />}
                      </h4>
                      <p className="text-sm text-muted">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <div className="flex flex-col gap-2 self-start ml-2">
                        <button 
                          onClick={() => markNotificationRead(notif.id)}
                          className="p-2 text-muted hover:text-primary transition-colors flex justify-center"
                          title="Mark as read"
                        >
                          <CheckCircle size={18} />
                        </button>
                        {(notif.type === 'manual_bill' || notif.type === 'auto_pay') && (
                          <button
                            onClick={() => handleMarkAsPaid(notif)}
                            className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary/20 transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {notificationSettings ? (
                <>
                  <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl border border-border">
                    <div>
                      <h4 className="font-semibold text-foreground">Enable Notifications</h4>
                      <p className="text-sm text-muted">Master toggle for all alerts.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notificationSettings.all_enabled}
                        onChange={() => handleToggleSetting('all_enabled')}
                      />
                      <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className={`space-y-4 ${!notificationSettings.all_enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h4 className="font-syne font-semibold text-muted uppercase tracking-wider text-xs">Notification Types</h4>
                    
                    <div className="flex items-center justify-between p-3 border-b border-border-strong">
                      <div className="flex-1 pr-4">
                        <h5 className="font-medium text-sm text-foreground">Manual Bill Reminders</h5>
                        <p className="text-xs text-muted">Alerts when a manual bill is due.</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={notificationSettings.manual_bill_reminders}
                            onChange={() => handleToggleSetting('manual_bill_reminders')}
                          />
                          <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                        {notificationSettings.manual_bill_reminders && (
                          <div className="flex items-center gap-2 bg-surface rounded-lg border border-border px-2 py-1">
                            <button onClick={() => handleUpdateDays('manual_bill_reminder_days', -1)} className="text-muted hover:text-foreground w-4 flex justify-center font-bold">-</button>
                            <span className="text-xs font-mono font-bold w-12 text-center">{notificationSettings.manual_bill_reminder_days} days</span>
                            <button onClick={() => handleUpdateDays('manual_bill_reminder_days', 1)} className="text-muted hover:text-foreground w-4 flex justify-center font-bold">+</button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border-b border-border-strong">
                      <div className="flex-1 pr-4">
                        <h5 className="font-medium text-sm text-foreground">Auto-Pay Reminders</h5>
                        <p className="text-xs text-muted">Alerts for upcoming or missed auto-pay bills.</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={notificationSettings.auto_pay_reminders}
                            onChange={() => handleToggleSetting('auto_pay_reminders')}
                          />
                          <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                        {notificationSettings.auto_pay_reminders && (
                          <div className="flex items-center gap-2 bg-surface rounded-lg border border-border px-2 py-1">
                            <button onClick={() => handleUpdateDays('auto_pay_reminder_days', -1)} className="text-muted hover:text-foreground w-4 flex justify-center font-bold">-</button>
                            <span className="text-xs font-mono font-bold w-12 text-center">{notificationSettings.auto_pay_reminder_days} days</span>
                            <button onClick={() => handleUpdateDays('auto_pay_reminder_days', 1)} className="text-muted hover:text-foreground w-4 flex justify-center font-bold">+</button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3">
                      <div>
                        <h5 className="font-medium text-sm text-foreground">Lodge Payment Reminders</h5>
                        <p className="text-xs text-muted">Alerts when a scheduled payment needs confirmation.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={notificationSettings.lodge_payment_reminders}
                          onChange={() => handleToggleSetting('lodge_payment_reminders')}
                        />
                        <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">Loading settings...</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
