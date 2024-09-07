import Link from "next/link";

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="bg-[#080B0F] min-h-screen p-6">
      <div className="w-full h-fit py-5 bg-transparent backdrop-blur-2xl border-2 border-[#8301D3] to rounded-3xl flex justify-center items-center relative">
        <Link
          href={"/battles"}
          className="absolute left-5 text-gray-200 font-semibold bg-[#6B0CDF] px-4 py-2 rounded-xl cursor-pointer border-2 border-transparent hover:border-2 hover:border-[#6B0CDF] hover:bg-transparent"
        >
          Battle Page
        </Link>
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-white">
          Meme Battles
        </h1>
        <div className="absolute right-5 text-gray-200 font-semibold bg-[#6B0CDF] px-4 py-2 rounded-xl cursor-pointer border-2 border-transparent hover:border-2 hover:border-[#6B0CDF] hover:bg-transparent">
          Connect Wallet
        </div>
      </div>

      {children}
    </section>
  );
}
