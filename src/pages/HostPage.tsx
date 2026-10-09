import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  RotateCcw,
  Eye,
  CheckCircle2,
  XCircle,
  Shuffle,
  ArrowLeft,
  Volume2,
  Square,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { GameSyncProvider, useGameSync } from '../context/GameSyncContext';
import { OwnerAuthGate } from '../components/OwnerAuthGate';
import { StudioStageView } from '../components/StudioStageView';
import {
  CategoryBadgeArtwork,
  ClubCrestArtwork,
  EmojiBadgeArtwork,
  NationFlagArtwork,
} from '../components/BroadcastArtwork';
import { ContentItem } from '../types/game';

const HostConsoleBody: React.FC = () => {
  const { state, contentItems, logoutOwner, sendHostAction } = useGameSync();

  const [confirmNewGame, setConfirmNewGame] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [inlineTitle, setInlineTitle] = useState<string>('');
  const [inlinePrompt, setInlinePrompt] = useState<string>('');
  const [inlineAnswer, setInlineAnswer] = useState<string>('');
  const [spokenPlayerName, setSpokenPlayerName] = useState<string>('');

  const mg = state?.activeMiniGame || null;
  const selectedCard =
    state?.cards.find((c) => c.cardNumber === state.selectedCardNumber) || state?.cards[0];

  // Filter saved content items for the active mini-game or currently selected card category
  const activeCategory = mg ? mg.category : selectedCard?.category;
  const categoryItems: ContentItem[] =
    activeCategory && activeCategory !== 'tictactoe'
      ? contentItems.filter((item) => item.category === activeCategory)
      : [];

  // Sync inline editor fields when active mini-game snapshot changes
  useEffect(() => {
    if (mg && mg.snapshot) {
      setSelectedItemId(mg.snapshot.itemId || '');
      setInlineTitle(mg.snapshot.title || '');
      setInlinePrompt(mg.snapshot.prompt || '');
      setInlineAnswer(mg.snapshot.answer || '');
    } else if (categoryItems.length > 0) {
      const first = categoryItems[0];
      setSelectedItemId(first.id);
      setInlineTitle(first.title);
      setInlinePrompt(first.prompt);
      setInlineAnswer(first.answer);
    }
  }, [mg?.cardNumber, mg?.snapshot?.itemId, activeCategory, contentItems.length]);

  const handleSelectContentDropdown = (itemId: string) => {
    setSelectedItemId(itemId);
    const found = categoryItems.find((i) => i.id === itemId);
    if (found) {
      setInlineTitle(found.title);
      setInlinePrompt(found.prompt);
      setInlineAnswer(found.answer);
    }
  };

  const handleApplySelectedItem = () => {
    sendHostAction('minigame:useItem', {
      itemId: selectedItemId,
      title: inlineTitle,
      prompt: inlinePrompt,
      answer: inlineAnswer,
    });
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-[#030914] text-white flex items-center justify-center font-['Outfit']">
        <div className="text-xl font-bold text-amber-400">Loading Host Console...</div>
      </div>
    );
  }

  const ttt = mg?.ticTacToe;
  const activeCellIndex = ttt?.selectedCellIndex ?? 0;
  const activeCell = ttt?.cells[activeCellIndex];
  const activeCellClub = ttt && activeCell ? ttt.clubs[activeCell.col] : null;
  const activeCellNation = ttt && activeCell ? ttt.nations[activeCell.row] : null;
  const activeCellHints = (ttt?.hintsByCell && ttt.hintsByCell[activeCellIndex]) || [];

  return (
    <div className="min-h-screen bg-[#030914] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Top Bar Contract: 3 Zones Separated by gap-8 */}
      <header className="flex items-center justify-between gap-8 px-6 py-3 bg-[#081326] border-b border-slate-800">
        <Link
          to="/host"
          className="text-lg font-extrabold font-['Outfit'] tracking-tight text-white whitespace-nowrap shrink-0"
        >
          FanZone Host Console
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link
            to="/host"
            className="text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            Host Console
          </Link>
          <Link
            to="/content"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Content Manager
          </Link>
          <Link
            to="/studio"
            target="_blank"
            rel="noreferrer"
            className="hover:text-sky-400 transition-colors whitespace-nowrap shrink-0"
          >
            Studio Display
          </Link>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={logoutOwner}
            className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main iPad Two-Column Responsive Workspace */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (7 cols): Live 16:9 Studio Preview + Interactive 2x4 Card Selector */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Live 16:9 Synchronized Studio Monitor */}
          <section className="bg-[#081326] border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold font-['Outfit'] text-white">
                  Live 16:9 Broadcast Studio Monitor
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time synchronized mirror of /studio · Stage:{' '}
                  {state.stage === 'board' ? 'Main 2×4 Board' : mg?.categoryTitle}
                </p>
              </div>
              <div className="text-xs font-['JetBrains_Mono'] text-amber-400">
                RED {state.redScore} · BLUE {state.blueScore}
              </div>
            </div>

            <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl">
              <StudioStageView state={state} isPreview={true} />
            </div>
          </section>

          {/* Interactive 2x4 Main Board Card Selector */}
          <section className="bg-[#081326] border border-slate-800 rounded-2xl p-4">
            {(() => {
              const revealedCard = state.cards.find((c) => c.revealed);
              return (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-base font-bold font-['Outfit'] text-white">
                        2×4 Main Board Card Selector (1 Pick Per Turn)
                      </h2>
                      <p className="text-xs text-slate-400">
                        {revealedCard
                          ? `Card #${revealedCard.cardNumber} (${revealedCard.emojiLabel}) is picked — other 7 emojis are locked until Back to Board, Reset Covers, or Shuffle Sports.`
                          : 'Tap any card (#1–#8) to select it, then Reveal Card or Open Mini Game'}
                      </p>
                    </div>
                    <span className="text-xs font-['JetBrains_Mono'] font-bold text-amber-400 shrink-0">
                      {revealedCard
                        ? `Locked: Card #${revealedCard.cardNumber}`
                        : `Selected: Card #${state.selectedCardNumber}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {state.cards.map((card) => {
                      const isSelected = state.selectedCardNumber === card.cardNumber;
                      const isLockedByPick = Boolean(
                        revealedCard && revealedCard.cardNumber !== card.cardNumber
                      );
                      return (
                        <button
                          key={card.cardNumber}
                          type="button"
                          disabled={isLockedByPick}
                          onClick={() =>
                            sendHostAction('card:select', { cardNumber: card.cardNumber })
                          }
                          className={`min-h-[124px] p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            isLockedByPick
                              ? 'bg-[#030914]/50 border-slate-800/60 opacity-40 grayscale cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#0E2240] border-2 border-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.28)] cursor-pointer'
                              : 'bg-[#030914]/90 border-slate-800 hover:border-slate-700 cursor-pointer'
                          }`}
                        >
                          <div className="w-full flex items-center justify-between">
                            <span className="font-['JetBrains_Mono'] font-bold text-sm text-amber-400 tabular-nums">
                              #{card.cardNumber}
                            </span>
                            <span
                              className={`text-[11px] font-semibold ${
                                card.revealed
                                  ? 'text-emerald-400'
                                  : isLockedByPick
                                  ? 'text-rose-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {card.revealed
                                ? 'Picked & Revealed'
                                : isLockedByPick
                                ? 'Locked'
                                : 'Covered'}
                            </span>
                          </div>

                          <div className="my-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <EmojiBadgeArtwork
                                emojiId={card.emojiId}
                                className="w-10 h-10 shrink-0"
                              />
                              <CategoryBadgeArtwork
                                category={card.category}
                                className="w-10 h-10 shrink-0"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-bold font-['Outfit'] text-white truncate">
                              {card.categoryTitle}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center justify-between mt-0.5">
                              <span>{card.emojiLabel}</span>
                              <span>·</span>
                              <span
                                className={
                                  card.scored
                                    ? card.scoreResult === 'correct'
                                      ? card.awardedTeam === 'red'
                                        ? 'text-red-400 font-bold'
                                        : 'text-sky-400 font-bold'
                                      : 'text-amber-400 font-bold'
                                    : 'text-slate-500'
                                }
                              >
                                {card.scored
                                  ? card.scoreResult === 'correct'
                                    ? `+1 ${card.awardedTeam?.toUpperCase()}`
                                    : '0 pts'
                                  : isLockedByPick
                                  ? 'Locked'
                                  : 'Available'}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </section>
        </div>

        {/* RIGHT COLUMN (5 cols): Touch-Friendly Control Panels */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* 1. RED TEAM & BLUE TEAM SCORE & TURN CONTROLS */}
          <section className="bg-[#081326] border border-slate-800 rounded-2xl p-4">
            <h2 className="text-sm font-bold font-['Outfit'] text-white mb-3">
              Team Turn & Manual Score Controls
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {/* Red Team Control Box */}
              <div
                className={`p-3 rounded-xl border ${
                  state.activeTeam === 'red'
                    ? 'bg-red-950/35 border-[#EF4444]'
                    : 'bg-[#030914] border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-['Outfit'] font-extrabold text-sm text-red-400">
                    RED TEAM
                  </span>
                  <span className="font-['JetBrains_Mono'] font-extrabold text-2xl text-white tabular-nums">
                    {state.redScore}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => sendHostAction('team:setActive', { team: 'red' })}
                  className={`w-full min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold mb-2 transition-colors cursor-pointer whitespace-nowrap ${
                    state.activeTeam === 'red'
                      ? 'bg-[#EF4444] text-white'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  {state.activeTeam === 'red' ? 'Active Turn: Red Team' : 'Switch to Red Team'}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => sendHostAction('score:adjust', { team: 'red', delta: -1 })}
                    className="min-h-[44px] min-w-[44px] rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 font-['JetBrains_Mono'] font-bold text-sm text-slate-200 cursor-pointer"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => sendHostAction('score:adjust', { team: 'red', delta: 1 })}
                    className="min-h-[44px] min-w-[44px] rounded-lg bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 font-['JetBrains_Mono'] font-bold text-sm text-red-200 cursor-pointer"
                  >
                    +1
                  </button>
                </div>
              </div>

              {/* Blue Team Control Box */}
              <div
                className={`p-3 rounded-xl border ${
                  state.activeTeam === 'blue'
                    ? 'bg-sky-950/35 border-[#38BDF8]'
                    : 'bg-[#030914] border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-['Outfit'] font-extrabold text-sm text-sky-400">
                    BLUE TEAM
                  </span>
                  <span className="font-['JetBrains_Mono'] font-extrabold text-2xl text-white tabular-nums">
                    {state.blueScore}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => sendHostAction('team:setActive', { team: 'blue' })}
                  className={`w-full min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold mb-2 transition-colors cursor-pointer whitespace-nowrap ${
                    state.activeTeam === 'blue'
                      ? 'bg-[#38BDF8] text-slate-950'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  {state.activeTeam === 'blue' ? 'Active Turn: Blue Team' : 'Switch to Blue Team'}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => sendHostAction('score:adjust', { team: 'blue', delta: -1 })}
                    className="min-h-[44px] min-w-[44px] rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 font-['JetBrains_Mono'] font-bold text-sm text-slate-200 cursor-pointer"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => sendHostAction('score:adjust', { team: 'blue', delta: 1 })}
                    className="min-h-[44px] min-w-[44px] rounded-lg bg-sky-500/30 hover:bg-sky-500/50 border border-sky-400/50 font-['JetBrains_Mono'] font-bold text-sm text-sky-200 cursor-pointer"
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 3. CARD REVEAL & BOARD DECK ACTIONS */}
          <section className="bg-[#081326] border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold font-['Outfit'] text-white">
                Board Actions · Card #{state.selectedCardNumber} ({selectedCard?.categoryTitle})
              </h2>
              {state.stage === 'minigame' && (
                <button
                  type="button"
                  onClick={() => sendHostAction('minigame:backToBoard')}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Board
                </button>
              )}
            </div>

            {/* Two Separate Primary Actions: Reveal Selected Card vs Open Mini Game */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={state.cards.some((c) => c.revealed)}
                onClick={() =>
                  sendHostAction('card:reveal', { cardNumber: state.selectedCardNumber })
                }
                className="min-h-[48px] px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Eye className="w-4 h-4 shrink-0" />
                <span>
                  {state.cards.some((c) => c.revealed)
                    ? '1 Card Picked (Others Locked)'
                    : 'Reveal Selected Card'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  sendHostAction('card:openMiniGame', {
                    cardNumber: state.selectedCardNumber,
                    itemId: selectedItemId || undefined,
                  })
                }
                className="min-h-[48px] px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Open Mini Game</span>
              </button>
            </div>

            {/* Secondary Board Management Buttons: Reset Covers, Shuffle Sports, New Game */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => sendHostAction('board:resetCovers')}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>Reset Covers</span>
              </button>

              <button
                type="button"
                onClick={() => sendHostAction('board:shuffleSports')}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Shuffle className="w-3.5 h-3.5 shrink-0" />
                <span>Shuffle Sports</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmNewGame(true)}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/70 border border-red-500/40 text-xs font-semibold text-red-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                <span>New Game</span>
              </button>
            </div>

            {/* Confirmation Step for New Game */}
            {confirmNewGame && (
              <div className="p-3 rounded-xl bg-red-950/90 border border-red-500/60 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-red-100">
                  Reset Red & Blue scores to 0 and shuffle a brand-new board?
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      sendHostAction('board:newGame');
                      setConfirmNewGame(false);
                    }}
                    className="min-h-[44px] px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmNewGame(false)}
                    className="min-h-[44px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* 4. ACTIVE MINI-GAME OPERATOR PANEL */}
          {mg && mg.category === 'tictactoe' && mg.ticTacToe ? (
            /* FOOTBALL TIC-TAC-TOE HOST OPERATOR CONTROLS */
            <section
              key={`host-ttt-${mg.cardNumber}`}
              className="bg-[#081326] border border-slate-800 rounded-2xl p-4 space-y-4 animate-minigame-open"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold font-['Outfit'] text-white">
                  Football Tic-Tac-Toe Controls
                </h2>
                <button
                  type="button"
                  onClick={() => sendHostAction('tictactoe:resetShuffle')}
                  className="min-h-[44px] px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-amber-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Reset & Shuffle Grid
                </button>
              </div>

              {/* Starting Team / Active Turn Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => sendHostAction('tictactoe:setTurn', { team: 'red' })}
                  className={`min-h-[44px] px-3 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer whitespace-nowrap ${
                    mg.ticTacToe.turn === 'red'
                      ? 'bg-[#EF4444] text-white'
                      : 'bg-slate-900 border border-slate-700 text-slate-300'
                  }`}
                >
                  Red Team Starts / Turn
                </button>
                <button
                  type="button"
                  onClick={() => sendHostAction('tictactoe:setTurn', { team: 'blue' })}
                  className={`min-h-[44px] px-3 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer whitespace-nowrap ${
                    mg.ticTacToe.turn === 'blue'
                      ? 'bg-[#38BDF8] text-slate-950'
                      : 'bg-slate-900 border border-slate-700 text-slate-300'
                  }`}
                >
                  Blue Team Starts / Turn
                </button>
              </div>

              {/* 3x3 Touch Square Selector (Squares 1-9) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Tap Square (1–9) to Judge Intersection:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {mg.ticTacToe.cells.map((cell, idx) => {
                    const club = mg.ticTacToe!.clubs[cell.col];
                    const nation = mg.ticTacToe!.nations[cell.row];
                    const isSelected = activeCellIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          sendHostAction('tictactoe:selectCell', { cellIndex: idx })
                        }
                        className={`min-h-[64px] p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          cell.owner === 'red'
                            ? 'bg-red-600/30 border-red-400 text-white'
                            : cell.owner === 'blue'
                            ? 'bg-sky-500/30 border-sky-300 text-white'
                            : isSelected
                            ? 'bg-[#0E2240] border-2 border-[#F59E0B]'
                            : 'bg-[#030914] border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-['JetBrains_Mono'] font-bold">
                          <span className="text-amber-400">#{idx + 1}</span>
                          <span>
                            {club.shortName} × {nation.code}
                          </span>
                        </div>
                        <div className="text-xs font-bold font-['Outfit'] truncate mt-1">
                          {cell.owner ? cell.playerName : 'Open Square'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Intersection Details + Quick-Fill Reference Hints + Accept/Reject */}
              <div className="p-3 rounded-xl bg-[#030914] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {activeCellClub && (
                      <ClubCrestArtwork clubId={activeCellClub.id} className="w-6 h-6" />
                    )}
                    <span className="text-xs font-bold text-white">
                      {activeCellClub?.name}
                    </span>
                    <span className="text-slate-500">×</span>
                    {activeCellNation && (
                      <NationFlagArtwork nationId={activeCellNation.id} className="w-6 h-6" />
                    )}
                    <span className="text-xs font-bold text-white">
                      {activeCellNation?.name}
                    </span>
                  </div>
                  <span className="text-xs font-['JetBrains_Mono'] text-amber-400">
                    Square #{activeCellIndex + 1}
                  </span>
                </div>

                {/* Quick-Fill Reference Hints */}
                <div>
                  <span className="block text-[11px] text-slate-400 mb-1.5">
                    Quick-Fill Valid Footballers (Tap to populate):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCellHints.map((hintName) => (
                      <button
                        key={hintName}
                        type="button"
                        onClick={() => setSpokenPlayerName(hintName)}
                        className="min-h-[36px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-emerald-300 font-medium cursor-pointer"
                      >
                        {hintName}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={spokenPlayerName}
                    onChange={(e) => setSpokenPlayerName(e.target.value)}
                    placeholder="Type contestant's spoken footballer name..."
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#081326] border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={Boolean(activeCell?.owner || mg.ticTacToe.winner)}
                    onClick={() => {
                      const nameToUse =
                        spokenPlayerName.trim() || activeCellHints[0] || 'Accepted Player';
                      sendHostAction('tictactoe:judge', {
                        cellIndex: activeCellIndex,
                        decision: 'accept',
                        playerName: nameToUse,
                      });
                      setSpokenPlayerName('');
                    }}
                    className="min-h-[48px] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Accept ({mg.ticTacToe.turn === 'red' ? 'Red Box' : 'Blue Box'})
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={Boolean(activeCell?.owner || mg.ticTacToe.winner)}
                    onClick={() => {
                      sendHostAction('tictactoe:judge', {
                        cellIndex: activeCellIndex,
                        decision: 'reject',
                        playerName: spokenPlayerName.trim(),
                      });
                      setSpokenPlayerName('');
                    }}
                    className="min-h-[48px] px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject & Pass Turn</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => sendHostAction('minigame:backToBoard')}
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <ArrowLeft className="w-4 h-4 shrink-0" />
                  <span>Back to Board (Reset Covers & Shuffle Sports)</span>
                </button>
              </div>
            </section>
          ) : (
            /* STANDARD MINI GAMES (IMAGE GUESSING, QUIZ, NUMBER, AUDIO) CONTROLS */
            <section
              key={`host-panel-${state.stage}-${mg?.cardNumber ?? 'board'}`}
              className={`bg-[#081326] border border-slate-800 rounded-2xl p-4 space-y-4 ${
                mg ? 'animate-minigame-open' : 'animate-board-return'
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold font-['Outfit'] text-white">
                  Mini-Game Content & Live Stage Controls
                </h2>
                {mg && (
                  <span className="font-['JetBrains_Mono'] font-bold text-sm text-amber-400 tabular-nums">
                    Timer: 00:{String(mg.timerSeconds).padStart(2, '0')}
                  </span>
                )}
              </div>

              {/* Content Item Selector & Inline Editor */}
              {activeCategory !== 'tictactoe' && (
                <div className="p-3 rounded-xl bg-[#030914] border border-slate-800 space-y-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Select Saved {activeCategory?.toUpperCase()} Item ({categoryItems.length}{' '}
                      available):
                    </label>
                    <select
                      value={selectedItemId}
                      onChange={(e) => handleSelectContentDropdown(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#081326] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      {categoryItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title} — [{item.answer}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Inline Question / Clue Prompt:
                    </label>
                    <input
                      type="text"
                      value={inlinePrompt}
                      onChange={(e) => setInlinePrompt(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#081326] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Inline Private Official Answer:
                    </label>
                    <input
                      type="text"
                      value={inlineAnswer}
                      onChange={(e) => setInlineAnswer(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#081326] border border-emerald-500/50 text-xs text-emerald-300 font-semibold focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleApplySelectedItem}
                    className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Use Selected Item
                  </button>
                </div>
              )}

              {/* Audio Playback Controls when in Audio Mini Game */}
              {mg?.category === 'audio' && (
                <div className="p-3 rounded-xl bg-[#030914] border border-sky-500/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-300">
                      Synchronized Studio Audio Controls
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {mg.audioPlaying ? 'Playing on Studio' : 'Stopped'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => sendHostAction('minigame:audioPlay')}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Play Audio Clip</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => sendHostAction('minigame:audioStop')}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Square className="w-4 h-4" />
                      <span>Stop Audio</span>
                    </button>
                  </div>

                  {mg.snapshot?.mediaUrl && (
                    <audio
                      controls
                      src={mg.snapshot.mediaUrl}
                      className="w-full h-10 mt-1"
                    />
                  )}
                </div>
              )}

              {/* 30s Countdown Timer & Reveal Answer Controls */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={!mg}
                  onClick={() => sendHostAction('minigame:startTimer')}
                  className="min-h-[48px] px-3 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-4 h-4 shrink-0" />
                  <span>Start 30s Timer</span>
                </button>

                <button
                  type="button"
                  disabled={!mg}
                  onClick={() => sendHostAction('minigame:resetTimer')}
                  className="min-h-[48px] px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4 shrink-0" />
                  <span>Reset Timer</span>
                </button>
              </div>

              <button
                type="button"
                disabled={!mg}
                onClick={() => sendHostAction('minigame:revealAnswer')}
                className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#10B981] hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Eye className="w-4 h-4 shrink-0" />
                <span>Reveal Answer on Studio</span>
              </button>

              {/* Round Judging Buttons: Correct (+1) vs Wrong (0) */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  disabled={!mg || mg.scored}
                  onClick={() =>
                    sendHostAction('minigame:judge', {
                      result: 'correct',
                      team: state.activeTeam,
                    })
                  }
                  className="min-h-[48px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Correct (+1 {state.activeTeam === 'red' ? 'Red' : 'Blue'})
                  </span>
                </button>

                <button
                  type="button"
                  disabled={!mg || mg.scored}
                  onClick={() =>
                    sendHostAction('minigame:judge', {
                      result: 'wrong',
                      team: state.activeTeam,
                    })
                  }
                  className="min-h-[48px] px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Wrong (0)</span>
                </button>
              </div>

              <button
                type="button"
                disabled={!mg}
                onClick={() => sendHostAction('minigame:backToBoard')}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>Back to Board</span>
              </button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export const HostPage: React.FC = () => {
  return (
    <GameSyncProvider role="host">
      <OwnerAuthGate
        title="FanZone Host Control Console"
        subtitle="iPad Live Broadcast Operator Authentication"
      >
        <HostConsoleBody />
      </OwnerAuthGate>
    </GameSyncProvider>
  );
};
