import { NextRequest, NextResponse } from "next/server";
import { ReservationService } from "@/server/services/reservation.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.toUpperCase().trim();
    const phone = searchParams.get("phone")?.trim();

    if (!code || !phone) {
      return NextResponse.json(
        { error: "Booking code and phone number are required" },
        { status: 400 }
      );
    }

    const result = await ReservationService.lookupReservation(code, phone);
    return NextResponse.json(result.reservation);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Lookup failed" },
      { status: 404 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, reason } = await req.json();
    const result = await ReservationService.cancelReservation(id, reason);

    return NextResponse.json({
      reservation: result.reservation,
      message: result.isRefundable
        ? `Reservation cancelled successfully. Your deposit of ₹${result.reservation.depositPaise / 100} is refundable.`
        : "Reservation cancelled. As this was within 2 hours of game time, deposit is non-refundable.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Cancellation failed" },
      { status: 500 }
    );
  }
}
