"use client";
// Deployment trigger: V5 Full Integration
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, BookOpen, Database, Brain } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/fortress/Navbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Compliance Disclaimer Banner */}
      <div className="bg-amber-950/20 border-b border-amber-500/10 py-3 px-4 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center text-xs text-amber-200/70 font-medium">
          <strong className="text-amber-400">Important Disclosure:</strong> Fortress Intelligence is not a financial advisor. This platform provides analysis and research tools for educational purposes only.
          Please consult a licensed financial advisor before making investment decisions. Past performance does not guarantee future results.
        </div>
      </div>

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
          We don&apos;t predict prices. <br />
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
          <Button size="lg" className="gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold" asChild>
            <Link href="/v5-extension">
              Explore V5 Extension <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/fortress-30">
              Fortress 30 List
            </Link>
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <Link href="/constitution">
              Our Constitution
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="gap-2 border-primary/40 text-primary hover:bg-primary/10" asChild>
            <Link href="/intelligence">
              <Brain className="h-4 w-4" />
              How It Works
            </Link>
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
