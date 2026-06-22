"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client"; // adjust to your actual auth-client path
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { redirect } from "next/navigation";


export default function SignUp({ onSwitchToSignIn, onSignUpSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    photoUrl: "",
    email: "",
    password: "",
    role: "buyer", // default selection — was "" before, which is why an
                   // unchanged selection submitted as an empty string
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const loadingToast = toast.loading("Creating your account...");

    const { data, error } = await authClient.signUp.email({
      name: formData.name,
      image: formData.photoUrl,
      email: formData.email,
      password: formData.password,
      role:formData.role,
      callbackURL: "/sign-in",
    });

    toast.dismiss(loadingToast);
    setIsSubmitting(false);

    if (error) {
      setError(error.message || "Something went wrong. Please try again.");
      toast.error(error.message || "Something went wrong. Please try again.");
      return;
    }

    toast.success("Account created!");
    onSignUpSuccess?.(data);
    redirect("/sign-in")
  }

  function handleGoogleClick() {
    authClient.signIn.social({ provider: "google", callbackURL: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#1f2d22] sm:flex-row">
      <Toaster position="top-center" />

      {/* Side panel: compact banner on mobile, full hero panel from sm up */}
      <div className="relative flex flex-col justify-center bg-[#eef3e2] px-6 py-8 sm:flex-1 sm:px-12 sm:py-12 lg:px-16">
        <div className="mb-6 flex items-center gap-2.5 sm:absolute sm:top-10 sm:left-12 sm:mb-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1f4d3c] sm:h-9 sm:w-9">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18" className="sm:w-5 sm:h-5">
              <path
                d="M12 2L4 6V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V6L12 2Z"
                stroke="white"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-base font-bold text-[#1f4d3c] sm:text-lg">ReSell Hub</span>
        </div>

        <div className="flex items-center gap-5 sm:block sm:max-w-[380px]">
          <div className="flex-1 sm:flex-none">
            <h1 className="text-xl font-bold leading-tight text-[#1f4d3c] sm:text-3xl lg:text-[32px]">
              Buy smart. Sell easy.
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#4b6354] sm:mt-3 sm:text-[15px]">
              Join ReSell Hub and give your used items a new home. List
              products, chat with buyers, and earn from things you no longer
              need.
            </p>
          </div>

          {/* Illustration: small inline badge on mobile, full showcase from sm up */}
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-[#dce8c8] sm:mx-auto sm:mt-10 sm:h-[220px] sm:w-[220px] sm:flex-shrink">
            <svg
              width="140"
              height="160"
              viewBox="0 0 140 160"
              fill="none"
              className="h-10 w-9 sm:h-40 sm:w-[122px]"
            >
              <path d="M30 50 L35 30 H105 L110 50 Z" fill="#1f4d3c" />
              <rect x="20" y="50" width="100" height="100" rx="6" fill="#2c6b4f" />
              <path
                d="M55 30 V20 a15 15 0 0 1 30 0 V30"
                stroke="#1f4d3c"
                strokeWidth="6"
                fill="none"
              />
              <g transform="translate(70 100)">
                <path
                  d="M0 -28 L8 -14 L-2 -14 L6 0 L-22 -2 L-10 -14 L-20 -14 Z"
                  fill="#eef3e2"
                />
                <path
                  d="M0 -28 L8 -14 L-2 -14 L6 0 L-22 -2 L-10 -14 L-20 -14 Z"
                  fill="#eef3e2"
                  transform="rotate(120)"
                />
                <path
                  d="M0 -28 L8 -14 L-2 -14 L6 0 L-22 -2 L-10 -14 L-20 -14 Z"
                  fill="#eef3e2"
                  transform="rotate(240)"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 sm:px-6 sm:py-12">
        <div className="w-full max-w-[380px]">
          <h2 className="text-2xl font-bold sm:text-[26px]">Create account</h2>
          <p className="mt-1.5 text-sm text-[#6b7a6d]">Start buying and selling in minutes.</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 sm:mt-7 sm:gap-[18px]">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#33402f]" htmlFor="name">
                Full name
              </label>
              <input
                className="w-full rounded-[10px] border border-[#d8e0cf] bg-white px-3.5 py-2.5 text-sm text-[#1f2d22] outline-none focus:border-[#2c6b4f]"
                id="name"
                name="name"
                type="text"
                placeholder="Jamie Rahman"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#33402f]" htmlFor="photoUrl">
                Photo URL
              </label>
              <input
                className="w-full rounded-[10px] border border-[#d8e0cf] bg-white px-3.5 py-2.5 text-sm text-[#1f2d22] outline-none focus:border-[#2c6b4f]"
                id="photoUrl"
                name="photoUrl"
                type="text"
                placeholder="https://example.com/your-photo.jpg"
                value={formData.photoUrl}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#33402f]" htmlFor="email">
                Email address
              </label>
              <input
                className="w-full rounded-[10px] border border-[#d8e0cf] bg-white px-3.5 py-2.5 text-sm text-[#1f2d22] outline-none focus:border-[#2c6b4f]"
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>




            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#33402f]" htmlFor="password">
                Password
              </label>
              <input
                className="w-full rounded-[10px] border border-[#d8e0cf] bg-white px-3.5 py-2.5 text-sm text-[#1f2d22] outline-none focus:border-[#2c6b4f]"
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/*
              Role radios — fixed to be a properly controlled group:
              - removed `defaultChecked` from all three (you can't have
                three "default checked" radios in one group and expect
                React to track which is actually selected)
              - added `checked={formData.role === "x"}` to each, so React
                state is the single source of truth for which is selected
              - this is what actually makes a controlled radio group work;
                onChange alone without `checked` doesn't reliably stick
            */}
            <div className="space-y-2">
              <label className="mb-1.5 block text-sm font-semibold text-[#33402f]">
                Role
              </label>
             
              <div className="flex gap-2 text-sm font-bold">
                <input
                  type="radio"
                  className="rounded-[10px] radio-sm border radio radio-success"
                  id="seller"
                  name="role"
                  value="seller"
                  checked={formData.role === "seller"}
                  onChange={handleChange}
                />
                <label htmlFor="seller"> Seller</label>
              </div>
              <div className="flex gap-2 text-sm font-bold">
                <input
                  type="radio"
                  className="rounded-[10px] radio-sm border radio radio-success"
                  id="buyer"
                  name="role"
                  value="buyer"
                  checked={formData.role === "buyer"}
                  onChange={handleChange}
                />
                <label htmlFor="buyer"> Buyer</label>
              </div>
            </div>
            {error && (
              <p className="rounded-lg bg-[#fbeaea] px-3 py-2 text-[13px] text-[#a13a3a]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full rounded-[10px] bg-[#2c6b4f] py-3 text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Signing up..." : "Sign up"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#e4e9dc]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca99a]">
              or
            </span>
            <span className="h-px flex-1 bg-[#e4e9dc]" />
          </div>

          <button
            type="button"
            onClick={handleGoogleClick}
            className="flex w-full items-center justify-center gap-2.5 rounded-[10px] border border-[#d8e0cf] bg-white py-2.5 text-sm font-semibold text-[#2c3e2d]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

         <p className="mt-6 text-center text-sm text-[#6b7a6d]">
  allready have an account?
          <Link href="/sign-in" className="text-green-800 font-bold">
           SIGN In
          </Link>
</p>
        </div>
      </div>
    </div>
  );
}