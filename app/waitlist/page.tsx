"use client";

import { useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";

const inputClass =
"w-full rounded-[10px] border border-[#D8D0C6] bg-white/75 px-4 py-3.5 text-[15px] text-[#0E171B] outline-none transition placeholder:text-[#8A8279] focus:border-[#081620] focus:bg-white";

const selectClass =
"w-full appearance-none rounded-[10px] border border-[#D8D0C6] bg-white/75 px-4 py-3.5 pr-12 text-[15px] text-[#0E171B] outline-none transition focus:border-[#081620] focus:bg-white";

const buttonClass =
"rounded-[10px] bg-[#081620] px-8 py-4 text-sm tracking-[0.12em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

const stepContent = {
1: {
  eyebrow: "Early access",
  title: "Join the waitlist",
  description:
    "Be first to experience personalized daily supplement pouches designed around your routine.",
},
2: {
  eyebrow: "Your routine",
  title: "Tell us what you take",
  description:
    "Share what you currently use, when you take it, and any brands you already trust.",
},
3: {
  eyebrow: "Your preferences",
  title: "Shape your pouch experience",
  description:
    "Help us learn where you buy, what you spend, and what kind of personalized pouch experience you’d want.",
},
};

export default function WaitlistPage() {
const [step, setStep] = useState<1 | 2 | 3>(1);

const [formData, setFormData] = useState({
  first_name: "",
  last_name: "",
  email: "",
  supplements: "",
  current_brands: "",
  brand_importance: "",
  brands_to_avoid: "",
  timing: "",
  daily_supplement_count: "",
  purchase_location: "",
  monthly_spend: "",
  goal: "",
  interested_in_powders: "",
});

const [isSubmitting, setIsSubmitting] = useState(false);
const [success, setSuccess] = useState(false);
const [errorMessage, setErrorMessage] = useState("");

const currentStep = stepContent[step];

const handleChange = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};

const nextStep = () => {
  setErrorMessage("");

  if (step === 1 && (!formData.first_name.trim() || !formData.email.trim())) {
    setErrorMessage("Please complete the required fields.");
    return;
  }

  setStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev));
};

const prevStep = () => {
  setErrorMessage("");
  setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev));
};

const handleSubmit = async () => {
  setIsSubmitting(true);
  setErrorMessage("");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    setErrorMessage(
      "The waitlist is not connected yet. Please add the Supabase environment variables in Vercel."
    );
    setIsSubmitting(false);
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const fullName = `${formData.first_name} ${formData.last_name}`.trim();

  const payload = {
    first_name: formData.first_name,
    last_name: formData.last_name,
    name: fullName,
    email: formData.email,
    supplements: formData.supplements,
    current_brands: formData.current_brands,
    brand_importance: formData.brand_importance,
    brands_to_avoid: formData.brands_to_avoid,
    timing: formData.timing,
    daily_supplement_count: formData.daily_supplement_count,
    purchase_location: formData.purchase_location,
    monthly_spend: formData.monthly_spend,
    goal: formData.goal,
    interested_in_powders: formData.interested_in_powders === "yes",
  };

  const { error } = await supabase.from("waitlist").insert([payload]);

  if (error) {
    console.error("Supabase waitlist error:", error);
    console.error("Attempted waitlist payload:", payload);
    setErrorMessage(error.message || "Something went wrong. Please try again.");
    setIsSubmitting(false);
    return;
  }

  setSuccess(true);
  setIsSubmitting(false);
};

return (
  <main className="min-h-screen bg-[#F3E9DD] px-6 py-12 text-[#0E171B]">
    <div className="mx-auto max-w-[820px]">
      <a
        href="/"
        className="mb-8 inline-block text-sm tracking-[0.12em] text-[#5A4E45] transition hover:opacity-70">

        ← BACK HOME
      </a>

      <section className="rounded-[32px] border border-[#DDD7CF] bg-[#F8F2EA]/90 px-8 py-10 shadow-[0_30px_80px_rgba(20,15,10,0.08)] md:px-12">
        <div className="mb-8 flex gap-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={`h-[3px] flex-1 rounded-full ${
                step >= item ? "bg-[#081620]" : "bg-[#D8D0C6]"
              }`}
            />
          ))}
        </div>

        <p className="mb-4 text-xs uppercase tracking-[0.28em] text-[#8C1D40]">
          {success ? "Confirmed" : currentStep.eyebrow}
        </p>

        <h1
          className="text-[46px] leading-[0.95] tracking-[-0.04em] md:text-[64px]"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

          {success ? "You’re on the list." : currentStep.title}
        </h1>

        <p className="mt-6 max-w-[620px] text-[18px] leading-8 text-[#475357]">
          {success
            ? "Thank you — your routine has been saved. We’ll use this to understand what people are already taking, which brands they trust, where they buy, and how Vidapouch should be designed."
            : currentStep.description}
        </p>

        {success ? (
          <div className="mt-10 rounded-[24px] border border-[#D8D0C6] bg-white/60 p-8">
            <h2 className="text-2xl font-semibold">
              Welcome to the early circle.
            </h2>
            <p className="mt-3 leading-7 text-[#475357]">
              We’ll use your input to shape the first Vidapouch experience.
            </p>
          </div>
        ) : (
          <div className="mt-10">
            {step === 1 && (
              <div className="grid gap-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="First name" required>
                    <input
                      name="first_name"
                      type="text"
                      required
                      placeholder="First name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Last name">
                    <input
                      name="last_name"
                      type="text"
                      placeholder="Last name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="Email" required>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>

                <div className="pt-2">
                  <button type="button" onClick={nextStep} className={buttonClass}>
                    CONTINUE
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-6">
                <Field label="What supplements are you currently taking?">
                  <textarea
                    name="supplements"
                    placeholder="Example: creatine, fiber, magnesium, vitamin D, CoQ10..."
                    value={formData.supplements}
                    onChange={handleChange}
                    className={`${inputClass} min-h-[120px] resize-none`}
                  />
                </Field>

                <Field label="Which brands do you currently trust or use?">
                  <textarea
                    name="current_brands"
                    placeholder="Example: CellCore, Thorne, Pure Encapsulations, Life Extension, specific Amazon brands, etc."
                    value={formData.current_brands}
                    onChange={handleChange}
                    className={`${inputClass} min-h-[105px] resize-none`}
                  />
                </Field>

                <SelectField label="How important is it to keep your current brands?">
                  <select
                    name="brand_importance"
                    value={formData.brand_importance}
                    onChange={handleChange}
                    className={selectClass}>

                    <option value="">Select one</option>
                    <option value="1 - Not important">1 - Not important</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5 - Somewhat important">5 - Somewhat important</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10 - Extremely important">10 - Extremely important</option>
                  </select>
                </SelectField>

                <Field label="Are there any brands, retailers, or sources you avoid?">
                  <textarea
                    name="brands_to_avoid"
                    placeholder="Example: I avoid Amazon supplements, generic brands, certain ingredients, or anything not practitioner-grade..."
                    value={formData.brands_to_avoid}
                    onChange={handleChange}
                    className={`${inputClass} min-h-[95px] resize-none`}
                  />
                </Field>

                <div className="grid gap-6 md:grid-cols-2">
                  <SelectField label="When do you usually take them?">
                    <select
                      name="timing"
                      value={formData.timing}
                      onChange={handleChange}
                      className={selectClass}>

                      <option value="">Select one</option>
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Evening">Evening</option>
                      <option value="Bedtime">Bedtime</option>
                      <option value="Multiple times per day">
                        Multiple times per day
                      </option>
                      <option value="Specific times">Specific times</option>
                    </select>
                  </SelectField>

                  <SelectField label="How many supplements do you take daily?">
                    <select
                      name="daily_supplement_count"
                      value={formData.daily_supplement_count}
                      onChange={handleChange}
                      className={selectClass}>

                      <option value="">Select one</option>
                      <option value="1-2">1–2</option>
                      <option value="3-5">3–5</option>
                      <option value="6-8">6–8</option>
                      <option value="9+">9+</option>
                    </select>
                  </SelectField>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-sm tracking-[0.12em] text-[#5A4E45] transition hover:opacity-70">

                    BACK
                  </button>

                  <button type="button" onClick={nextStep} className={buttonClass}>
                    CONTINUE
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <SelectField label="Where do you usually buy supplements?">
                    <select
                      name="purchase_location"
                      value={formData.purchase_location}
                      onChange={handleChange}
                      className={selectClass}>

                      <option value="">Select one</option>
                      <option value="Amazon">Amazon</option>
                      <option value="Whole Foods">Whole Foods</option>
                      <option value="CVS / Walgreens">CVS / Walgreens</option>
                      <option value="GNC / Vitamin Shoppe">
                        GNC / Vitamin Shoppe
                      </option>
                      <option value="Direct from brands">
                        Direct from brands
                      </option>
                      <option value="Other">Other</option>
                    </select>
                  </SelectField>

                  <SelectField label="Monthly supplement spend">
                    <select
                      name="monthly_spend"
                      value={formData.monthly_spend}
                      onChange={handleChange}
                      className={selectClass}>

                      <option value="">Select one</option>
                      <option value="$0-$50">$0–$50</option>
                      <option value="$50-$100">$50–$100</option>
                      <option value="$100-$200">$100–$200</option>
                      <option value="$200+">$200+</option>
                    </select>
                  </SelectField>
                </div>

                <SelectField label="Primary wellness goal">
                  <select
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    className={selectClass}>

                    <option value="">Select one</option>
                    <option value="Energy">Energy</option>
                    <option value="Hair, skin, and nails">
                      Hair, skin, and nails
                    </option>
                    <option value="Digestion">Digestion</option>
                    <option value="Sleep">Sleep</option>
                    <option value="Immunity">Immunity</option>
                    <option value="General wellness">General wellness</option>
                  </select>
                </SelectField>

                <SelectField label="Would you be interested in powder pouches?">
                  <select
                    name="interested_in_powders"
                    value={formData.interested_in_powders}
                    onChange={handleChange}
                    className={selectClass}>

                    <option value="">Select one</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </SelectField>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-sm tracking-[0.12em] text-[#5A4E45] transition hover:opacity-70">

                    BACK
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={buttonClass}>

                    {isSubmitting ? "SUBMITTING..." : "JOIN THE WAITLIST"}
                  </button>
                </div>
              </div>
            )}

            {errorMessage && (
              <p className="mt-5 rounded-[10px] bg-[#8C1D40]/10 px-4 py-3 text-sm text-[#8C1D40]">
                {errorMessage}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  </main>
);
}

function Field({
label,
children,
required = false,
}: {
label: string;
children: ReactNode;
required?: boolean;
}) {
return (
  <label className="grid gap-2">
    <span className="text-sm font-medium tracking-[0.04em] text-[#1F2A2E]">
      {label}
      {required && <span className="ml-1 text-[#8C1D40]">*</span>}
    </span>
    {children}
  </label>
);
}

function SelectField({
label,
children,
}: {
label: string;
children: ReactNode;
}) {
return (
  <label className="grid gap-2">
    <span className="text-sm font-medium tracking-[0.04em] text-[#1F2A2E]">
      {label}
    </span>

    <div className="relative">
      {children}
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-[#6B7280]">
        ▼
      </span>
    </div>
  </label>
);
}