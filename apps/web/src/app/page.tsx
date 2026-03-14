import Image from 'next/image';
import banner from './banner.svg';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center flex flex-col items-center">
        <Image src={banner} alt="FeatureBoard" width={360} height={80} priority className="mb-6" />
        <p className="text-lg text-muted-foreground max-w-md">
          Restaurant feature planning and daily specials management.
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
    </main>
  );
}
