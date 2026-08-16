import Link from "next/link";
import ResetPasswordForm from "./ResetPasswordForm";

export default async function ResetPasswordPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await props.searchParams;

  return (
    <div className="relative flex min-h-screen w-full flex-1 items-center justify-center overflow-hidden px-4">
      <div
        className="pointer-events-none absolute top-0 right-0 -z-10 h-[420px] w-[420px] rounded-full opacity-20 blur-[100px]"
        style={{ background: "var(--color-accent)" }}
      />
      <div className="card-shine w-full max-w-sm rounded-2xl p-6">
        <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">
          Gym Tracker
        </p>
        <h1 className="font-display text-[28px] leading-none tracking-wide text-text uppercase">
          Reset Password
        </h1>

        {!token ? (
          <p className="relative z-10 mt-4 text-[13px] text-muted">
            This link is missing a token.{" "}
            <Link href="/forgot-password" className="font-semibold text-accent hover:underline">
              Request a new one
            </Link>
            .
          </p>
        ) : (
          <ResetPasswordForm token={token} />
        )}
      </div>
    </div>
  );
}
