import { useState, useEffect } from "react";
import { databases, ID, MESSAGES_ID, DATABASE_ID } from "../lib/appwrite";
import { useAuth } from "../context/AuthContext";

const CONTACT_INFO = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    label: "Email",
    value: "contact@blogspace.com",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    label: "Location",
    value: "India",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: "Response time",
    value: "Within 24 hours",
  },
];

export default function Contact() {
  const { user } = useAuth();
  const [form,    setForm]    = useState(() => ({
    name: user?.name || "", email: user?.email || "", phone: "", subject: "", message: "",
  }));
  const [status,  setStatus]  = useState("idle");
  const [submitError, setSubmitError] = useState("");
  const [errors,  setErrors]  = useState({});
  const [focused, setFocused] = useState("");

  useEffect(() => { document.title = "Contact | BlogSpace"; }, []);


  function validate() {
    const e = {};
    if (!form.name.trim())    e.name    = "Name is required.";
    if (!form.email.trim())   e.email   = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.subject.trim()) e.subject = "Subject is required.";
    if (!form.message.trim()) e.message = "Message is required.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitError("");
    setStatus("loading");

    try {
      // Save message to Appwrite database
      await databases.createDocument(DATABASE_ID, MESSAGES_ID, ID.unique(), {
        name:    form.name.trim(),
        email:   form.email.trim(),
        phone:   form.phone.trim() || "",
        subject: form.subject.trim(),
        message: form.message.trim(),
        userId:  user?.$id || "",
      });
      setStatus("sent");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      console.error("Contact error:", err.message);
      // Keep what the visitor typed and tell them it did not go through
      setSubmitError("We couldn't send your message right now. Please try again in a moment.");
      setStatus("idle");
    }
  }

  function update(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  const inputClass = (key) =>
    `w-full border rounded-xl px-4 py-3 text-sm text-gray-800 outline-none transition-all bg-gray-50 focus:bg-white
    ${errors[key] ? "border-red-400 ring-2 ring-red-100" : focused === key ? "border-orange-400 ring-2 ring-orange-100" : "border-gray-200 hover:border-gray-300"}`;

  return (
    <div className="min-h-screen bg-[#f9f7f4] pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3">Contact</p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-serif mb-4">Get in Touch</h1>
          <p className="text-gray-500 max-w-md mx-auto">Have a question, suggestion, or just want to say hello? We'd love to hear from you.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sidebar */}
          <div className="space-y-4">
            {CONTACT_INFO.map((info) => (
              <div key={info.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                  {info.icon}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">{info.label}</p>
                  <p className="text-sm font-medium text-gray-700">{info.value}</p>
                </div>
              </div>
            ))}
            <div className="bg-orange-500 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg font-serif mb-2">Writing tips</h3>
              <p className="text-sm text-orange-100 leading-relaxed">
                Share feedback on BlogSpace, suggest new categories, or report any issues. We read every message.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            {status === "sent" ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-serif mb-2">Message sent!</h3>
                <p className="text-gray-500 text-sm mb-6">Thanks for reaching out. We'll get back to you within 24 hours.</p>
                <button onClick={() => setStatus("idle")}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="c-name" className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Full Name *</label>
                    <input id="c-name" type="text" value={form.name} onChange={(e) => update("name", e.target.value)}
                      onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                      placeholder="Your name" className={inputClass("name")} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="c-email" className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Email *</label>
                    <input id="c-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                      onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                      placeholder="you@example.com" className={inputClass("email")} />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="c-phone" className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Phone <span className="text-gray-300">(optional)</span></label>
                    <input id="c-phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                      onFocus={() => setFocused("phone")} onBlur={() => setFocused("")}
                      placeholder="+91 xxxxxxxxxx" className={inputClass("phone")} />
                  </div>
                  <div>
                    <label htmlFor="c-subject" className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Subject *</label>
                    <input id="c-subject" type="text" value={form.subject} onChange={(e) => update("subject", e.target.value)}
                      onFocus={() => setFocused("subject")} onBlur={() => setFocused("")}
                      placeholder="What's this about?" className={inputClass("subject")} />
                    {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="c-message" className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Message *</label>
                  <textarea id="c-message" rows={5} value={form.message} onChange={(e) => update("message", e.target.value)}
                    onFocus={() => setFocused("message")} onBlur={() => setFocused("")}
                    placeholder="Tell us what's on your mind…"
                    className={inputClass("message") + " resize-none"} />
                  {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                </div>

                {submitError && (
                  <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    {submitError}
                  </p>
                )}

                <button type="submit" disabled={status === "loading"}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3.5 rounded-xl shadow-md shadow-orange-500/20 transition-all text-sm">
                  {status === "loading" ? (
                    <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>Sending…</>
                  ) : (
                    <>Send Message
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
