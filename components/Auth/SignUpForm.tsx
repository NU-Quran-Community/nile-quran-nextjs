"use client";
import { Tajawal } from "next/font/google";
import { useActionState } from "react";
import { signup } from "@/actions/auth-actions";
import { Spinner } from "../ui/spinner";

const tajawal = Tajawal({
  subsets: ["latin"],
  weight: "700",
});

interface FormState {
  errors: {
    [key: string]: string;
  };
}

export default function SignUpForm() {
  const initialState: FormState = { errors: {} };
  const [formState, formAction, isPending] = useActionState(
    signup,
    initialState,
  );

  return (
    <form
      id="auth-form"
      action={formAction}
      className={`${tajawal.className} px-20 py-5 flex flex-col gap-5 `}
    >
      <div className="flex gap-3">
        <div className="w-1/2 flex  flex-col gap-3 items-end">
          <label className="text-[#043F2E] text-[20px]f">الاسم الاخير</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            placeholder="الاسم الاخير"
            dir="auto"
            className="bg-white w-full h-14 rounded-[7px] border border-[#043F2E] placeholder:text-end  px-5 focus:placeholder:opacity-0"
          />
        </div>
        <div className="w-1/2 flex  flex-col gap-3 items-end">
          <label className="text-[#043F2E] text-[20px]f">الاسم الاول</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            placeholder="الاسم الاول"
            dir="auto"
            required
            className="bg-white w-full h-14 rounded-[7px] border border-[#043F2E] placeholder:text-end  px-5 focus:placeholder:opacity-0"
          />
        </div>
      </div>
      <div className="flex flex-col gap-3 items-end">
        <label className="text-[#043F2E] text-[20px]f">البريد الالكترونى</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="البريد الالكترونى"
          dir="auto"
          required
          className="bg-white w-full h-14 rounded-[7px] border border-[#043F2E] placeholder:text-end  px-5 focus:placeholder:opacity-0"
        />
      </div>
      <div className="flex flex-col gap-3 items-end">
        <label className="text-[#043F2E] text-[20px]f">اسم المستخدم</label>
        <input
          type="text"
          id="username"
          name="username"
          placeholder="اسم المستخدم"
          dir="auto"
          required
          className="bg-white w-full h-14 rounded-[7px] border border-[#043F2E] placeholder:text-end  px-5 focus:placeholder:opacity-0"
        />
      </div>
      <div className="flex flex-col gap-3 items-end">
        <label className="text-[#043F2E] text-[20px]f">المرسل</label>
        <input
          type="referrer"
          id="referrer"
          name="referrer"
          placeholder="المرسل"
          dir="auto"
          required
          className="bg-white w-full h-14 rounded-[7px] border border-[#043F2E] placeholder:text-end  px-5 focus:placeholder:opacity-0"
        />
      </div>
      <div className="flex flex-col gap-3 items-end">
        <label className="text-[#043F2E] text-[20px]f">كلمة السر</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          placeholder="كلمة السر"
          dir="auto"
          className="bg-white w-full h-14 rounded-[7px] border border-[#043F2E] placeholder:text-end  px-5 focus:placeholder:opacity-0"
        />
      </div>
      {/* ERRORS */}
      {formState.errors && Object.keys(formState.errors).length > 0 && (
        <ul className="list-none p-0 m-0">
          {Object.entries(formState.errors).map(([key, value]) => (
            <li key={key} className="text-red-500 text-sm">
              {value}
            </li>
          ))}
        </ul>
      )}
      <button
        disabled={isPending}
        type="submit"
        className="rounded-[7px] flex justify-center items-center w-full bg-[#BEE663] h-14 font-extrabold text-[20px] text-[#043F2E] cursor-pointer"
      >
        {isPending ? <Spinner /> : "تسجيل الدخول"}
      </button>
    </form>
  );
}
