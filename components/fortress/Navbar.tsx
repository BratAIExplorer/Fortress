"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X, Brain, Globe, BookMarked, Target } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { useSession } from "next-auth/react";
import { MarketSelector } from "@/components/ui/MarketSelector";

interface NavbarProps {
    title?: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    showLinks?: boolean;
    className?: string;
    containerClassName?: string;
}

export function Navbar({
    title = "Fortress Intelligence",
    subtitle,
    rightElement,
    showLinks = true,
    className,
    containerClassName
}: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.isAdmin;

    return (
        <header className={cn(
            "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            className
        )}>
            <div className={cn("container flex h-16 items-center justify-between px-4 md:px-8", containerClassName)}>
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                    <Shield className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col">
                        <span className="text-base sm:text-lg font-bold font-serif tracking-tight leading-none">{title}</span>
                        {subtitle && <span className="hidden xs:block text-[9px] text-muted-foreground uppercase tracking-[0.2em] mt-1">{subtitle}</span>}
                    </div>
                </Link>
                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-4">
                    {showLinks && (
                        <>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/fortress-30" className="text-sm">Fortress 30</Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/investment-genie" className="text-sm">Investment Genie</Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/v5-extension" className="text-sm">V5 Extension</Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/intelligence" className="text-sm flex items-center gap-1.5">
                                    <Brain className="h-3.5 w-3.5 text-primary" />
                                    Intelligence
                                </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/macro" className="text-sm flex items-center gap-1.5">
                                    <Globe className="h-3.5 w-3.5 text-primary" />
                                    Market Pulse
                                </Link>
                            </Button>
                            {isAdmin && (
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/alpha" className="text-sm flex items-center gap-1.5 text-purple-400 hover:text-purple-300">
                                        <Target className="h-3.5 w-3.5" />
                                        Sovereign Alpha
                                    </Link>
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/guide" className="text-sm flex items-center gap-1.5">
                                    <BookMarked className="h-3.5 w-3.5 text-primary" />
                                    Guide
                                </Link>
                            </Button>
                        </>
                    )}
                    {showLinks && <MarketSelector size="sm" />}
                    {rightElement}
                    {!rightElement && showLinks && (
                        <Button variant="default" size="sm" asChild>
                            <Link href="/admin">Member Login</Link>
                        </Button>
                    )}
                </nav>

                {/* Mobile Toggle */}
                <div className="flex md:hidden items-center gap-4">
                    {rightElement}
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="relative z-50">
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-3/4 max-w-xs bg-background border-l z-50 md:hidden flex flex-col p-6 pt-20"
                        >
                            <div className="flex flex-col gap-4">
                                <Link
                                    href="/fortress-30"
                                    onClick={() => setIsOpen(false)}
                                    className="text-lg font-medium hover:text-primary transition-colors py-2 border-b border-border/50"
                                >
                                    Fortress 30
                                </Link>
                                <Link
                                    href="/investment-genie"
                                    onClick={() => setIsOpen(false)}
                                    className="text-lg font-medium hover:text-primary transition-colors py-2 border-b border-border/50"
                                >
                                    Investment Genie
                                </Link>
                                <Link
                                    href="/v5-extension"
                                    onClick={() => setIsOpen(false)}
                                    className="text-lg font-medium hover:text-primary transition-colors py-2 border-b border-border/50"
                                >
                                    V5 Extension
                                </Link>
                                <Link
                                    href="/intelligence"
                                    onClick={() => setIsOpen(false)}
                                    className="text-lg font-medium hover:text-primary transition-colors py-2 border-b border-border/50 flex items-center gap-2"
                                >
                                    <Brain className="h-4 w-4 text-primary" />
                                    Intelligence
                                </Link>
                                <Link
                                    href="/macro"
                                    onClick={() => setIsOpen(false)}
                                    className="text-lg font-medium hover:text-primary transition-colors py-2 border-b border-border/50 flex items-center gap-2"
                                >
                                    <Globe className="h-4 w-4 text-primary" />
                                    Market Pulse
                                </Link>
                                {isAdmin && (
                                    <Link
                                        href="/alpha"
                                        onClick={() => setIsOpen(false)}
                                        className="text-lg font-medium hover:text-purple-400 text-purple-400 transition-colors py-2 border-b border-border/50 flex items-center gap-2"
                                    >
                                        <Target className="h-4 w-4" />
                                        Sovereign Alpha
                                    </Link>
                                )}
                                <Link
                                    href="/guide"
                                    onClick={() => setIsOpen(false)}
                                    className="text-lg font-medium hover:text-primary transition-colors py-2 border-b border-border/50 flex items-center gap-2"
                                >
                                    <BookMarked className="h-4 w-4 text-primary" />
                                    Guide
                                </Link>
                                <Link
                                    href="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className="text-lg font-medium text-primary py-2"
                                >
                                    Member Login
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}
