import React, { useEffect, useRef, useState } from 'react';
import { ActiveMiniGameState, GameSessionState, MiniGameCategory } from '../types/game';
import {
  CategoryBadgeArtwork,
  ClubCrestArtwork,
  EmojiBadgeArtwork,
  NationFlagArtwork,
  PlayerPortraitArtwork,
} from './BroadcastArtwork';

function formatCountdown(seconds: number): string {
  const clamped = Math.max(0, Math.min(99, Math.floor(seconds)));
  const ss = String(clamped).padStart(2, '0');
  return `00:${ss}`;
}

export const StudioStageView: React.FC<{
  state: GameSessionState;
  isPreview?: boolean;
}> = ({ state, isPreview = false }) => {
  const [pulseTeam, setPulseTeam] = useState<'red' | 'blue' | null>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());

  // Broadcast Open / Close Mini-Game Transition State
  const [renderedMiniGame, setRenderedMiniGame] = useState<ActiveMiniGameState | null>(
    state.stage === 'minigame' && state.activeMiniGame ? state.activeMiniGame : null
  );
  const [stageAnim, setStageAnim] = useState<'idle' | 'opening' | 'closing' | 'board-enter'>('idle');
  const [isDealingBoard, setIsDealingBoard] = useState(false);
  const [stingerInfo, setStingerInfo] = useState<{
    mode: 'open' | 'close';
    title: string;
    subtitle: string;
    category?: MiniGameCategory;
    key: number;
  } | null>(null);

  const prevStageRef = useRef<'board' | 'minigame'>(state.stage);
  const prevDeckIdRef = useRef<number>(state.boardDeckId || 1);

  // Synchronize open & close animations when entering or leaving any mini-game
  useEffect(() => {
    const isNowMiniGame = state.stage === 'minigame' && Boolean(state.activeMiniGame);
    const wasMiniGame = prevStageRef.current === 'minigame';

    if (isNowMiniGame && state.activeMiniGame) {
      setRenderedMiniGame(state.activeMiniGame);

      if (!wasMiniGame) {
        prevStageRef.current = 'minigame';
        setStageAnim('opening');
        setStingerInfo({
          mode: 'open',
          title: state.activeMiniGame.categoryTitle.toUpperCase(),
          subtitle: `OPENING CARD #${state.activeMiniGame.cardNumber} CHALLENGE`,
          category: state.activeMiniGame.category,
          key: Date.now(),
        });

        const openTimer = setTimeout(() => {
          setStageAnim('idle');
          setStingerInfo(null);
        }, 620);
        return () => clearTimeout(openTimer);
      }
      return;
    }

    if (!isNowMiniGame && wasMiniGame) {
      prevStageRef.current = 'board';
      setStageAnim('closing');
      setStingerInfo({
        mode: 'close',
        title: 'BACK TO MAIN BOARD',
        subtitle: 'RESETTING EMOJI COVERS & SHUFFLING SPORTS',
        key: Date.now(),
      });

      const closeTimer = setTimeout(() => {
        setRenderedMiniGame(null);
        setIsDealingBoard(true);
        setStageAnim('board-enter');
      }, 360);

      const finishTimer = setTimeout(() => {
        setStageAnim('idle');
        setIsDealingBoard(false);
        setStingerInfo(null);
      }, 920);

      return () => {
        clearTimeout(closeTimer);
        clearTimeout(finishTimer);
      };
    }
  }, [state.stage, state.activeMiniGame]);

  // Trigger brief card deal animation ONLY when Shuffle Sports or New Game explicitly increments boardDeckId
  useEffect(() => {
    const currentDeckId = state.boardDeckId || 1;
    if (currentDeckId !== prevDeckIdRef.current) {
      prevDeckIdRef.current = currentDeckId;
      if (state.stage === 'board') {
        setIsDealingBoard(true);
        const timer = setTimeout(() => setIsDealingBoard(false), 620);
        return () => clearTimeout(timer);
      }
    }
  }, [state.boardDeckId, state.stage]);

  // Track score pulse animation
  useEffect(() => {
    if (!state.lastScorePulse) return;
    const elapsed = Date.now() - state.lastScorePulse.timestamp;
    if (elapsed < 2000) {
      setPulseTeam(state.lastScorePulse.team);
      const timer = setTimeout(() => setPulseTeam(null), 1200);
      return () => clearTimeout(timer);
    }
  }, [state.lastScorePulse]);

  // Reset broken image fallback state when snapshot media changes
  useEffect(() => {
    setImgFailed(false);
  }, [renderedMiniGame?.snapshot?.mediaUrl]);

  // Auto-expire temporary "Not Accepted" Tic-Tac-Toe feedback after 3.5s without unconditional 500ms re-renders
  const rejectedTimestamp =
    state.stage === 'minigame'
      ? state.activeMiniGame?.ticTacToe?.rejectedFeedback?.timestamp
      : renderedMiniGame?.ticTacToe?.rejectedFeedback?.timestamp;

  useEffect(() => {
    if (!rejectedTimestamp) return;
    setNowTick(Date.now());
    const remaining = Math.max(0, 3550 - (Date.now() - rejectedTimestamp));
    const timer = setTimeout(() => setNowTick(Date.now()), remaining);
    return () => clearTimeout(timer);
  }, [rejectedTimestamp]);

  const mg = state.stage === 'minigame' ? state.activeMiniGame : renderedMiniGame;
  const showBoard = state.stage === 'board' && stageAnim !== 'closing';
  const activeTeam =
    mg?.category === 'tictactoe' && mg.ticTacToe ? mg.ticTacToe.turn : state.activeTeam;

  return (
    <div
      className={`relative w-full h-full bg-[#030914] text-white overflow-hidden flex flex-col justify-between ${
        isPreview
          ? 'p-3 rounded-xl border border-slate-800 select-none'
          : 'p-3 sm:p-5 lg:p-7 select-none'
      }`}
    >
      {/* Subtle Stadium Floodlight Radial Glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(circle at 18% 12%, rgba(239,68,68,0.16), transparent 42%), radial-gradient(circle at 82% 12%, rgba(56,189,248,0.16), transparent 42%), radial-gradient(circle at 50% 85%, rgba(245,158,11,0.08), transparent 50%)',
        }}
      />

      {/* BROADCAST STINGER SWEEP OVERLAY ON MINI-GAME OPEN / CLOSE */}
      {stingerInfo && (
        <div
          key={stingerInfo.key}
          className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center overflow-hidden"
        >
          <div
            className={`animate-stinger-sweep w-full py-6 flex items-center justify-center gap-4 border-y-2 shadow-2xl ${
              stingerInfo.mode === 'open'
                ? 'bg-gradient-to-r from-transparent via-[#081326]/95 to-transparent border-[#F59E0B]'
                : 'bg-gradient-to-r from-transparent via-[#0C2447]/95 to-transparent border-[#38BDF8]'
            }`}
          >
            {stingerInfo.category && (
              <CategoryBadgeArtwork
                category={stingerInfo.category}
                className={isPreview ? 'w-8 h-8' : 'w-16 h-16'}
              />
            )}
            <div className="text-center">
              <div
                className={`font-['Plus_Jakarta_Sans'] font-extrabold tracking-widest uppercase ${
                  stingerInfo.mode === 'open' ? 'text-[#F59E0B]' : 'text-[#38BDF8]'
                } ${isPreview ? 'text-[8px]' : 'text-xs lg:text-sm'}`}
              >
                {stingerInfo.subtitle}
              </div>
              <div
                className={`font-['Outfit'] font-black tracking-wide text-white ${
                  isPreview ? 'text-xs' : 'text-2xl lg:text-4xl'
                }`}
              >
                {stingerInfo.title}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOP BROADCAST SCOREBOARD BAR */}
      <div
        className={`relative z-10 grid grid-cols-12 items-center ${
          isPreview ? 'gap-2 mb-2' : 'gap-6 mb-[2.2vh]'
        }`}
      >
        {/* RED TEAM SCOREBOARD (LEFT) */}
        <div
          className={`col-span-4 relative rounded-2xl bg-[#081326]/95 transition-all duration-200 overflow-hidden ${
            isPreview ? 'px-3 py-2 border' : 'px-5 sm:px-6 py-3 border-2'
          } ${
            activeTeam === 'red'
              ? 'border-[#EF4444] shadow-[0_0_36px_rgba(239,68,68,0.45)]'
              : 'border-slate-800/90 opacity-85'
          }`}
        >
          {/* Floating Score Award Burst */}
          {pulseTeam === 'red' && (
            <span className="absolute -top-1.5 right-6 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs font-['Outfit'] animate-score-pulse shadow-[0_0_20px_rgba(245,158,11,0.8)] z-30">
              +{state.lastScorePulse?.delta || 1} PTS
            </span>
          )}
          {/* Animated Active Team Indicator Bar */}
          {activeTeam === 'red' && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#EF4444] via-amber-400 to-[#EF4444]" />
          )}
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-['Outfit'] font-black tracking-wider text-white ${
                    isPreview ? 'text-xs' : 'text-xl sm:text-2xl lg:text-3xl'
                  }`}
                >
                  RED TEAM
                </span>
              </div>
              <p
                className={`text-red-300 font-semibold ${
                  isPreview ? 'text-[9px]' : 'text-xs lg:text-sm'
                }`}
              >
                {activeTeam === 'red' ? 'ACTIVE TURN · ON STAGE' : 'STANDBY'}
              </p>
            </div>
            <div
              className={`font-['JetBrains_Mono'] font-extrabold tabular-nums transition-transform duration-200 ${
                isPreview ? 'text-xl px-2 py-0.5' : 'text-3xl sm:text-4xl lg:text-6xl px-4 py-1'
              } rounded-xl bg-red-950/70 border border-red-500/40 text-red-400 ${
                pulseTeam === 'red' ? 'scale-125 bg-red-500 text-white animate-score-pulse' : 'scale-100'
              }`}
            >
              {state.redScore ?? 0}
            </div>
          </div>
        </div>

        {/* CENTER SHOW TITLE & ROUND STATUS */}
        <div className="col-span-4 flex flex-col items-center justify-center text-center">
          <div
            className={`font-['Outfit'] font-black tracking-tight text-white flex items-center gap-2 ${
              isPreview ? 'text-sm' : 'text-2xl sm:text-3xl lg:text-4xl'
            }`}
          >
            <span className="text-[#F59E0B]">FANZONE</span>
            <span>LIVE</span>
          </div>
          <div
            className={`mt-1 font-['Plus_Jakarta_Sans'] font-semibold text-slate-300 tracking-wide ${
              isPreview ? 'text-[10px]' : 'text-xs sm:text-sm lg:text-base'
            }`}
          >
            {showBoard || !mg
              ? `MAIN REVEAL BOARD · CARD #${state.selectedCardNumber}`
              : `CARD #${mg.cardNumber} · ${mg.categoryTitle.toUpperCase()}`}
          </div>
        </div>

        {/* BLUE TEAM SCOREBOARD (RIGHT) */}
        <div
          className={`col-span-4 relative rounded-2xl bg-[#081326]/95 transition-all duration-200 overflow-hidden ${
            isPreview ? 'px-3 py-2 border' : 'px-5 sm:px-6 py-3 border-2'
          } ${
            activeTeam === 'blue'
              ? 'border-[#38BDF8] shadow-[0_0_36px_rgba(56,189,248,0.45)]'
              : 'border-slate-800/90 opacity-85'
          }`}
        >
          {/* Floating Score Award Burst */}
          {pulseTeam === 'blue' && (
            <span className="absolute -top-1.5 left-6 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs font-['Outfit'] animate-score-pulse shadow-[0_0_20px_rgba(245,158,11,0.8)] z-30">
              +{state.lastScorePulse?.delta || 1} PTS
            </span>
          )}
          {/* Animated Active Team Indicator Bar */}
          {activeTeam === 'blue' && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#38BDF8] via-amber-400 to-[#38BDF8]" />
          )}
          <div className="flex items-center justify-between gap-2">
            <div
              className={`font-['JetBrains_Mono'] font-extrabold tabular-nums transition-transform duration-200 ${
                isPreview ? 'text-xl px-2 py-0.5' : 'text-3xl sm:text-4xl lg:text-6xl px-4 py-1'
              } rounded-xl bg-sky-950/70 border border-sky-400/40 text-sky-300 ${
                pulseTeam === 'blue' ? 'scale-125 bg-sky-400 text-slate-950 animate-score-pulse' : 'scale-100'
              }`}
            >
              {state.blueScore ?? 0}
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span
                  className={`font-['Outfit'] font-black tracking-wider text-white ${
                    isPreview ? 'text-xs' : 'text-xl sm:text-2xl lg:text-3xl'
                  }`}
                >
                  BLUE TEAM
                </span>
              </div>
              <p
                className={`text-sky-300 font-semibold ${
                  isPreview ? 'text-[9px]' : 'text-xs lg:text-sm'
                }`}
              >
                {activeTeam === 'blue' ? 'ACTIVE TURN · ON STAGE' : 'STANDBY'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN STAGE BODY: 2x4 REVEAL BOARD OR ACTIVE MINI GAME WITH OPEN/CLOSE ANIMATIONS */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-center">
        {showBoard || !mg ? (
          /* 2 ROWS x 4 COLUMNS MAIN REVEAL BOARD */
          <div
            className={`w-full h-full grid grid-cols-4 grid-rows-2 ${
              isPreview ? 'gap-2' : 'gap-5 lg:gap-7'
            } ${stageAnim === 'board-enter' ? 'animate-board-return' : ''}`}
          >
            {(state.cards || []).map((card, idx) => {
              const revealedCard = (state.cards || []).find((c) => c.revealed);
              const isLockedByPick = Boolean(
                revealedCard && revealedCard.cardNumber !== card.cardNumber
              );
              const isSelected = state.selectedCardNumber === card.cardNumber;
              return (
                <div
                  key={card.cardNumber}
                  className={`relative w-full h-full ${
                    isDealingBoard ? 'animate-card-deal' : ''
                  }`}
                  style={{
                    perspective: '1200px',
                    WebkitPerspective: '1200px',
                    animationDelay: isDealingBoard ? `${idx * 45}ms` : undefined,
                  }}
                >
                  <div
                    className="relative w-full h-full"
                    style={{
                      transformStyle: 'preserve-3d',
                      WebkitTransformStyle: 'preserve-3d',
                      transition: 'transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transform: card.revealed
                        ? 'rotateY(180deg) scale(1.02)'
                        : isLockedByPick
                        ? 'rotateY(0deg) scale(0.97)'
                        : isSelected
                        ? 'rotateY(0deg) scale(1.015)'
                        : 'rotateY(0deg) scale(1)',
                    }}
                  >
                    {/* FRONT OF CARD: FIXED EMOJI COVER */}
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-b from-[#0E1E38] to-[#081326] flex flex-col items-center justify-between transition-opacity duration-300 ${
                        isPreview ? 'p-2 border' : 'p-4 lg:p-6 border-2'
                      } ${
                        isLockedByPick
                          ? 'border-slate-800/70 opacity-45 grayscale-[60%]'
                          : isSelected
                          ? 'border-[#F59E0B] shadow-[0_0_28px_rgba(245,158,11,0.38)] opacity-100'
                          : 'border-slate-700/80 opacity-100'
                      }`}
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(0deg) translateZ(2px)',
                      }}
                    >
                      <div className="w-full flex items-center justify-between">
                        <span
                          className={`font-['JetBrains_Mono'] font-extrabold tabular-nums ${
                            isPreview ? 'text-[10px]' : 'text-base lg:text-xl'
                          } ${isSelected ? 'text-[#F59E0B]' : 'text-slate-400'}`}
                        >
                          #{card.cardNumber}
                        </span>
                        {isLockedByPick ? (
                          <span
                            className={`font-['Outfit'] font-bold tracking-wider uppercase text-slate-400 ${
                              isPreview ? 'text-[8px]' : 'text-xs'
                            }`}
                          >
                            LOCKED
                          </span>
                        ) : (
                          card.scored && (
                            <span
                              className={`font-['Outfit'] font-bold ${
                                isPreview ? 'text-[8px]' : 'text-xs'
                              } ${
                                card.scoreResult === 'correct'
                                  ? card.awardedTeam === 'red'
                                    ? 'text-red-400'
                                    : 'text-sky-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {card.scoreResult === 'correct'
                                ? `+1 ${card.awardedTeam?.toUpperCase()}`
                                : 'PLAYED'}
                            </span>
                          )
                        )}
                      </div>

                      <div className="flex-1 flex items-center justify-center my-1">
                        <EmojiBadgeArtwork
                          emojiId={card.emojiId}
                          className={
                            isPreview
                              ? 'w-12 h-12'
                              : 'w-24 h-24 md:w-28 md:h-28 lg:w-36 lg:h-36 drop-shadow-xl'
                          }
                        />
                      </div>

                      <div
                        className={`font-['Outfit'] font-bold tracking-wide text-slate-200 ${
                          isPreview ? 'text-[9px]' : 'text-sm lg:text-lg'
                        }`}
                      >
                        {card.emojiLabel}
                      </div>
                    </div>

                    {/* BACK OF CARD: SHUFFLED SPORTS CATEGORY */}
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-b from-[#0C2447] via-[#091933] to-[#061021] flex flex-col items-center justify-between ${
                        isPreview ? 'p-2 border' : 'p-4 lg:p-6 border-2'
                      } ${
                        isSelected
                          ? 'border-[#F59E0B] shadow-[0_0_32px_rgba(245,158,11,0.45)]'
                          : 'border-sky-400/60'
                      }`}
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg) translateZ(2px)',
                      }}
                    >
                      <div className="w-full flex items-center justify-between">
                        <span
                          className={`font-['JetBrains_Mono'] font-extrabold tabular-nums text-[#F59E0B] ${
                            isPreview ? 'text-[10px]' : 'text-base lg:text-xl'
                          }`}
                        >
                          #{card.cardNumber}
                        </span>
                        <span
                          className={`font-['Plus_Jakarta_Sans'] font-bold ${
                            isPreview ? 'text-[8px]' : 'text-xs'
                          } ${
                            card.scored
                              ? card.scoreResult === 'correct'
                                ? 'text-emerald-400'
                                : 'text-amber-300'
                              : 'text-sky-300'
                          }`}
                        >
                          {card.scored
                            ? card.scoreResult === 'correct'
                              ? `WON BY ${card.awardedTeam?.toUpperCase()}`
                              : 'COMPLETED'
                            : 'REVEALED'}
                        </span>
                      </div>

                      <div className="flex-1 flex items-center justify-center my-1">
                        <CategoryBadgeArtwork
                          category={card.category}
                          className={
                            isPreview
                              ? 'w-12 h-12'
                              : 'w-24 h-24 md:w-28 md:h-28 lg:w-36 lg:h-36 drop-shadow-xl'
                          }
                        />
                      </div>

                      <div
                        className={`font-['Outfit'] font-extrabold text-center text-white leading-tight ${
                          isPreview ? 'text-[9px]' : 'text-base lg:text-xl'
                        }`}
                      >
                        {card.categoryTitle}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ANIMATED MINI-GAME STAGE WRAPPER (OPEN & CLOSE TRANSITIONS) */
          <div
            key={`minigame-${mg.cardNumber}-${mg.category}`}
            className={`w-full h-full ${
              stageAnim === 'closing' ? 'animate-minigame-close' : 'animate-minigame-open'
            }`}
          >
            {mg.category === 'tictactoe' && mg.ticTacToe ? (
              /* MINI GAME D: FOOTBALL TIC-TAC-TOE (4x4 BROADCAST GRID WITH CLUB & NATION LOGOS) */
              <div className="w-full h-full flex flex-col justify-between gap-2">
                {/* Turn & Winner Status Strip */}
                <div className="flex items-center justify-between bg-[#081326] border border-slate-800 rounded-xl px-4 py-2">
                  <div className="flex items-center gap-3">
                    <CategoryBadgeArtwork
                      category="tictactoe"
                      className={isPreview ? 'w-6 h-6' : 'w-10 h-10'}
                    />
                    <div>
                      <h2
                        className={`font-['Outfit'] font-extrabold text-white ${
                          isPreview ? 'text-xs' : 'text-xl lg:text-2xl'
                        }`}
                      >
                        FOOTBALL TIC-TAC-TOE
                      </h2>
                      <p
                        className={`text-slate-400 ${
                          isPreview ? 'text-[8px]' : 'text-xs lg:text-sm'
                        }`}
                      >
                        Name a footballer who played for both the column’s Club and the row’s Club
                      </p>
                    </div>
                  </div>

                  {mg.ticTacToe.winner ? (
                    <div
                      className={`rounded-xl font-['Outfit'] font-black tracking-wide animate-answer-reveal ${
                        isPreview ? 'px-2.5 py-1 text-xs' : 'px-6 py-2.5 text-xl lg:text-2xl'
                      } ${
                        mg.ticTacToe.winner === 'red'
                          ? 'bg-[#EF4444] text-white shadow-[0_0_25px_rgba(239,68,68,0.5)]'
                          : mg.ticTacToe.winner === 'blue'
                          ? 'bg-[#38BDF8] text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.5)]'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {mg.ticTacToe.winner === 'draw'
                        ? 'GRID COMPLETE · DRAW'
                        : `${mg.ticTacToe.winner.toUpperCase()} TEAM WINS (+1 PT)`}
                    </div>
                  ) : (
                    <div
                      className={`rounded-xl font-['Outfit'] font-extrabold tracking-wide border ${
                        isPreview ? 'px-2.5 py-1 text-[10px]' : 'px-5 py-2 text-lg lg:text-xl'
                      } ${
                        mg.ticTacToe.turn === 'red'
                          ? 'bg-red-500/20 border-[#EF4444] text-red-300'
                          : 'bg-sky-500/20 border-[#38BDF8] text-sky-300'
                      }`}
                    >
                      CURRENT TURN: {mg.ticTacToe.turn.toUpperCase()} TEAM
                    </div>
                  )}
                </div>

                {/* 4x4 Broadcast Matrix */}
                <div
                  className={`flex-1 min-h-0 grid grid-cols-4 grid-rows-4 ${
                    isPreview ? 'gap-1.5' : 'gap-3 lg:gap-4'
                  }`}
                >
                  {/* Top-Left Corner Legend Cell */}
                  <div className="rounded-xl bg-[#081326] border border-slate-800 flex flex-col items-center justify-center p-2 text-center">
                    <span
                      className={`font-['Outfit'] font-bold text-amber-400 ${
                        isPreview ? 'text-[8px]' : 'text-xs lg:text-sm'
                      }`}
                    >
                      CLUBS →
                    </span>
                    <div className="w-8 h-px bg-slate-700 my-1" />
                    <span
                      className={`font-['Outfit'] font-bold text-sky-300 ${
                        isPreview ? 'text-[8px]' : 'text-xs lg:text-sm'
                      }`}
                    >
                      ↓ CLUBS
                    </span>
                  </div>

                  {/* Top Row: 3 Club Column Headers */}
                  {(mg.ticTacToe.clubs || []).map((club) => (
                    <div
                      key={club.id}
                      className="rounded-xl bg-[#081326] border border-slate-700/80 flex items-center justify-center gap-3 px-3 py-2"
                    >
                      <ClubCrestArtwork
                        clubId={club.id}
                        logoUrl={club.logoUrl}
                        className={
                          isPreview ? 'w-6 h-6 shrink-0' : 'w-12 h-12 lg:w-14 lg:h-14 shrink-0'
                        }
                      />
                      <span
                        className={`font-['Outfit'] font-extrabold text-white leading-tight ${
                          isPreview ? 'text-[9px]' : 'text-base lg:text-xl'
                        }`}
                      >
                        {club.name}
                      </span>
                    </div>
                  ))}

                  {/* 3 Rows: Club Row Header + 3 Intersection Squares */}
                  {(mg.ticTacToe.nations || []).map((rowClub, rowIdx) => (
                    <React.Fragment key={rowClub.id}>
                      {/* Left Row Header: Club Crest Emblem + Name */}
                      <div className="rounded-xl bg-[#081326] border border-slate-700/80 flex items-center justify-center gap-3 px-3 py-2">
                        <ClubCrestArtwork
                          clubId={rowClub.id}
                          logoUrl={rowClub.logoUrl}
                          className={
                            isPreview ? 'w-6 h-6 shrink-0' : 'w-12 h-12 lg:w-14 lg:h-14 shrink-0'
                          }
                        />
                        <span
                          className={`font-['Outfit'] font-extrabold text-white leading-tight ${
                            isPreview ? 'text-[9px]' : 'text-base lg:text-xl'
                          }`}
                        >
                          {rowClub.name}
                        </span>
                      </div>

                      {/* 3 Intersection Cells in this Row */}
                      {[0, 1, 2].map((colIdx) => {
                        const cellIndex = rowIdx * 3 + colIdx;
                        const cell = mg.ticTacToe?.cells?.[cellIndex] || {
                          index: cellIndex,
                          row: rowIdx,
                          col: colIdx,
                          owner: null,
                          playerName: null,
                        };
                        const isSelectedCell = mg.ticTacToe?.selectedCellIndex === cellIndex;
                        const isWinningCell = Boolean(
                          Array.isArray(mg.ticTacToe?.winningLine) &&
                            mg.ticTacToe.winningLine.includes(cellIndex)
                        );
                        const recentRejection =
                          mg.ticTacToe?.rejectedFeedback &&
                          mg.ticTacToe.rejectedFeedback.cellIndex === cellIndex &&
                          nowTick - mg.ticTacToe.rejectedFeedback.timestamp < 3500
                            ? mg.ticTacToe.rejectedFeedback
                            : null;

                        return (
                          <div
                            key={cellIndex}
                            className={`relative rounded-xl flex flex-col items-center justify-center text-center p-2 transition-all duration-300 ${
                              cell.owner === 'red'
                                ? 'bg-gradient-to-br from-[#EF4444] to-red-900 border-2 border-red-300 shadow-[0_0_24px_rgba(239,68,68,0.4)] animate-answer-reveal'
                                : cell.owner === 'blue'
                                ? 'bg-gradient-to-br from-[#38BDF8] to-blue-900 border-2 border-sky-200 shadow-[0_0_24px_rgba(56,189,248,0.4)] animate-answer-reveal'
                                : recentRejection
                                ? 'bg-red-950/90 border-2 border-red-500'
                                : isSelectedCell
                                ? 'bg-[#0C1D36] border-2 border-[#F59E0B] shadow-[0_0_18px_rgba(245,158,11,0.3)]'
                                : 'bg-[#081326]/90 border border-slate-800'
                            } ${isWinningCell ? 'ring-4 ring-[#F59E0B] scale-[1.02]' : ''}`}
                          >
                            <span
                              className={`absolute top-1.5 left-2.5 font-['JetBrains_Mono'] font-bold ${
                                isPreview ? 'text-[8px]' : 'text-xs lg:text-sm'
                              } ${
                                cell.owner
                                  ? 'text-white/80'
                                  : isSelectedCell
                                  ? 'text-[#F59E0B]'
                                  : 'text-slate-500'
                              }`}
                            >
                              #{cellIndex + 1}
                            </span>

                            {cell.owner ? (
                              <div className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 max-w-full h-full py-0.5">
                                <PlayerPortraitArtwork
                                  playerName={cell.playerName}
                                  playerImageUrl={cell.playerImageUrl}
                                  teamColor={cell.owner}
                                  className={
                                    isPreview
                                      ? 'w-10 h-10'
                                      : 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 shadow-[0_4px_24px_rgba(0,0,0,0.55)] ring-2 sm:ring-4 ring-white/20'
                                  }
                                />
                                <span
                                  className={`font-['Outfit'] font-black text-white leading-tight truncate max-w-full px-1.5 drop-shadow-md ${
                                    isPreview ? 'text-[9px]' : 'text-xs sm:text-sm lg:text-base xl:text-lg'
                                  }`}
                                >
                                  {cell.playerName}
                                </span>
                                <span
                                  className={`font-['Plus_Jakarta_Sans'] font-extrabold uppercase tracking-widest ${
                                    isPreview ? 'text-[6px]' : 'text-[9px] sm:text-[10px] lg:text-xs'
                                  } text-white/90`}
                                >
                                  {cell.owner === 'red' ? 'RED TEAM' : 'BLUE TEAM'}
                                </span>
                              </div>
                            ) : recentRejection ? (
                              <div className="flex flex-col items-center">
                                <span
                                  className={`font-['Outfit'] font-black text-red-300 uppercase ${
                                    isPreview ? 'text-[9px]' : 'text-lg lg:text-xl'
                                  }`}
                                >
                                  NOT ACCEPTED
                                </span>
                                {recentRejection.attemptedName && !isPreview && (
                                  <span className="text-xs text-red-200/80 mt-0.5">
                                    “{recentRejection.attemptedName}”
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span
                                className={`font-['Outfit'] font-bold ${
                                  isPreview ? 'text-xs' : 'text-2xl lg:text-3xl'
                                } ${isSelectedCell ? 'text-[#F59E0B]' : 'text-slate-600'}`}
                              >
                                {cellIndex + 1}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ) : (
              /* MINI GAMES A, B, C: IMAGE GUESSING, QUIZ, NUMBER, AUDIO */
              <div
                className={`w-full h-full flex flex-col justify-between bg-[#081326]/95 border border-slate-800 rounded-2xl ${
                  isPreview ? 'p-3 gap-2' : 'p-6 lg:p-8 gap-5'
                }`}
              >
                {/* Mini-Game Top Header & 30-Second Countdown Clock */}
                <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <CategoryBadgeArtwork
                      category={mg.category}
                      className={isPreview ? 'w-8 h-8' : 'w-14 h-14'}
                    />
                    <div>
                      <span
                        className={`font-['Plus_Jakarta_Sans'] font-bold text-[#F59E0B] uppercase tracking-wider block ${
                          isPreview ? 'text-[8px]' : 'text-xs lg:text-sm'
                        }`}
                      >
                        CARD #{mg.cardNumber} · {mg.categoryTitle}
                      </span>
                      <h2
                        className={`font-['Outfit'] font-extrabold text-white ${
                          isPreview ? 'text-xs' : 'text-2xl lg:text-3xl'
                        }`}
                      >
                        {mg.snapshot?.title || mg.categoryTitle}
                      </h2>
                    </div>
                  </div>

                  {/* 30-Second Synchronized Countdown Timer */}
                  <div
                    className={`rounded-2xl border flex items-center gap-3 ${
                      isPreview ? 'px-2.5 py-1' : 'px-6 py-3'
                    } ${
                      mg.timerSeconds <= 5 && mg.timerSeconds > 0
                        ? 'bg-red-950/90 border-[#EF4444] text-[#EF4444] animate-pulse shadow-[0_0_28px_rgba(239,68,68,0.5)]'
                        : mg.timerSeconds === 0
                        ? 'bg-red-950/60 border-red-500/60 text-red-400'
                        : mg.timerRunning
                        ? 'bg-amber-500/15 border-[#F59E0B] text-[#F59E0B]'
                        : 'bg-[#030914] border-slate-700 text-slate-200'
                    }`}
                  >
                    <span
                      className={`font-['Plus_Jakarta_Sans'] font-bold uppercase ${
                        isPreview ? 'text-[8px]' : 'text-xs lg:text-sm'
                      }`}
                    >
                      {mg.timerSeconds === 0
                        ? 'TIME UP'
                        : mg.timerRunning
                        ? 'LIVE CLOCK'
                        : 'READY'}
                    </span>
                    <span
                      className={`font-['JetBrains_Mono'] font-extrabold tabular-nums ${
                        isPreview ? 'text-base' : 'text-3xl lg:text-5xl'
                      }`}
                    >
                      {formatCountdown(mg.timerSeconds)}
                    </span>
                  </div>
                </div>

                {/* Center Stage Content by Category */}
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center">
                  {(mg.category === 'jersey' ||
                    mg.category === 'photo' ||
                    mg.category === 'stadium' ||
                    mg.category === 'logo') && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 min-h-0">
                      <div
                        className={`relative flex-1 w-full max-w-4xl min-h-0 rounded-2xl bg-[#030914] border border-slate-800 overflow-hidden flex items-center justify-center ${
                          isPreview ? 'p-2' : 'p-4'
                        }`}
                      >
                        {mg.snapshot?.mediaUrl && !imgFailed ? (
                          <img
                            src={mg.snapshot.mediaUrl}
                            alt={mg.snapshot.title || 'Broadcast Mystery Image'}
                            referrerPolicy="no-referrer"
                            onError={() => setImgFailed(true)}
                            style={{
                              filter:
                                mg.imageUnblurred || mg.answerRevealed
                                  ? 'blur(0px)'
                                  : `blur(${mg.snapshot.blurAmount ?? 28}px)`,
                            }}
                            className={`max-h-full max-w-full object-contain transition-all duration-700 ${
                              mg.imageUnblurred || mg.answerRevealed
                                ? 'scale-100'
                                : 'scale-105'
                            }`}
                          />
                        ) : (
                          /* Zero-Broken-Image Styled Fallback Container */
                          <div
                            style={{
                              filter:
                                mg.imageUnblurred || mg.answerRevealed
                                  ? 'blur(0px)'
                                  : `blur(${mg.snapshot?.blurAmount ?? 28}px)`,
                            }}
                            className="flex flex-col items-center justify-center text-center p-6 transition-all duration-700"
                          >
                            <CategoryBadgeArtwork
                              category={mg.category}
                              className={isPreview ? 'w-16 h-16' : 'w-36 h-36'}
                            />
                            <p className="mt-3 font-['Outfit'] font-bold text-lg text-slate-200">
                              {mg.snapshot?.title}
                            </p>
                          </div>
                        )}

                        {/* Mystery Blur Status Watermark Overlay when Blurred */}
                        {!mg.imageUnblurred &&
                          !mg.answerRevealed &&
                          (mg.snapshot?.blurAmount ?? 28) > 0 && (
                            <div className="pointer-events-none absolute bottom-3 right-4 px-3 py-1 rounded-lg bg-black/65 border border-white/15 text-xs font-['Plus_Jakarta_Sans'] font-semibold text-amber-300">
                              MYSTERY BLUR ACTIVE ({mg.snapshot?.blurAmount ?? 28}px)
                            </div>
                          )}
                      </div>

                      {mg.snapshot?.prompt && (
                        <p
                          className={`font-['Outfit'] font-bold text-slate-200 text-center ${
                            isPreview ? 'text-[10px]' : 'text-lg lg:text-2xl'
                          }`}
                        >
                          {mg.snapshot.prompt}
                        </p>
                      )}
                    </div>
                  )}

                  {(mg.category === 'quiz' || mg.category === 'number') && (
                    <div className="w-full max-w-4xl flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#0E1E38]/90 via-[#091528]/95 to-[#061021] border-2 border-amber-500/35 shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden animate-minigame-open">
                      {/* Top Specular Neon Accent Line */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent" />
                      
                      {/* Challenge Kicker Banner */}
                      <div className="flex items-center gap-2 mb-4">
                        <CategoryBadgeArtwork category={mg.category} className="w-6 h-6 shrink-0" />
                        <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[#F59E0B] text-xs sm:text-sm uppercase tracking-widest">
                          {mg.category === 'quiz' ? 'OFFICIAL FOOTBALL TRIVIA QUESTION' : 'STATISTICAL NUMBER CHALLENGE'}
                        </span>
                      </div>

                      {/* Prime-Time Question Heading */}
                      <h3
                        className={`font-['Outfit'] font-black text-white leading-tight [text-wrap:balance] ${
                          isPreview ? 'text-xs' : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl drop-shadow-md'
                        }`}
                      >
                        {mg.snapshot?.prompt || 'Prepare for the broadcast question!'}
                      </h3>
                    </div>
                  )}

                  {mg.category === 'audio' && (
                    <div className="w-full max-w-4xl flex flex-col items-center justify-center text-center gap-4 sm:gap-5 p-6 rounded-2xl bg-gradient-to-b from-[#0E1E38]/90 via-[#091528]/95 to-[#061021] border-2 border-sky-500/35 shadow-[0_0_50px_rgba(56,189,248,0.15)] relative overflow-hidden animate-minigame-open">
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent" />

                      {/* Audio Status Header */}
                      <div className="flex items-center gap-2 font-['Plus_Jakarta_Sans'] font-bold text-xs sm:text-sm tracking-wider uppercase text-sky-400">
                        <span className={`w-2.5 h-2.5 rounded-full ${mg.audioPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                        <span>{mg.audioPlaying ? 'LIVE AUDIO CLIP PLAYING · LISTEN CLOSELY' : 'AUDIO CLIP READY · AWAITING HOST PLAYBACK'}</span>
                      </div>

                      {/* Animated Broadcast Soundwave Visualizer with 32 Illuminated Frequency Bars */}
                      <div
                        className={`w-full rounded-xl bg-[#030914] border border-slate-800 flex items-center justify-center gap-1 sm:gap-1.5 ${
                          isPreview ? 'h-14 px-4' : 'h-28 sm:h-36 px-6 sm:px-10'
                        }`}
                      >
                        {Array.from({ length: 32 }).map((_, i) => {
                          const heights = [28, 52, 76, 40, 92, 64, 35, 85, 48, 96, 55, 30, 72, 60, 88, 42];
                          const h = heights[i % heights.length];
                          return (
                            <div
                              key={i}
                              className={`w-1.5 sm:w-2 rounded-full transition-all duration-300 ${
                                mg.audioPlaying
                                  ? 'bg-gradient-to-t from-[#38BDF8] via-emerald-400 to-[#F59E0B] animate-pulse'
                                  : 'bg-slate-700'
                              }`}
                              style={{
                                height: mg.audioPlaying ? `${h}%` : '20%',
                                animationDelay: `${(i % 8) * 80}ms`,
                              }}
                            />
                          );
                        })}
                      </div>

                      {/* Audio Prompt Question */}
                      <h3
                        className={`font-['Outfit'] font-black text-white leading-snug [text-wrap:balance] ${
                          isPreview ? 'text-xs' : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl'
                        }`}
                      >
                        {mg.snapshot?.prompt || 'Listen closely to the mystery football audio clip!'}
                      </h3>
                    </div>
                  )}
                </div>

                {/* Bottom Official Answer Banner (Emerald #10B981 when revealed, Locked when hidden) */}
                <div
                  className={`rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                    isPreview ? 'px-3 py-2' : 'px-8 py-4'
                  } ${
                    mg.answerRevealed
                      ? 'bg-emerald-950/90 border-2 border-[#10B981] shadow-[0_0_32px_rgba(16,185,129,0.35)] animate-answer-reveal'
                      : 'bg-[#030914]/90 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-['Plus_Jakarta_Sans'] font-extrabold uppercase tracking-wider ${
                        isPreview ? 'text-[8px]' : 'text-sm lg:text-base'
                      } ${mg.answerRevealed ? 'text-[#10B981]' : 'text-slate-400'}`}
                    >
                      {mg.answerRevealed ? 'OFFICIAL ANSWER' : 'ANSWER LOCKED'}
                    </span>
                    <span className="text-slate-600" aria-hidden="true">
                      ·
                    </span>
                    <span
                      className={`font-['Outfit'] font-black ${
                        isPreview ? 'text-xs' : 'text-2xl lg:text-4xl'
                      } ${mg.answerRevealed ? 'text-white' : 'text-slate-500'}`}
                    >
                      {mg.answerRevealed
                        ? mg.snapshot?.answer || 'Revealed'
                        : 'Awaiting Host Reveal'}
                    </span>
                  </div>

                  {mg.scored && (
                    <div
                      className={`font-['Outfit'] font-black uppercase animate-answer-reveal ${
                        isPreview ? 'text-[9px]' : 'text-lg lg:text-2xl'
                      } ${
                        mg.scoreResult === 'correct'
                          ? mg.awardedTeam === 'red'
                            ? 'text-red-400'
                            : 'text-sky-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {mg.scoreResult === 'correct'
                        ? `+1 POINT AWARDED TO ${mg.awardedTeam?.toUpperCase()} TEAM`
                        : 'ROUND JUDGED · 0 POINTS'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
