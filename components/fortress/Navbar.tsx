"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X, Brain, Globe, BookMarked, Target, ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { MarketSelector } from "@/components/ui/MarketSelector";
import { LogOut, LayoutDashboard } from "lucide-react";

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
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const { data: session, status } = useSession();
    const isAdmin = (session?.user as any)?.isAdmin;
    const isLoggedIn = status === "authenticated";

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
                <nav className="hidden md:flex items-center gap-1">
                    {showLinks && (
                        <>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/fortress-30">Fortress 30</Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/investment-genie">Investment Genie</Link>
                            </Button>
                            {isLoggedIn && (
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/portfolio">My Portfolio</Link>
                                </Button>
                            )}
                            {/* Advanced Tools Dropdown */}
                            <div className="relative group">
                                <Button variant="ghost" size="sm" className="gap-1">
                                    <span>Advanced Tools</span>
                                    <ChevronDown className="h-3.5 w-3.5" />
                                </Button>
                                <div className="absolute left-0 mt-0 w-48 bg-background border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                    <Button variant="ghost" size="sm" asChild className="w-full justify-start rounded-none">
                                        <Link href="/intelligence" className="gap-2">
                                            <Brain className="h-4 w-4 text-primary" />
                                            Intelligence
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" size="sm" asChild className="w-full justify-start rounded-none">
                                        <Link href="/macro" className="gap-2">
                                            <Globe className="h-4 w-4 text-primary" />
                                            Market Pulse
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" size="sm" asChild className="w-full justify-start rounded-none">
                                        <Link href="/v5-extension" className="gap-2">
                                            <Target className="h-4 w-4 text-primary" />
                                            Deep Value Scanner
                                        </Link>
                                    </Button>
                                    {isAdmin && (
                                        <Button variant="ghost" size="sm" asChild className="w-full justify-start rounded-none text-purple-400">
                                            <Link href="/alpha" className="gap-2">
                                                <Target className="h-4 w-4" />
                                                Sovereign Alpha
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/guide" className="gap-1.5">
                                    <BookMarked className="h-3.5 w-3.5 text-primary" />
                                    Guide
                                </Link>
                            </Button>
                        </>
                    )}
                    {showLinks && <div className="w-px h-6 bg-border/50 mx-2" />}
                    {showLinks && <MarketSelector size="sm" />}
                    {rightElement}
                    {!rightElement && showLinks && (
                        <div className="flex items-center gap-2">
                            {isLoggedIn ? (
                                <>
                                    <Button variant="ghost" size="sm" asChild className="hidden lg:flex">
                                        <Link href="/admin" className="gap-2">
                                            <LayoutDashboard className="h-4 w-4" />
                                            Dashboard
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => signOut()} className="gap-2 border-primary/20 hover:bg-primary/5">
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <Button variant="default" size="sm" asChild>
                                    <Link href="/login">Sign In</Link>
                                </Button>
                            )}
                        </div>
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
                            className="fixed right-0 top-0 bottom-0 w-3/4 max-w-xs bg-background border-l z-50 md:hidden flex flex-col p-6 pt-20 overflow-y-auto"
                        >
                            <div className="flex flex-col gap-2">
                                {showLinks && (
                                    <>
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Market</div>
                                        <MarketSelector size="md" className="w-full mb-4" />
                                        <div className="h-px bg-border/50 my-2" />
                                    </>
                                )}
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
                                {isLoggedIn && (
                                    <Link
                                        href="/portfolio"
                                        onClick={() => setIsOpen(false)}
                                        className="text-lg font-medium hover:text-primary transition-colors py-2 border-b border-border/50"
                                    >
                                        My Portfolio
                                    </Link>
                                )}
                                <button
                                    onClick={() => setAdvancedOpen(!advancedOpen)}
                                    className="text-lg font-medium hover:text-primary transition-colors py-2 border-b border-border/50 flex items-center justify-between"
                                >
                                    Advanced Tools
                                    <ChevronDown className={cn("h-4 w-4 transition-transform", advancedOpen && "rotate-180")} />
                                </button>
                                {advancedOpen && (
                                    <>
                                        <Link href="/intelligence" onClick={() => setIsOpen(false)} className="text-base hover:text-primary py-2 pl-4 border-b border-border/50 flex items-center gap-2">
                                            <Brain className="h-4 w-4 text-primary" />
                                            Intelligence
                                        </Link>
                                        <Link href="/macro" onClick={() => setIsOpen(false)} className="text-base hover:text-primary py-2 pl-4 border-b border-border/50 flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-primary" />
                                            Market Pulse
                                        </Link>
                                        <Link href="/v5-extension" onClick={() => setIsOpen(false)} className="text-base hover:text-primary py-2 pl-4 border-b border-border/50 flex items-center gap-2">
                                            <Target className="h-4 w-4 text-primary" />
                                            Deep Value Scanner
                                        </Link>
                                        {isAdmin && (
                                            <Link href="/alpha" onClick={() => setIsOpen(false)} className="text-base hover:text-purple-400 text-purple-400 py-2 pl-4 border-b border-border/50 flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Sovereign Alpha
                                            </Link>
                                        )}
                                    </>
                                )}
                                <Link href="/guide" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-primary py-2 border-b border-border/50 flex items-center gap-2">
                                    <BookMarked className="h-4 w-4 text-primary" />
                                    Guide
                                </Link>
                                {isLoggedIn ? (
                                    <>
                                        <Link href="/admin" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-primary py-2 border-b border-border/50 flex items-center gap-2">
                                            <LayoutDashboard className="h-4 w-4 text-primary" />
                                            Dashboard
                                        </Link>
                                        <button onClick={() => { setIsOpen(false); signOut(); }} className="text-lg font-medium text-red-400 hover:text-red-300 py-2 flex items-center gap-2 text-left">
                                            <LogOut className="h-4 w-4" />
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link href="/login" onClick={() => setIsOpen(false)} className="text-lg font-medium text-primary py-2">
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}
