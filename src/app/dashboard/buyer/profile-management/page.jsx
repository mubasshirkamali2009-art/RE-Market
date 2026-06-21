"use client";

import { useEffect, useState } from "react";
import { useSession, authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const ProfailPage = () => {
  const { data: session } = useSession();
  const email = session?.user?.email;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({ name: "", image: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState("");

  // ---- profile data load (GET /api/profile) ----
  useEffect(() => {
    if (!email) return;

    async function loadProfile() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/profile?email=${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setProfile(data);
        setForm({
          name: data.name || "",
          image: data.image || "",
          phone: data.phone || "",
          address: data.address || "",
        });
      } catch (err) {
        console.error(err);
        setMessage("Profile load korte problem hoyeche.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [email]);

  // ---- profile update (PATCH /api/profile) ----
  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...form }),
      });
      if (!res.ok) throw new Error("Update failed");

      setProfile((prev) => ({ ...prev, ...form }));
      setMessage("Profile update hoyeche.");
      setEditing(false);
    } catch (err) {
      console.error(err);
      setMessage("Update korte problem hoyeche.");
    } finally {
      setSaving(false);
    }
  }

  // ---- password change (better-auth) ----
  async function handlePasswordChange(e) {
    e.preventDefault();
    setPwMessage("");

    if (pwForm.next.length < 8) {
      setPwMessage("Notun password kompokkhe 8 character hote hobe.");
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwMessage("Notun password mile nai.");
      return;
    }

    setPwSaving(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
        revokeOtherSessions: true,
      });

      if (error) {
        setPwMessage(error.message || "Password change kora jay nai.");
      } else {
        setPwMessage("Password update hoyeche.");
        setPwForm({ current: "", next: "", confirm: "" });
      }
    } catch (err) {
      console.error(err);
      setPwMessage("Kichu ekta problem hoyeche.");
    } finally {
      setPwSaving(false);
    }
  }

  if (!email) {
    return <p className="p-6 text-center text-gray-500">Profile dekhte hole sign in koro.</p>;
  }

  if (loading) {
    return <p className="p-6 text-center text-gray-500">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* ---- View / Edit profile info ---- */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        {!editing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <img
                src={profile?.image || "/default-avatar.png"}
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover bg-gray-100"
              />
              <div>
                <p className="font-semibold">{profile?.name || "No name set"}</p>
                <p className="text-sm text-gray-500">{email}</p>
              </div>
            </div>

            <p><span className="text-gray-500">Phone:</span> {profile?.phone || "—"}</p>
            <p><span className="text-gray-500">Address:</span> {profile?.address || "—"}</p>

            <button
              onClick={() => setEditing(true)}
              className="rounded-lg bg-black px-4 py-2 text-sm text-white"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Image URL</label>
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {message && <p className="mt-3 text-sm">{message}</p>}
      </div>

      {/* ---- Change password ---- */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-semibold">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <input
            type="password"
            placeholder="Current password"
            value={pwForm.current}
            onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="New password"
            value={pwForm.next}
            onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={pwForm.confirm}
            onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            required
          />
          <button
            type="submit"
            disabled={pwSaving}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {pwSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
        {pwMessage && <p className="mt-3 text-sm">{pwMessage}</p>}
      </div>
    </div>
  );
};

export default ProfailPage;