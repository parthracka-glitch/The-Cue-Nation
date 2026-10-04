import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { formatINR } from "@/lib/money";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, CreditCard, Award, Calendar, Clock, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerAccountPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/account");
  }

  // Fetch customer profile by user ID or email
  const customer = await prisma.customer.findFirst({
    where: {
      OR: [{ userId: session.user.id }, { email: session.user.email }],
    },
    include: {
      memberships: {
        include: { plan: true },
        where: { endsAt: { gte: new Date() } },
      },
      reservations: {
        orderBy: { startsAt: "desc" },
        include: { table: true },
      },
      ledgerEntries: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  const activeMembership = customer?.memberships?.[0];
  const upcomingBookings =
    customer?.reservations.filter(
      (r) => new Date(r.startsAt) >= new Date() && r.status !== "CANCELLED"
    ) || [];
  const pastBookings =
    customer?.reservations.filter(
      (r) => new Date(r.startsAt) < new Date() || r.status === "CANCELLED"
    ) || [];

  return (
    <div className="min-h-screen flex flex-col bg-billiard-950 text-foreground">
      <PublicHeader />

      <main className="flex-1 py-10 px-4 sm:px-6 max-w-5xl mx-auto w-full space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-white">
                Welcome, {customer?.name || session.user.name}
              </h1>
              {activeMembership && (
                <Badge variant="gold" className="text-xs">
                  {activeMembership.plan.name}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered Phone: {customer?.phone || "N/A"} | Loyalty Points:{" "}
              <strong className="text-emerald-400">{customer?.loyaltyPoints || 0} pts</strong>
            </p>
          </div>
        </div>

        {/* 3 Metric Cards: Wallet, Credit (Khata), Membership */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Wallet Balance */}
          <Card className="border-border bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Wallet Balance
              </CardTitle>
              <Wallet className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">
                {formatINR(customer?.walletBalance || 0)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Use for table sessions, food & beverages
              </p>
            </CardContent>
          </Card>

          {/* Credit Khata Balance */}
          <Card className="border-border bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Credit Balance (Khata)
              </CardTitle>
              <CreditCard className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-400">
                {formatINR(customer?.creditBalance || 0)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Limit: {formatINR(customer?.creditLimit || 500000)} | Payable at reception
              </p>
            </CardContent>
          </Card>

          {/* Membership Tier */}
          <Card className="border-border bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                VIP Membership
              </CardTitle>
              <Award className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {activeMembership ? activeMembership.plan.name : "Regular Guest"}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {activeMembership
                  ? `${activeMembership.plan.discountPercent}% discount active`
                  : "Upgrade at reception or admin"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings & Ledger Tabs */}
        <div className="space-y-4">
          <Tabs defaultValue="upcoming">
            <TabsList>
              <TabsTrigger value="upcoming">
                Upcoming Bookings ({upcomingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="past">Past Visits & Bookings</TabsTrigger>
              <TabsTrigger value="ledger">Ledger & Khata History</TabsTrigger>
            </TabsList>

            {/* Upcoming Bookings Tab */}
            <TabsContent value="upcoming" className="space-y-4 pt-2">
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-xl text-muted-foreground text-sm">
                  No upcoming reservations.{" "}
                  <a href="/book" className="text-emerald-400 underline ml-1">
                    Book a table now
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingBookings.map((b) => (
                    <Card key={b.id} className="border-border bg-card/80">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                          <Badge variant="available">CONFIRMED</Badge>
                          <CardTitle className="text-base text-white mt-1">
                            {b.code} • {b.table?.name || b.tableType}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                          <span>
                            {new Date(b.startsAt).toLocaleString("en-IN", {
                              timeZone: "Asia/Kolkata",
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-border">
                          <span>Deposit Paid:</span>
                          <span className="font-semibold text-emerald-400">
                            {formatINR(b.depositPaise)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Past Bookings Tab */}
            <TabsContent value="past" className="space-y-3 pt-2">
              {pastBookings.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-xl text-muted-foreground text-sm">
                  No past bookings recorded yet.
                </div>
              ) : (
                pastBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-card/50 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{b.code}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {b.status}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground mt-0.5 block">
                        {new Date(b.startsAt).toLocaleDateString("en-IN")} • {b.table?.name || b.tableType}
                      </span>
                    </div>
                    <span className="font-medium text-emerald-400">
                      {formatINR(b.depositPaise)} deposit
                    </span>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Ledger History Tab */}
            <TabsContent value="ledger" className="space-y-3 pt-2">
              {customer?.ledgerEntries?.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-xl text-muted-foreground text-sm">
                  No transaction ledger entries recorded yet.
                </div>
              ) : (
                customer?.ledgerEntries?.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-card/50 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                          entry.type.includes("CREDIT")
                            ? "bg-amber-950/40 text-amber-400"
                            : "bg-emerald-950/40 text-emerald-400"
                        }`}
                      >
                        {entry.type.includes("TOPUP") || entry.type.includes("REPAID") ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-white block">
                          {entry.type.replace(/_/g, " ")}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                          {entry.note ? ` • ${entry.note}` : ""}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        entry.type.includes("GIVEN") || entry.type.includes("SPEND")
                          ? "text-rose-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {formatINR(entry.amountPaise)}
                    </span>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
