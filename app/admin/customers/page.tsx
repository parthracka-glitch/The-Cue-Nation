"use client";

import React, { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatINR } from "@/lib/money";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Search,
  Plus,
  ArrowRight,
  CreditCard,
  Wallet,
  Award,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CustomersPage() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New customer form
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCreditLimit, setNewCreditLimit] = useState("5000");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, mutate, isLoading } = useSWR(
    `/api/admin/customers?filter=${filter}&search=${encodeURIComponent(search)}`,
    fetcher
  );

  const customers = data?.customers || [];

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          phone: newPhone.trim(),
          email: newEmail.trim() || undefined,
          creditLimit: parseInt(newCreditLimit, 10) * 100,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setFormError(result.error || "Failed to create customer");
        setSubmitting(false);
        return;
      }

      setAddModalOpen(false);
      setNewName("");
      setNewPhone("");
      setNewEmail("");
      mutate();
    } catch (e) {
      setFormError("Network error creating customer");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Customer Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-400" /> Customer Relationship Management (CRM)
          </h1>
          <p className="text-xs text-muted-foreground">
            Track player lifetime spend, visit frequency, wallet top-ups, and Khata credit balances.
          </p>
        </div>

        <Button
          onClick={() => setAddModalOpen(true)}
          variant="gold"
          size="sm"
          className="text-xs font-semibold gap-1.5 shadow-md shadow-amber-950/30"
        >
          <Plus className="h-4 w-4" /> Add New Customer
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "ALL", label: "All Players" },
            { id: "CREDIT", label: "Has Khata Credit" },
            { id: "MEMBER", label: "VIP Members" },
            { id: "RISK", label: "Credit Risks (>80%)" },
            { id: "TOP", label: "Top 10 Spenders" },
          ].map((f) => (
            <Button
              key={f.id}
              variant={filter === f.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.id)}
              className="text-xs h-8 whitespace-nowrap"
            >
              {f.label}
            </Button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Customers Table */}
      <Card className="border-border bg-card/80">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" />
              Loading customer profiles...
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-xs">
              No customers found matching this criteria.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Phone / Contact</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead className="text-right">Visits</TableHead>
                  <TableHead className="text-right">Lifetime Spend</TableHead>
                  <TableHead className="text-right">Wallet</TableHead>
                  <TableHead className="text-right">Credit Owed (Khata)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-semibold text-white">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="hover:text-emerald-400 transition-colors"
                      >
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {c.phone}
                    </TableCell>
                    <TableCell>
                      {c.activeMembership ? (
                        <Badge variant="gold" className="text-[10px]">
                          {c.activeMembership}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Standard</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs">{c.visitsCount}</TableCell>
                    <TableCell className="text-right font-bold text-white text-xs">
                      {formatINR(c.lifetimeSpendPaise)}
                    </TableCell>
                    <TableCell className="text-right text-emerald-400 font-medium text-xs">
                      {formatINR(c.walletBalance)}
                    </TableCell>
                    <TableCell className="text-right">
                      {c.creditBalance > 0 ? (
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-amber-400 text-xs">
                            {formatINR(c.creditBalance)}
                          </span>
                          {c.isCreditRisk && (
                            <span className="text-[9px] text-red-400 font-semibold">
                              ⚠️ High Risk ({Math.round(c.creditUtilization)}%)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">₹0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/customers/${c.id}/ledger`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] px-2 text-amber-300 border-amber-600/40"
                          >
                            Khata Ledger
                          </Button>
                        </Link>
                        <Link href={`/admin/customers/${c.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2">
                            View <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Customer Modal Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md bg-card border-emerald-900/60 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg">Add New Customer</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Register player into CueClub CRM with unique phone and Khata credit limit
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300">
              {formError}
            </div>
          )}

          <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Full Name *</Label>
              <Input
                placeholder="e.g. Sameer Dixit"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Mobile Phone (Unique) *</Label>
              <Input
                placeholder="+9198XXXXXXXX"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Email Address</Label>
              <Input
                type="email"
                placeholder="sameer@example.in"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Initial Credit Limit (₹)</Label>
              <Input
                type="number"
                value={newCreditLimit}
                onChange={(e) => setNewCreditLimit(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} size="sm">
                {submitting ? "Saving..." : "Create Profile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
