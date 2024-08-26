import Link from "next/link";

export default function Home() {
  return (
    <main className=" p-2">
      <h1 className="font-bold mx-auto text-4xl w-full flex justify-center items-center">Welcome to the the Meme Betting App</h1>
      <div className="flex justify-center mx-auto gap-3 mt-20">
        <Link className="bg-red-300 w-fit px-2 py-1 rounded-md" href="/dapp">Home page</Link>
        <Link className="bg-green-300 w-fit px-2 py-1 rounded-md" href={"/chatSection"}>Chat Section</Link>
      </div>
    </main>
  );
}
