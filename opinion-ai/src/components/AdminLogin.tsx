export function AdminLogin({ error }: { error?: string | null }) {
  return (
    <form method="POST" action="/api/admin/login" className="max-w-xl mx-auto w-full">
      <div className="cosmic-glass p-1">
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full bg-transparent px-5 py-4 text-sm text-white placeholder:text-white/40 focus:outline-none"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="mt-6 flex justify-end">
        <button type="submit" className="cosmic-cta text-sm px-8 py-2.5">
          Log in
        </button>
      </div>
      {error && <p className="mt-4 text-sm text-white">{error}</p>}
    </form>
  );
}
