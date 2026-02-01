import { auth, signIn, signOut } from "@/auth";
import Image from "next/image";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-24 text-black">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">DocsFlow Auth Demo</h1>
      </div>

      <div className="flex flex-col items-center justify-center gap-8">
        {session ? (
          <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-xl shadow-md">
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt="User Avatar"
                width={100}
                height={100}
                className="rounded-full"
              />
            )}
            <h2 className="text-2xl font-semibold">
              Welcome, {session.user?.name}!
            </h2>
            <p className="text-gray-600">{session.user?.email}</p>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-full bg-red-500 px-6 py-2 text-white transition-colors hover:bg-red-600"
              >
                Sign Out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-xl shadow-md">
            <p className="text-lg text-gray-700">You are not signed in.</p>
            <form
              action={async () => {
                "use server";
                await signIn("google");
              }}
            >
              <button
                type="submit"
                className="rounded-full bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
              >
                Sign in with Google
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="mt-12 text-center text-gray-500">
        <p>
          Try accessing a{" "}
          <a href="/protected" className="text-blue-500 underline">
            protected route
          </a>{" "}
          (will redirect here if not logged in).
        </p>
      </div>
    </div>
  );
}
