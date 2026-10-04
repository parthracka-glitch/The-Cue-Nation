import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ReservationService } from "@/server/services/reservation.service";

const ReservationSchema = z.object({
  tableType: z.enum(["POOL", "SNOOKER", "CAROM"]),
  startTime: z.string().datetime({ offset: true }),
  durationHours: z.number().min(1).max(4),
  partySize: z.number().min(1).max(10).default(2),
  guestName: z.string().min(2, "Name must be at least 2 characters"),
  guestPhone: z.string().min(8, "Valid phone number required"),
  guestEmail: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ReservationSchema.parse(body);

    const reservation = await ReservationService.createReservation(validated);

    return NextResponse.json(
      {
        reservation,
        tableName: reservation.table?.name || "Assigned Table",
        depositPaise: reservation.depositPaise,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Reservation creation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    if (error?.message?.includes("SLOT_FULL")) {
      return NextResponse.json(
        { error: "This time slot was just booked by another guest. Please choose a different time." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error?.message || "Could not complete reservation" },
      { status: 500 }
    );
  }
}
