import { LoginForm } from "./LoginForm";

type SearchParams = { next?: string };

export default async function LoginPage({
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
        <h1 className="text-2xl font-bold">Log in</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Use the account you registered with on this mock shop.
        </p>
      </div>
      <LoginForm nextPath={nextPath} />
    </div>
  );
}
