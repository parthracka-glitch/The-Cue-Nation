"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/money";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Receipt, RefreshCw, AlertTriangle, Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BillsPage() {
  const { data: authSession } = useSession();
  const isAdmin = authSession?.user?.role === "ADMIN";

  const [statusFilter, setStatusFilter] = useState("ALL");
  const { data, mutate, isLoading } = useSWR(
    `/api/admin/bills?status=${statusFilter}`,
    fetcher
  );

  const bills = data?.bills || [];

  async function handleRefund(billId: string) {
    if (!isAdmin) return;
    const reason = prompt("Enter reason for refund / reopen (will be logged in AuditLog):");
    if (!reason) return;

    try {
      const res = await fetch("/api/admin/bills", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId, action: "REFUND", reason }),
      });
      if (res.ok) {
        mutate();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to refund bill");
      }
    } catch (e) {
      alert("Network error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Receipt className="h-6 w-6 text-emerald-400" />
            Bills & Financial Settlements
          </h1>
          <p className="text-xs text-muted-foreground">
            Complete transaction history with split modes, payment methods, and admin refund authority.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "PAID", "CREDIT", "OPEN"].map((st) => (
            <Button
              key={st}
              variant={statusFilter === st ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(st)}
              className="text-xs h-8"
            >
              {st}
            </Button>
          ))}
        </div>
      </div>

      <Card className="border-border bg-card/80">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" />
              Loading bills...
            </div>
          ) : bills.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-xs">
              No bills found matching this filter.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill ID</TableHead>
                  <TableHead>Table / Target</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Split Mode</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Payments</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill: any) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-mono font-semibold text-white">
                      #{bill.id.substring(0, 8)}
                    </TableCell>
                    <TableCell className="text-xs">
                      {bill.session?.table?.name || "Standalone"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {bill.customer?.name || "Walk-in Guest"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {bill.splitMode}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(bill.createdAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    <TableCell className="text-xs">
                      {bill.payments.map((p: any) => p.method).join(", ") || "None"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-400">
                      {formatINR(bill.totalPaise)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          bill.status === "PAID"
                            ? "available"
                            : bill.status === "CREDIT"
                            ? "paused"
                            : "outline"
                        }
                      >
                        {bill.status}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        {bill.status === "PAID" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRefund(bill.id)}
                            className="h-7 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-950/20"
                          >
                            Refund (Reopen)
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
