import { adminService } from "@/lib/services/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { allScans, usScans, recentScans } = await adminService.getDiagnosticData();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      allScans: allScans.map(s => ({
        id: s.id,
        market: s.market,
        status: s.status,
        runAt: s.runAt?.toISOString(),
        totalScanned: s.totalScanned,
        goodResultsCount: s.goodResultsCount,
        errorMessage: s.errorMessage,
      })),
      usScans: usScans.map(s => ({
        market: s.market,
        status: s.status,
        runAt: s.runAt?.toISOString(),
        goodResults: s.goodResultsCount,
        totalScanned: s.totalScanned,
      })),
      may2_3_scans: recentScans.map(s => ({
        market: s.market,
        status: s.status,
        runAt: s.runAt?.toISOString(),
        goodResults: s.goodResultsCount,
      })),
      summary: {
        totalScans: allScans.length,
        usScansCount: usScans.length,
        latestScanDate: allScans[0]?.runAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error("Diagnostic error:", error);
    return NextResponse.json(
      { error: String(error), timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
