import { HistoryView } from "@/components/HistoryView";
import { getServerHistory } from "@/lib/history-server";

export default async function HistoryPage() {
  const entries = await getServerHistory();
  return <HistoryView initialEntries={entries} />;
}
