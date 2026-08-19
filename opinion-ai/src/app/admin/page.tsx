import Link from "next/link";
import { isAdmin } from "@/lib/admin-auth";
import { getCategory } from "@/lib/categories";
import { displayJobStatus } from "@/lib/job-lifecycle";
import { listJobs } from "@/lib/queue";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminLogout } from "@/components/AdminLogout";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return (
      <div className="px-6 py-16 sm:py-20">
        <div className="max-w-xl mx-auto mb-12 text-center">
          <h1 className="cosmic-title font-light text-[1.5625rem]">Admin</h1>
        </div>
        <AdminLogin />
      </div>
    );
  }

  const jobs = await listJobs();

  return (
    <div className="px-6 py-16 sm:py-20">
      <div className="max-w-xl mx-auto mb-12 flex items-center justify-between">
        <h1 className="cosmic-title font-light text-[1.5625rem]">Admin</h1>
        <AdminLogout />
      </div>
      <div className="max-w-xl mx-auto w-full">
        {jobs.length === 0 ? (
          <p className="text-dynamic text-sm">No jobs yet.</p>
        ) : (
          <ul className="space-y-3">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link href={`/admin/${job.id}`} className="cosmic-glass p-5 block">
                  <p className="text-white text-sm">
                    {displayJobStatus(job.status)} · {getCategory(job.category).label} · {job.filename}
                  </p>
                  <p className="text-dynamic text-xs mt-2">{new Date(job.createdAt).toLocaleString()}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
