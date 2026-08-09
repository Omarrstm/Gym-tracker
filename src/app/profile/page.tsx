import Link from "next/link";
import { getUser } from "@/lib/dal";
import NameForm from "./NameForm";
import PasswordForm from "./PasswordForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getUser();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
      <header className="mb-5">
        <Link
          href="/"
          className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
        >
          &larr; Back
        </Link>
        <p className="mt-3 font-display text-[13px] tracking-[0.12em] text-accent uppercase">
          {user.email}
        </p>
        <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
          Profile
        </h1>
      </header>

      <div className="flex flex-col gap-4">
        <section className="card-shine rounded-2xl p-6">
          <h2 className="relative z-10 mb-4 font-display text-[15px] tracking-wide text-text uppercase">
            Account
          </h2>
          <NameForm initialName={user.name ?? ""} />
        </section>

        <section className="card-shine rounded-2xl p-6">
          <h2 className="relative z-10 mb-4 font-display text-[15px] tracking-wide text-text uppercase">
            Change Password
          </h2>
          <PasswordForm />
        </section>
      </div>
    </div>
  );
}
