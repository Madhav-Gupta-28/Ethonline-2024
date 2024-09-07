import Link from "next/link";

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="bg-[#080B0F] min-h-screen p-6">
      <div className="w-full h-fit py-5 bg-transparent backdrop-blur-2xl border-2 border-[#8301D3] to rounded-3xl flex justify-between items-center relative text-white px-10">
        <div>
          <Link
            href={"/"}
            className="text-2xl font-bold text-center text-transparent bg-clip-text bg-white cursor-pointer"
          >
            Meme Battles
          </Link>
        </div>
        <div className="flex justify-center items-center gap-7">
          <Link
            href={"/battles"}
            className=" text-gray-300 font-semibold transition-all duration-300 cursor-pointer link-underline link-underline-black text-lg"
          >
            Battle Page
          </Link>

          <Link
            href={"/profile"}
            className="text-gray-300 transition-all duration-300 font-semibold cursor-pointer link-underline link-underline-black text-lg"
          >
            Profile
          </Link>
        </div>
        {/* <Link
          href={"/battles"}
          className="absolute left-5 text-gray-200 font-semibold bg-[#6B0CDF] px-4 py-2 rounded-xl cursor-pointer border-2 border-transparent hover:border-2 hover:border-[#6B0CDF] hover:bg-transparent"
        >
          Battle Page
        </Link>
        
        <div className="absolute right-5 text-gray-200 font-semibold bg-[#6B0CDF] px-4 py-2 rounded-xl cursor-pointer border-2 border-transparent hover:border-2 hover:border-[#6B0CDF] hover:bg-transparent">
          Connect Wallet
        </div> */}
      </div>

      {children}
    </section>
  );
}
