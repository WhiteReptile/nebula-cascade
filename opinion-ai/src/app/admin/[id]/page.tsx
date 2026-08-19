import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { getCategory } from "@/lib/categories";
import { displayJobStatus, jobHasUploadFile } from "@/lib/job-lifecycle";
import { getJob, isJobId } from "@/lib/queue";
import { AdminReviewForm } from "@/components/AdminReviewForm";

export const dynamic = "force-dynamic";

function Preview({ jobId, mime, filename }: { jobId: string; mime: string; filename: string }) {
  const src = `/api/admin/jobs/${jobId}/file`;
  if (mime.startsWith("audio/")) {
    return <audio controls src={src} className="w-full" />;
  }
  if (mime.startsWith("video/")) {
    return <video controls src={src} className="w-full" />;
  }
  if (mime.startsWith("image/")) {
    // eslint-disable-next-line @next/next/no-img-element -- private admin file, not a public Image src
    return <img src={src} alt={filename} className="w-full" />;
  }
  if (mime === "application/pdf" || filename.toLowerCase().endsWith(".pdf")) {
    return <iframe title={filename} src={src} className="w-full h-[28rem] bg-black/40" />;
  }
  return <p className="text-dynamic text-sm">Open the file with Download.</p>;
}

export default async function AdminJobPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    redirect("/admin");
  }

  const { id } = await params;
  if (!isJobId(id)) notFound();
  const job = await getJob(id);
  if (!job) notFound();

  return (
    <div className="px-6 py-16 sm:py-20">
      <div className="max-w-xl mx-auto mb-8">
        <Link href="/admin" className="text-dynamic text-sm">
          Admin
        </Link>
        <h1 className="cosmic-title font-light text-[1.5625rem] mt-4">{job.filename}</h1>
        <p className="text-dynamic text-xs mt-2">
          {displayJobStatus(job.status)} · {getCategory(job.category).label} · {new Date(job.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="max-w-xl mx-auto w-full space-y-6">
        {jobHasUploadFile(job) ? (
          <>
            <div className="cosmic-glass p-5">
              <Preview jobId={job.id} mime={job.mimeType} filename={job.filename} />
            </div>
            <a href={`/api/admin/jobs/${job.id}/file?download=1`} className="cosmic-cta-ghost inline-block text-sm px-8 py-2.5">
              Download
            </a>
          </>
        ) : (
          <div className="cosmic-glass p-5">
            <p className="text-dynamic text-sm">
              Upload file removed after the opinion was saved. Only the evaluation result is kept.
            </p>
          </div>
        )}
        {job.context && (
          <div className="cosmic-glass p-5">
            <p className="label-white text-[10px] mb-3">Context</p>
            <p className="text-dynamic text-sm leading-relaxed whitespace-pre-wrap">{job.context}</p>
          </div>
        )}
        <AdminReviewForm job={job} />
      </div>
    </div>
  );
}
