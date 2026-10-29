import Image from "next/image";

export default function Home() {
  return (
    <div className="flex items-center justify-center dark:bg-black bg-linear-to-r from-cyan-500 to-blue-500">
      <main className="flex min-h-screen w-full flex-col items-center justify-between py-32 px-16 dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <h1>Trang chủ nè</h1>
      </main>
    </div>
  );
}
