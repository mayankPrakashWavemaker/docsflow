import { auth } from "@/auth";

export default async function ProtectedPage() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold">Protected Page</h1>
      <p className="mt-4">
        This page is protected by middleware. If you can see this, you are logged in.
      </p>
      <div className="mt-8 bg-gray-100 p-4 rounded">
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
    </div>
  );
}
