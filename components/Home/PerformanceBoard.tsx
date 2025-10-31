
import { redirect } from "next/navigation";
import { checkTokenValidity } from "@/actions/auth-actions";
import { getLeaderboardData } from "@/actions/PerformanceBoard";
import PerformanceBoardClient from "./PerformanceBoardClient";

export default async function PerformanceBoard() {
  // Check if user is authenticated
  const isValid = await checkTokenValidity();
  
  if (!isValid) {
    redirect("/auth");
  }

  // Fetch leaderboard data
  const result = await getLeaderboardData();

  if (!result.success) {
    return (
      <div className="min-h-screen flex items-center justify-center " dir="rtl">
        <div className="max-w-lg w-full mx-auto p-6">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-red-600 mb-4 text-center">
              حدث خطأ أثناء تحميل البيانات
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm wrap-break-words">{result.error}</p>
            </div>
            <div className="text-center">
              <a 
                href="/leaderboard" 
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                حاول مرة أخرى
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-8">
      <PerformanceBoardClient initialData={result.data} />
    </div>
  );
}