import Image from 'next/image';
import banner from './banner.svg';

const FEATURES = [
  {
    title: 'Feature Library',
    description:
      'Build a reusable catalog of specials with descriptions, allergens, prep notes, and images — ready to schedule any night.',
    icon: '📋',
  },
  {
    title: 'Weekly Scheduling',
    description:
      'Drag-and-drop specials onto a calendar, duplicate previous weeks, and publish when ready. Plan lunch and dinner separately.',
    icon: '📅',
  },
  {
    title: 'Daily Lineup',
    description:
      'Servers pull up today\'s features on their phone in seconds — descriptions, pairings, and allergens at a glance.',
    icon: '📱',
  },
  {
    title: 'Wine Pairings',
    description:
      'Pair each dish with a recommended wine and tasting note so servers can upsell with confidence.',
    icon: '🍷',
  },
  {
    title: 'Margin Tracking',
    description:
      'Enter cost and price per feature — margins are calculated automatically so the kitchen stays profitable.',
    icon: '📊',
  },
  {
    title: 'Role-Based Access',
    description:
      'Chefs create, managers approve, servers view. Everyone sees exactly what they need — nothing more.',
    icon: '🔒',
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      {/* Hero */}
      <div className="text-center flex flex-col items-center mt-16 mb-20">
        <Image src={banner} alt="FeatureBoard" width={360} height={80} priority className="mb-6" />
        <p className="text-lg text-muted-foreground max-w-lg">
          Replace spreadsheets and handwritten notes with a shared system for planning, publishing,
          and communicating daily specials.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Sign In
          </a>
        </div>
      </div>

      {/* Features grid */}
      <section className="w-full max-w-5xl">
        <h2 className="text-2xl font-bold text-center mb-10">
          Everything your team needs to run specials
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <div className="mt-20 mb-12 text-center">
        <p className="text-muted-foreground mb-4">Ready to streamline your specials?</p>
        <a
          href="/login"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          Get Started
        </a>
      </div>
    </main>
  );
}
