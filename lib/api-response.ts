import { randomUUID } from "crypto";

import { NextResponse } from "next/server";

import { CORS_ORIGIN } from "@/lib/constants";

export interface RequestMeta {
  timestamp: string;
  request_id: string;
}

export function getRequestMeta(): RequestMeta {
  return {
    timestamp: new Date().toISOString(),
    request_id: randomUUID(),
  };
}

function baseHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Content-Type": "application/json",
  };
}

export function ok<T>(
  data: T,
  meta: RequestMeta = getRequestMeta(),
  status = 200,
): NextResponse {
  return NextResponse.json(
    {
      data,
      error: null,
      meta,
    },
    {
      status,
      headers: baseHeaders(),
    },
  );
}

export function fail(
  error: string,
  meta: RequestMeta = getRequestMeta(),
  status = 400,
): NextResponse {
  return NextResponse.json(
    {
      data: null,
      error,
      meta,
    },
    {
      status,
      headers: baseHeaders(),
    },
  );
}

export function optionsResponse(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: baseHeaders(),
  });
}
