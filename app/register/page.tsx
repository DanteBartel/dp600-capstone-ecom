import { RegisterForm } from "./RegisterForm";

type SearchParams = { next?: string };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: SearchParams | Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const raw = sp.next?.trim() ?? "";
  const nextPath =
    raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Register</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Creates a user row and a linked customer profile for analytics-friendly
          checkout data.
        </p>
      </div>
      <RegisterForm nextPath={nextPath} />
    </div>
  );
}
