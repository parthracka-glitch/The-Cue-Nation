import { z } from "zod";

export const bookingInputSchema = z
  .object({
    tableId: z.string().min(1, "Table is required"),
    start: z.coerce.date(),
    end: z.coerce.date(),
    guestName: z.string().trim().min(1, "Name is required").max(80).optional(),
    guestPhone: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{10,13}$/, "Please enter a valid 10-13 digit phone number")
      .optional()
      .or(z.literal("")),
  })
  .refine((v) => v.end > v.start, {
    message: "End time must be after start time",
    path: ["end"],
  })
  .refine((v) => v.end.getTime() - v.start.getTime() <= 6 * 3600_000, {
    message: "Maximum booking duration is 6 hours",
    path: ["end"],
  });

export type BookingInput = z.infer<typeof bookingInputSchema>;
