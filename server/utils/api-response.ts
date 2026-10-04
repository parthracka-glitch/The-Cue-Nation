import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  meta?: Record<string, any>;
}

export function jsonSuccess<T>(data: T, meta?: Record<string, any>, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    { status }
  );
}

export function jsonError(message: string, status = 400, code?: string) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(code ? { code } : {}),
    },
    { status }
  );
}

export function handleApiError(err: unknown, defaultMessage = "Internal Server Error") {
  console.error("API Error:", err);
  const message = err instanceof Error ? err.message : defaultMessage;
  return jsonError(message, 500);
}
