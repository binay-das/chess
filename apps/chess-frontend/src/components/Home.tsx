import React from "react";
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

interface HomeProps {
  user: User | null;
}

export const Home: React.FC<HomeProps> = ({ user }) => {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0c0c0b] text-[#f5f2eb]">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-0 h-175 w-175 -translate-x-1/2 rounded-full bg-amber-500/[0.035] blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.035)_1px,transparent_0)] bg-size-[32px_32px]" />
      </div>

      <section
        id="play"
        className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 pb-24 pt-12 lg:grid-cols-2 lg:gap-12 lg:px-10 lg:pb-32 lg:pt-20"
      >
        <div className="max-w-xl">
          <h1 className="font-serif text-3xl leading-[0.92] tracking-[-0.045em] text-[#f4f0e7] sm:text-5xl lg:text-[5rem]">
            <span className="italic text-[#c7a96b]">Master</span> every move.
            <br />
            <span className="italic text-[#c7a96b]">Outthink</span> your opponent.
          </h1>

          <p className="mt-8 max-w-md text-base leading-7 text-white/45 sm:text-lg">
            A focused place to play serious chess. Find your opponent, make
            your move, and let the board speak for itself.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="group flex items-center gap-3 bg-[#e9e4d8] px-6 py-3.5 text-sm font-bold text-[#11110f] transition-all hover:bg-white"
              >
                Enter the board
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="group flex items-center gap-3 bg-[#e9e4d8] px-6 py-3.5 text-sm font-bold text-[#11110f] transition-all hover:bg-white"
                >
                  Start playing
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>

                <Link
                  to="/signin"
                  className="flex items-center gap-2 px-5 py-3.5 text-sm font-medium text-white/50 transition-colors hover:text-white"
                >
                  I have an account
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>

          <div className="mt-14 flex items-center gap-6 border-t border-white/8 pt-6">
            <div className="flex -space-x-2">
              {["A", "K", "M", "R"].map((letter, _index) => (
                <div
                  key={letter}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0c0c0b] bg-[#292925] text-[9px] font-bold text-white/60"
                >
                  {letter}
                </div>
              ))}
            </div>

            <div className="text-xs leading-4 text-white/35">
              <span className="font-semibold text-white/65">Play live.</span>
              <br />
              Every move counts.
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-155 lg:ml-auto">
          <div className="absolute -left-3 top-8 z-20 hidden -translate-x-full lg:block">
            <div className="mb-3 text-[9px] uppercase tracking-[0.3em] text-white/25">
              Live match
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 bg-[#c7a96b]/2.5 blur-3xl" />

            <div className="relative border border-white/9 bg-[#151513] p-3 shadow-2xl shadow-black/50 sm:p-4">
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Circle className="h-2.5 w-2.5 fill-emerald-400 text-emerald-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
                    Rated game
                  </span>
                </div>

                <span className="font-mono text-[10px] text-white/25">
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
                    },
                    darkSquareStyle: {
                      backgroundColor: "#769656",
                    },
                    lightSquareStyle: {
                      backgroundColor: "#eeeed2",
                    },
                  }}
                />
              </div>

              <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div>
                  <div className="text-xs font-semibold text-white/80">
                    Player 1
                  </div>
                  <div className="mt-0.5 text-[10px] text-white/25">
                    0.00 Elo
                  </div>
                </div>

                <div className="font-serif text-lg text-white/20">vs</div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-white/80">
                    Player 2
                  </div>
                  <div className="mt-0.5 text-[10px] text-white/25">
                    0.00 Elo
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -right-5 hidden w-36 border border-white/10 bg-[#181816] p-4 shadow-xl sm:block">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                  White
                </span>
                <Flame className="h-3.5 w-3.5 text-[#c7a96b]" />
              </div>

              <div className="font-mono text-2xl tracking-tight text-[#f4f0e7]">
                09:42
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="h-px bg-white/8" />
      </div>

      <section
        id="about"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32"
      >
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
          <div>
            <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c7a96b]">
              Built for the game
            </div>

            <h2 className="font-serif text-4xl leading-tight tracking-[-0.03em] text-white sm:text-5xl">
              Nothing between
              <br />
              you and the board.
            </h2>
          </div>

          <div className="flex flex-col justify-end">
            <p className="max-w-2xl text-xl leading-9 text-white/40">
              No noise. No clutter. Just a fast, focused chess experience
              designed around the part that matters most — the game.
            </p>

            <Link
              to={user ? "/dashboard" : "/signup"}
              className="group mt-8 flex w-fit items-center gap-3 border-b border-white/20 pb-2 text-sm font-semibold text-white transition-colors hover:border-[#c7a96b] hover:text-[#c7a96b]"
            >
              {user ? "Continue playing" : "Create your account"}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="border-y border-white/[0.07] bg-[#11110f]"
      >
        <div className="mx-auto grid max-w-7xl divide-y divide-white/[0.07] px-6 lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:px-10">
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
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/25">
          Your move
        </p>

        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-5xl tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
          The board is waiting.
        </h2>

        <Link
          to={user ? "/dashboard" : "/signup"}
          className="mt-9 inline-flex items-center gap-3 bg-[#e9e4d8] px-7 py-4 text-sm font-bold text-[#11110f] transition-all hover:bg-white"
        >
          {user ? "Play a game" : "Create account"}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="mx-auto flex max-w-7xl items-center justify-between border-t border-white/[0.07] px-6 py-8 text-[10px] uppercase tracking-[0.2em] text-white/20 lg:px-10">
        <span>Checkmate</span>
        <span>Built for the board</span>
      </footer>
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
        <div className="flex h-10 w-10 items-center justify-center border border-white/10 text-[#c7a96b]">
          {icon}
        </div>

        <span className="font-mono text-[10px] text-white/20">{number}</span>
      </div>

      <h3 className="mt-8 font-serif text-2xl tracking-tight text-white">
        {title}
      </h3>

      <p className="mt-3 max-w-xs text-sm leading-6 text-white/35">
        {description}
      </p>
    </div>
  );
};