import Link from "next/link";

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="bg-gradient-to-b from-[#101212] to-[#0d3530] min-h-screen p-6">
      <div className="w-full h-fit py-5 bg-transparent backdrop-blur-2xl border-2 border-[#1EEE9A] rounded-3xl flex justify-center items-center relative">
        <Link
          href={"/battles"}
          className="absolute left-5 text-black bg-[#1EEE9A] px-4 py-2 rounded-xl cursor-pointer hover:bg-green-500"
        >
          Battle Page
        </Link>
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-white">
          Meme Battles
        </h1>
        <div className="absolute right-5 text-black bg-[#1EEE9A] px-4 py-2 rounded-xl cursor-pointer hover:bg-green-500">
          Connect Wallet
        </div>
      </div>

      {children}
    </section>
  );
}
