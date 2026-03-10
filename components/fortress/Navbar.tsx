"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

    return (
        <header className={cn(
            "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            className
        )}>
            <div className={cn("container flex h-14 items-center justify-between px-4 sm:px-8", containerClassName)}>
                <Link href="/" className="flex items-center gap-2 group">
                    <Shield className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col">
                        <span className="text-lg font-bold font-serif tracking-tight leading-none">{title}</span>
                        {subtitle && <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1 block">{subtitle}</span>}
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
                                <Link href="/v5-extension" className="text-sm">V5 Extension</Link>
                            </Button>
                        </>
                    )}
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
                                    href="/v5-extension"
                                    onClick={() => setIsOpen(false)}
                                    className="text-lg font-medium hover:text-primary transition-colors py-2 border-b border-border/50"
                                >
                                    V5 Extension
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
