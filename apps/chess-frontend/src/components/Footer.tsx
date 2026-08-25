import React from "react";
import { Link } from "react-router-dom";
import { Crown, ArrowUpRight, Heart } from "lucide-react";

export const Footer: React.FC = () => {
    return (
        <footer className="border-t border-white/8 bg-[#0c0c0b] text-[#f5f2eb]">
            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
                <div className="flex flex-col justify-between gap-10 md:flex-row md:items-start">
                    <div className="max-w-md">
                        <Link to="/" className="group flex items-center gap-3.5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white transition-colors group-hover:bg-white group-hover:text-zinc-950">
                                <Crown className="h-6 w-6" strokeWidth={2} />
                            </div>
                            <span className="font-extrabold text-3xl sm:text-4xl tracking-tight text-white">
                                ChessArena
                            </span>
                        </Link>

                        <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/50">
                            A real-time chess platform built for speed, focus, and competitive play.
                        </p>
                    </div>

                    <div>
                        <div className="mb-4 text-sm font-bold text-white/80">
                            Project
                        </div>
                        <ul className="space-y-3 text-sm sm:text-base text-white/50">
                            <li>
                                <a
                                    href="https://github.com/binay-das/chess"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-2 transition-colors hover:text-white"
                                >
                                    <span>GitHub repository</span>
                                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 text-sm text-white/40 sm:flex-row">
                    <div>
                        &copy; {new Date().getFullYear()} ChessArena
                    </div>

                    <a
                        href="https://github.com/binay-das"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 text-white/50 transition-colors hover:text-white"
                    >
                        <span>Made with</span>
                        <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                        <span>by</span>
                        <span className="font-semibold text-white/90 transition-colors group-hover:text-white">
                            Binay
                        </span>
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                </div>
            </div>
        </footer>
    );
};