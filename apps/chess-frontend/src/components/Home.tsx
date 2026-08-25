import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import {
  ArrowUpRight,
  ChevronRight,
  Circle,
  Crown,
  Flame,
  Swords,
} from "lucide-react";
import type { User } from "../api/auth";
import { Footer } from "./Footer";

interface HomeProps {
  user: User | null;
}

export const Home: React.FC<HomeProps> = ({ user }) => {
  useEffect(() => {
    document.title = "ChessArena — Play Chess Online";
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-(--bg-main) text-(--text-primary) transition-colors duration-200">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-0 h-175 w-175 -translate-x-1/2 rounded-full bg-(--glow-amber) blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--dot-pattern)_1px,transparent_0)] bg-size-[32px_32px]" />
      </div>

      <section
        id="play"
        className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 pb-24 pt-12 lg:grid-cols-2 lg:gap-12 lg:px-10 lg:pb-32 lg:pt-20"
      >
        <div className="max-w-xl">
          <h1 className="font-serif text-3xl leading-[0.92] tracking-[-0.045em] text-(--text-heading) sm:text-5xl lg:text-[5rem]">
            <span className="italic text-(--accent-gold)">Master</span> every move.
            <br />
            <span className="italic text-(--accent-gold)">Outthink</span> your opponent.
          </h1>

          <p className="mt-8 max-w-md text-base leading-7 text-(--text-muted-45) sm:text-lg">
            A focused place to play serious chess. Find your opponent, make
            your move, and let the board speak for itself.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="group flex items-center gap-3 bg-(--btn-primary-bg) px-6 py-3.5 text-sm font-bold text-(--btn-primary-text) transition-all hover:bg-(--btn-primary-hover)"
              >
                Enter the board
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="group flex items-center gap-3 bg-(--btn-primary-bg) px-6 py-3.5 text-sm font-bold text-(--btn-primary-text) transition-all hover:bg-(--btn-primary-hover)"
                >
                  Start playing
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>

                <Link
                  to="/signin"
                  className="flex items-center gap-2 px-5 py-3.5 text-sm font-medium text-(--text-muted-50) transition-colors hover:text-(--text-primary)"
                >
                  I have an account
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>

          <div className="mt-14 flex items-center gap-6 border-t border-(--border-8) pt-6">
            <div className="flex -space-x-2">
              {["A", "K", "M", "R"].map((letter) => (
                <div
                  key={letter}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-(--bg-main) bg-(--avatar-bg) text-[9px] font-bold text-(--text-muted-60)"
                >
                  {letter}
                </div>
              ))}
            </div>

            <div className="text-xs leading-4 text-(--text-muted-35)">
              <span className="font-semibold text-(--text-muted-65)">Play live.</span>
              <br />
              Every move counts.
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-155 lg:ml-auto">
          <div className="absolute -left-3 top-8 z-20 hidden -translate-x-full lg:block">
            <div className="mb-3 text-[9px] uppercase tracking-[0.3em] text-(--text-muted-25)">
              Live match
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 bg-(--accent-gold)/5 blur-3xl" />

            <div className="relative border border-(--border-9) bg-(--bg-surface-2) p-3 shadow-2xl sm:p-4">
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Circle className="h-2.5 w-2.5 fill-emerald-400 text-emerald-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-(--text-muted-40)">
                    Rated game
                  </span>
                </div>

                <span className="font-mono text-[10px] text-(--text-muted-25)">
                  10 + 0
                </span>
              </div>

              <div className="overflow-hidden">
                <Chessboard
                  options={{
                    position:
                      "r1bq1rk1/ppp2ppp/2np1n2/8/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 0 1",
                    boardStyle: {
                      width: "100%",
                      boxShadow: "var(--board-shadow)",
                    }
                  }}
                />
              </div>

              <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div>
                  <div className="text-xs font-semibold text-(--text-muted-80)">
                    Player 1
                  </div>
                  <div className="mt-0.5 text-[10px] text-(--text-muted-25)">
                    0.00 Elo
                  </div>
                </div>

                <div className="font-serif text-lg text-(--text-muted-20)">vs</div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-(--text-muted-80)">
                    Player 2
                  </div>
                  <div className="mt-0.5 text-[10px] text-(--text-muted-25)">
                    0.00 Elo
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -right-5 hidden w-36 border border-(--border-10) bg-(--bg-surface-3) p-4 shadow-xl sm:block">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-[0.2em] text-(--text-muted-30)">
                  White
                </span>
                <Flame className="h-3.5 w-3.5 text-(--accent-gold)" />
              </div>

              <div className="font-mono text-2xl tracking-tight text-(--text-heading)">
                09:42
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="h-px bg-(--border-8)" />
      </div>

      <section
        id="about"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32"
      >
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
          <div>
            <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-(--accent-gold)">
              Built for the game
            </div>

            <h2 className="font-serif text-4xl leading-tight tracking-[-0.03em] text-(--text-heading) sm:text-5xl">
              Nothing between
              <br />
              you and the board.
            </h2>
          </div>

          <div className="flex flex-col justify-end">
            <p className="max-w-2xl text-xl leading-9 text-(--text-muted-40)">
              No noise. No clutter. Just a fast, focused chess experience
              designed around the part that matters most — the game.
            </p>

            <Link
              to={user ? "/dashboard" : "/signup"}
              className="group mt-8 flex w-fit items-center gap-3 border-b border-(--border-20) pb-2 text-sm font-semibold text-(--text-primary) transition-colors hover:border-(--accent-gold) hover:text-(--accent-gold)"
            >
              {user ? "Continue playing" : "Create your account"}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="border-y border-(--border-10) bg-(--bg-surface-1)"
      >
        <div className="mx-auto grid max-w-7xl divide-y divide-(--border-10) px-6 lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:px-10">
          <Feature
            number="01"
            icon={<Swords className="h-5 w-5" />}
            title="Play instantly"
            description="Jump into a live game without fighting through menus."
          />

          <Feature
            number="02"
            icon={<Flame className="h-5 w-5" />}
            title="Play in real time"
            description="Moves arrive instantly. Your opponent is always one move away."
          />

          <Feature
            number="03"
            icon={<Crown className="h-5 w-5" />}
            title="Build your rating"
            description="Every game is part of the climb. Win, learn, improve."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-10 lg:py-32">
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-(--text-muted-25)">
          Your move
        </p>

        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-5xl tracking-[-0.04em] text-(--text-heading) sm:text-6xl lg:text-7xl">
          The board is waiting.
        </h2>

        <Link
          to={user ? "/dashboard" : "/signup"}
          className="mt-9 inline-flex items-center gap-3 bg-(--btn-primary-bg) px-7 py-4 text-sm font-bold text-(--btn-primary-text) transition-all hover:bg-(--btn-primary-hover)"
        >
          {user ? "Play a game" : "Create account"}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </section>

      <Footer />
    </main>
  );
};

interface FeatureProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Feature: React.FC<FeatureProps> = ({
  number,
  icon,
  title,
  description,
}) => {
  return (
    <div className="group px-0 py-10 lg:px-10 lg:py-14">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center border border-(--border-10) text-(--accent-gold)">
          {icon}
        </div>

        <span className="font-mono text-[10px] text-(--text-muted-20)">{number}</span>
      </div>

      <h3 className="mt-8 font-serif text-2xl tracking-tight text-(--text-heading)">
        {title}
      </h3>

      <p className="mt-3 max-w-xs text-sm leading-6 text-(--text-muted-35)">
        {description}
      </p>
    </div>
  );
};