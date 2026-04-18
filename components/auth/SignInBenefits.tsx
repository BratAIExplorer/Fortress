"use client";

import {
  BookmarkIcon,
  Bell,
  BarChart3,
  MessageCircle,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SignInBenefits() {
  const benefits = [
    {
      icon: <BookmarkIcon className="h-5 w-5" />,
      title: "Save Watchlists",
      description: "Create and manage personalized stock watchlists",
      comingSoon: true,
    },
    {
      icon: <Bell className="h-5 w-5" />,
      title: "Price Alerts",
      description: "Get notified when stocks hit your target prices",
      comingSoon: true,
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Track Portfolio",
      description: "Monitor your holdings and track performance",
      comingSoon: true,
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      title: "Direct Feedback",
      description: "Share insights and help shape Fortress",
      active: true,
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Personalized Insights",
      description: "Get recommendations based on your research",
      comingSoon: true,
    },
  ];

  return (
    <div className="bg-gradient-to-b from-primary/5 via-background to-background py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl font-bold font-serif">
            Unlock the Full Power of Fortress
          </h2>
          <p className="text-muted-foreground text-lg">
            Sign in to access exclusive features and shape the future of investment
            research
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {benefits.map((benefit, i) => (
            <Card
              key={i}
              className={`relative overflow-hidden border-primary/10 ${
                benefit.active ? "bg-primary/10 border-primary/20" : ""
              }`}
            >
              {benefit.comingSoon && (
                <div className="absolute top-2 right-2 bg-amber-500/20 text-amber-600 text-xs px-2 py-0.5 rounded-full font-medium">
                  Coming Soon
                </div>
              )}
              {benefit.active && (
                <div className="absolute top-2 right-2 bg-green-500/20 text-green-600 text-xs px-2 py-0.5 rounded-full font-medium">
                  Available Now
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="text-primary/70 mb-2">{benefit.icon}</div>
                <CardTitle className="text-sm font-semibold">
                  {benefit.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild className="gap-2">
            <Link href="/register">Create Free Account</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
