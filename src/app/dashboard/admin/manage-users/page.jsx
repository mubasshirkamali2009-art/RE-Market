"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Users, AlertCircle, Mail, Calendar, Trash2, UserCheck } from "lucide-react";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}`;

export default function AdminManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch all profiles from backend collection
  const fetchAllUsers = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/admin/users`);
      if (!response.ok) throw new Error("Failed to load user directory from server.");
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Unable to aggregate platform system profiles. Verify database connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  // Handle Permanent User Deletion
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("WARNING: Are you absolutely sure you want to permanently delete this user account? They will be removed entirely from the system records instantly.")) return;

    try {
      setActionLoadingId(userId);
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || "Failed to complete account removal.");

      alert(resData.message || "User profile successfully removed.");
      setLoading(true);
      fetchAllUsers(); // Re-sync frontend registry list layout view
    } catch (err) {
      console.error(err);
      alert(err.message || "An administrative error occurred during removal handling.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-50 border-purple-200 text-purple-700 font-bold";
      case "seller":
        return "bg-blue-50 border-blue-200 text-blue-700 font-medium";
      default:
        return "bg-emerald-50 border-emerald-200 text-emerald-700 font-medium";
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-gray-100 rounded-2xl border" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center max-w-xl mx-auto mt-12 bg-red-50 rounded-2xl border border-red-100 p-8 text-red-600">
        <AlertCircle className="w-12 h-12 mx-auto mb-3" />
        <p className="font-semibold">{error}</p>
        <button 
          onClick={() => {
            setLoading(true);
            fetchAllUsers();
          }} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
        >
          Retry User Sync
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Upper Registry Heading */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" /> Platform Accounts Registry
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review user identities, filter platform roles, and permanently drop system user files.
          </p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl h-fit w-fit">
          <p className="text-xs font-semibold text-indigo-700">
            Active Accounts: <span className="text-sm font-extrabold">{users.length} Users</span>
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No user documents found in the database collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user._id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between transition-all hover:shadow-md">
              
              {/* Profile Card Body */}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-mono bg-gray-100 border px-1.5 py-0.5 rounded text-gray-500">
                      UID: {user._id}
                    </span>
                    <h2 className="font-bold text-gray-900 text-base truncate mt-1.5" title={user.name || "Unnamed User"}>
                      {user.name || "Unnamed Account"}
                    </h2>
                  </div>
                  
                  {/* Role Badge Indicator */}
                  <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${getRoleStyle(user.role)}`}>
                    {user.role || "buyer"}
                  </span>
                </div>

                {/* Profile Metadata Contacts */}
                <div className="space-y-2 text-xs text-gray-600 pt-1">
                  <p className="flex items-center gap-2 text-gray-500 break-all">
                    <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    {user.email}
                  </p>
                  {user.createdAt && (
                    <p className="flex items-center gap-2 text-gray-400 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Operations Control Footer Bar */}
              <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <UserCheck className="w-4 h-4" /> Active Status
                </span>

                {/* Permanent Delete Action Control */}
                {user.role !== "admin" ? (
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    disabled={actionLoadingId === user._id}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border bg-red-50 border-red-200 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {actionLoadingId === user._id ? "Purging..." : "Remove User"}
                  </button>
                ) : (
                  <span className="text-[11px] font-mono font-medium text-gray-400 italic">
                    Protected Admin
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}