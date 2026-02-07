"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Shield, TrendingUp, BookOpen, Database } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold font-serif tracking-tight">Fortress Intelligence</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm">Methodology</Button>
            <Button variant="default" size="sm">Member Login</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-24 pb-32 px-4 text-center space-y-8 overflow-hidden">

        {/* Ambient Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="mb-4 px-4 py-1 text-sm">
            Public Beta Access
          </Badge>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-6xl md:text-7xl font-bold font-serif tracking-tight max-w-4xl text-balance"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          We don't predict prices. <br />
          <span className="text-primary">We publish frameworks.</span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl text-balance font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          The Educational Intelligence Layer for Indian Markets.
          Bridging the gap between raw screener data and blind tipster faith.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button size="lg" className="gap-2">
            Explore the Fortress 30 <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg">
            Read the Constitution
          </Button>
        </motion.div>
      </section>

      {/* The Problem / Solution Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Database className="h-10 w-10 text-blue-500" />}
              title="Beyond Screeners"
              description="Screeners dump 500 results on you. We filter the noise and isolate the signal using our 5-Layer Protection framework."
              delay={0.1}
            />
            <FeatureCard
              icon={<TrendingUp className="h-10 w-10 text-red-500" />}
              title="Anti-Tipster"
              description="We never tell you to buy. We explain why a business passed our quality checks. The final decision is always yours."
              delay={0.2}
            />
            <FeatureCard
              icon={<BookOpen className="h-10 w-10 text-amber-500" />}
              title="Education First"
              description="Every stock in the Fortress 30 comes with a 'Why' thesis. Learn the logic behind the list, don't just copy it."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t py-12 bg-background">
        <div className="container px-4 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Fortress Intelligence. All rights reserved.</p>
          <p className="mt-2 text-xs">Not a SEBI registered investment advisor. For educational purposes only.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="h-full bg-card/50 backdrop-blur border-primary/10">
        <CardHeader>
          <div className="mb-4">{icon}</div>
          <CardTitle className="font-serif text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
