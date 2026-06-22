"use client";

import { useSession } from '@/lib/auth-client';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast'
import {
  User, Mail, Phone, MapPin, Lock, Camera,
  CheckCircle2, Eye, EyeOff, ShieldCheck, HelpCircle
} from 'lucide-react';

const API = "http://localhost:5000";

const ProfileManagePage = () => {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const router = useRouter();

  // ── Private route guard: push to sign-in once we know there's no user ──
  useEffect(() => {
    if (!isPending && !user) {
      router.push("/sign-in");
    }
  }, [isPending, user, router]);

  // ── Personal info state ────────────────────────────────────────────
  const [profile, setProfile] = useState({
    name: "",
    image: "",
    phone: "",
    address: "",
  });
  const [savingInfo, setSavingInfo] = useState(false);

  // ── Password state ─────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // ── Show session data immediately (name/image from Google login) ───
  useEffect(() => {
    if (!user) return;
    setProfile((p) => ({
      ...p,
      name:  p.name  || user.name  || "",
      image: p.image || user.image || "",
    }));
  }, [user?.name, user?.image]);

  // ── Load saved profile from backend (phone/address/overrides) ───────
  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API}/api/profile/${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) return; // not found yet, keep session defaults
        setProfile((p) => ({
          name:    data.name    || p.name    || "",
          image:   data.image   || p.image   || "",
          phone:   data.phone   || "",
          address: data.address || "",
        }));
      })
      .catch(() => toast.error("Could not load profile details."));
  }, [user?.id]);

  // ── Profile completeness (simple heuristic) ────────────────────────
  const fields = [profile.name, profile.image, profile.phone, profile.address];
  const filledCount = fields.filter((f) => f && f.trim().length > 0).length;
  const completePercent = Math.round((filledCount / fields.length) * 100);

  // ── Save personal info ──────────────────────────────────────────────
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!user?.id) return toast.error("You must be signed in.");

    setSavingInfo(true);
    try {
      const res = await fetch(`${API}/api/profile/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    profile.name,
          image:   profile.image,
          phone:   profile.phone,
          address: profile.address,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSavingInfo(false);
    }
  };

  // ── Change password ─────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword) return toast.error("Please enter your current password.");
    if (newPassword.length < 8) return toast.error("New password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return toast.error("New password and confirmation do not match.");
    if (newPassword === currentPassword) return toast.error("New password must be different from current password.");

    setSavingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        const msg =
          error.code === "INVALID_PASSWORD" ? "Current password is incorrect." :
          error.message ?? "Failed to update password.";
        toast.error(msg);
        return;
      }

      toast.success("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Loading state (also covers the moment before redirect fires) ──────
  if (isPending || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="loading loading-spinner loading-lg text-emerald-600" />
      </div>
    );
  }

  const initials = (profile.name || user.name || "?")
    .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

        {/* ══════════════════ LEFT: Profile Card ══════════════════ */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-center">
            {/* Avatar */}
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-emerald-100 flex items-center justify-center">
                {(profile.image || user.image) ? (
                  <img
                    src={profile.image || user.image}
                    alt={profile.name || user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <span className="text-2xl font-bold text-emerald-600">{initials}</span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center">
                <Camera size={12} className="text-white" />
              </div>
            </div>

            <h2 className="font-bold text-gray-900">{profile.name || user.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Buyer Account</p>

            <div className="flex items-center justify-center gap-1.5 mt-2 text-emerald-600 text-xs font-semibold">
              <CheckCircle2 size={14} />
              Verified Account
            </div>

            {/* Profile completeness */}
            <div className="mt-5 text-left">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1.5">
                <span>Profile Complete</span>
                <span>{completePercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${completePercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Help card */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-1.5">
              <HelpCircle size={16} />
              Need Help?
            </div>
            <p className="text-xs text-emerald-700/70 leading-relaxed mb-3">
              Visit our Help Center for account related queries.
            </p>
            <a href="/help" className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1">
              Go to Help Center →
            </a>
          </div>
        </div>

        {/* ══════════════════ RIGHT: Forms ══════════════════ */}
        <div className="space-y-6">

          {/* ── Personal Information ───────────────────────────── */}
          <form onSubmit={handleSaveInfo} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-start gap-2 mb-6">
              <User size={18} className="text-emerald-600 mt-0.5" />
              <div>
                <h3 className="font-bold text-gray-900">Personal Information</h3>
                <p className="text-xs text-gray-400 mt-0.5">Update your personal details and contact information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your full name"
                    className="w-full pl-9 pr-3 h-10 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    readOnly
                    value={user.email}
                    className="w-full pl-9 pr-3 h-10 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+880 1XXX-XXXXXX"
                    className="w-full pl-9 pr-3 h-10 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Profile image URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Profile Image URL</label>
                <div className="relative">
                  <Camera size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={profile.image}
                    onChange={(e) => setProfile((p) => ({ ...p, image: e.target.value }))}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full pl-9 pr-3 h-10 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Address — full width */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Address</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    rows={2}
                    value={profile.address}
                    onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Street, City, Country"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={savingInfo}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60 text-white text-sm font-semibold transition-all"
              >
                {savingInfo && <span className="loading loading-spinner loading-xs" />}
                Save Changes
              </button>
            </div>
          </form>

          {/* ── Change Password ────────────────────────────────── */}
          <form onSubmit={handleChangePassword} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-start gap-2 mb-6">
              <Lock size={18} className="text-emerald-600 mt-0.5" />
              <div>
                <h3 className="font-bold text-gray-900">Change Password</h3>
                <p className="text-xs text-gray-400 mt-0.5">Ensure your account is using a long, random password to stay secure</p>
              </div>
            </div>

            <div className="space-y-4">
              <PasswordField
                label="Current Password"
                value={currentPassword}
                onChange={setCurrentPassword}
                show={showCurrent}
                onToggle={() => setShowCurrent(!showCurrent)}
                placeholder="Enter your current password"
              />
              <PasswordField
                label="New Password"
                value={newPassword}
                onChange={setNewPassword}
                show={showNew}
                onToggle={() => setShowNew(!showNew)}
                placeholder="Enter new password"
              />
              <PasswordField
                label="Confirm New Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={savingPassword}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60 text-white text-sm font-semibold transition-all"
              >
                {savingPassword
                  ? <><span className="loading loading-spinner loading-xs" /> Updating…</>
                  : <><ShieldCheck size={16} /> Update Password</>
                }
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

// ── Reusable password input with show/hide toggle ──────────────────────
function PasswordField({ label, value, onChange, show, onToggle, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 h-10 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

export default ProfileManagePage;