"use client";

import { useEffect, useState } from "react";
import { Lalezar, Tajawal } from "next/font/google";
import { AlertCircle, Check, Copy, Link2, UserPlus, X } from "lucide-react";
import { toArabicDigits } from "@/lib/utils";

const lalezar = Lalezar({ subsets: ["arabic"], weight: "400" });
const tajawal = Tajawal({ subsets: ["arabic"], weight: ["400", "500", "700"] });

interface Props {
  username: string;
}

const STEPS = [
  {
    title: "أرسل لصديقك رابط الدعوة",
  },
  {
    title: "اطلب منه التواصل مع أحد المشرفين",
  },
];

export default function InviteFriend({ username }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`${tajawal.className} inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#BEE663] border border-[#043F2E]/15 text-[#043F2E] text-xs font-bold hover:bg-[#9ADD00] transition-colors`}
      >
        <UserPlus className="w-3.5 h-3.5" strokeWidth={2.4} />
        ادعُ صديقًا
      </button>

      {open && <InviteModal onClose={() => setOpen(false)} username={username} />}
    </>
  );
}

function InviteModal({ username, onClose }: Props & { onClose: () => void }) {
  // Safe to read `window` here: the modal only mounts after a click, in the browser.
  // The origin follows whichever site the member is on (localhost, production, ...).
  const inviteUrl = `${window.location.origin}/auth?mode=signup&referrer=${encodeURIComponent(username)}`;
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch (error) {
      console.error("Failed to copy invite link", error);
      setCopyState("failed");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#043F2E]/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-heading"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[400px] max-h-[85vh] overflow-y-auto bg-white rounded-3xl border border-[#043F2E]/10 shadow-lg p-5 flex flex-col gap-4"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-[#043F2E] flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-[#BEE663]" strokeWidth={2.4} />
            </div>
            <h3 id="invite-heading" className={`${lalezar.className} text-lg text-[#043F2E]`}>
              ادعُ صديقًا إلى المقرأة
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-[#043F2E]/60 hover:bg-[#F7FBEA] hover:text-[#043F2E] transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={2.2} />
          </button>
        </div>

        <p className={`${tajawal.className} text-sm text-[#043F2E]/70 leading-relaxed`}>
          شارك زملاءك صحبة القرآن، فالدالّ على الخير كفاعله.
        </p>

        {/* Steps */}
        <ol className="flex flex-col gap-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex items-start gap-3">
              <span
                className={`${lalezar.className} w-7 h-7 shrink-0 rounded-lg bg-[#BEE663] text-[#043F2E] flex items-center justify-center text-sm`}
              >
                {toArabicDigits(i + 1)}
              </span>
              <span className={`${tajawal.className} text-sm font-bold text-[#043F2E] pt-1`}>
                {step.title}
              </span>
            </li>
          ))}
        </ol>

        <div className="h-px bg-[#043F2E]/8" />

        {/* Invite link */}
        <div className="flex flex-col gap-2">
          <span
            className={`${tajawal.className} flex items-center gap-1.5 text-xs font-bold text-[#043F2E]/60`}
          >
            <Link2 className="w-3.5 h-3.5" strokeWidth={2.4} />
            رابط الدعوة الخاص بك
          </span>
          <div className="min-h-11 rounded-2xl bg-[#F7FBEA] border border-[#043F2E]/20 px-4 py-3">
            {/* A URL reads left to right even inside an RTL panel */}
            <p
              dir="ltr"
              className={`${tajawal.className} text-sm font-medium text-[#043F2E] break-all select-all`}
            >
              {inviteUrl}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            aria-live="polite"
            className={`${tajawal.className} w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-[#BEE663] hover:bg-[#9ADD00] text-[#043F2E] text-sm font-bold transition-colors`}
          >
            {copyState === "copied" ? (
              <>
                <Check className="w-4 h-4" strokeWidth={2.4} />
                تم نسخ الرابط
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" strokeWidth={2.4} />
                نسخ الرابط
              </>
            )}
          </button>
          {copyState === "failed" && (
            <p
              role="alert"
              className={`${tajawal.className} flex items-center gap-1.5 text-xs text-[#9B3D2E] font-medium`}
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2.4} />
              <span>تعذّر النسخ، انسخ الرابط يدويًا</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
