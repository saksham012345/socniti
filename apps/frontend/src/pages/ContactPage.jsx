export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-[2rem] bg-white p-8 shadow-soft">
        <h1 className="font-display text-4xl font-bold text-ink">Contact SOCNITI</h1>
        <form className="mt-6 grid gap-4">
          <input placeholder="Your name" className="rounded-2xl border border-ink/15 px-4 py-3" />
          <input placeholder="Your email" className="rounded-2xl border border-ink/15 px-4 py-3" />
          <textarea
            rows="5"
            placeholder="How can we help?"
            className="rounded-2xl border border-ink/15 px-4 py-3"
          />
          <button type="button" className="rounded-2xl bg-ink px-4 py-3 font-semibold text-white">
            Send message
          </button>
        </form>
      </div>
    </div>
  );
}
