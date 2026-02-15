"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import MinecraftSkinViewer from "../app/MinecraftSkinViewer";
import Link from "next/link";
import logo from "../app/logo.png";
import Image from "next/image";
import discordIcon from "../app/discord.png";
import trophyIcon from "../app/trophy.png";
import clogo from "../app/clogo.png";   // High Council icon
import infoLogo from "../app/infologo.png";       // Information icon
import faqLogo from "../app/faqlogo.png";        // FAQ icon

type Player = {
  ign: string;
  tier: string;
  region: string;
  gamemode: string;
};

// 🔥 NEW: Delete old entry + insert new one
const upsertPlayer = async (player: Player, setPlayers: any) => {
  const cleanIGN = player.ign.toLowerCase().trim();

  // 1️⃣ Delete old player with same IGN
  const { error: deleteError } = await supabase
    .from("players")
    .delete()
    .eq("ign", cleanIGN);

  if (deleteError) {
    console.log("Delete error:", deleteError);
    return;
  }

  // 2️⃣ Insert fresh player row
  const { error: insertError } = await supabase
    .from("players")
    .insert([{ ...player, ign: cleanIGN }]);

  if (insertError) {
    console.log("Insert error:", insertError);
    return;
  }

  // 3️⃣ Refresh UI
  const { data, error } = await supabase.from("players").select("*");
  if (!error) setPlayers(data as Player[]);
};

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState("");
  const [infoOpen, setInfoOpen] = useState(false);
  const [councilOpen, setCouncilOpen] = useState(false);
  const [showBoxes, setShowBoxes] = useState(false);

  useEffect(() => {
    setShowBoxes(true); // triggers fadeInUp on mount
  }, []);

  const fetchPlayers = async () => {
    const { data, error } = await supabase.from("players").select("*");
    if (!error) setPlayers((data as Player[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 10000);
    return () => clearInterval(interval);
  }, []);

  const tiers = ["HT1", "HT2", "HT3", "HT4", "HT5"];
  const tierMap: { [key: string]: { high: Player[]; low: Player[] } } = {};
  tiers.forEach((t) => (tierMap[t] = { high: [], low: [] }));

  players
    .filter((p) => !p.tier?.toUpperCase().startsWith("R"))
    .forEach((p) => {
      const key = p.tier.toUpperCase();
      if (key.startsWith("HT") && tierMap[key]) tierMap[key].high.push(p);
      else if (key.startsWith("LT")) {
        const mainTier = "HT" + key.slice(2);
        if (tierMap[mainTier]) tierMap[mainTier].low.push(p);
      }
    });

  Object.keys(tierMap).forEach((t) => {
    tierMap[t].high.sort((a, b) => a.ign.localeCompare(b.ign));
    tierMap[t].low.sort((a, b) => a.ign.localeCompare(b.ign));
  });

  const getTierHeaderStyle = (tier: string) => {
    if (tier === "HT1") return "bg-yellow-500 text-black relative overflow-hidden font-bold text-lg";
    if (tier === "HT2") return "bg-gray-300 text-black relative overflow-hidden font-bold text-lg";
    if (tier === "HT3") return "bg-[#CD7F32] text-white relative overflow-hidden font-bold text-lg";
    return "bg-gray-700 text-white relative overflow-hidden font-bold text-lg";
  };

  const shineStyle =
    "absolute top-0 left-[-75%] w-3/4 h-full bg-white opacity-20 transform -skew-x-12 animate-shine";

  const handleSearch = async () => {
    if (!search) return;

    const clean = search.toLowerCase().trim();

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .ilike("ign", clean)
      .single();

    if (error || !data) {
      setSearchError("Player not found");
      return;
    }

    setSearchError("");
    setSelectedPlayer(data); // 🔥 THIS OPENS POPUP
  };

  return (
    <main className="bg-[#0b0b0b] min-h-screen text-white font-sans w-full overflow-x-hidden">

      {/* 🔥 HEADER */}
      <div className="w-full bg-[#0d0d0d] px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between border-b border-[#222] relative">

        {/* Logo on left (unchanged) */}
        <Image src={logo} alt="Logo" style={{ maxWidth: "300px", height: "auto" }} />

        {/* Center: Ranking + Discord */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">

          <div className="relative group flex items-center gap-1 cursor-pointer">
            <Image src={trophyIcon} alt="Trophy" width={24} height={24} />
            <span className="font-semibold">Ranking</span>

            {/* Tooltip */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-max p-3 bg-[#111] border border-[#222] rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-left">
                <span>1. HT1</span>
                <span>2. LT1</span>
                <span>3. HT2</span>
                <span>4. LT2</span>
                <span>5. HT3</span>
                <span>6. LT3</span>
                <span>7. HT4</span>
                <span>8. LT4</span>
                <span>9. HT5</span>
                <span>10.LT5</span>
              </div>
            </div>
          </div>

          {/* Discord */}
          <a
            href="https://discord.gg/XgKWMDzWbz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-[#7289da] hover:bg-[#5b6eae] px-3 py-1 rounded-md font-bold transition"
          >
            <Image src={discordIcon} alt="Discord" width={20} height={20} />
            Discord
          </a>

        </div>

        {/* Search bar on right (unchanged) */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search IGN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="px-3 py-1 rounded-md bg-[#111] border border-[#222] focus:outline-none focus:border-yellow-500"
          />
          <button
            onClick={handleSearch}
            className="bg-yellow-500 text-black px-4 py-1 rounded-md font-bold hover:brightness-125 transition"
          >
            Search
          </button>
        </div>

      </div>

      {/* INFO + COUNCIL */}
      <div className="w-full px-4 sm:px-6 lg:px-12 mt-12 flex flex-col sm:flex-row justify-between gap-2">

        {/* Left side: Information + FAQ */}
        <div className="flex flex-row gap-2">

          {/* Information Box */}
          <div
            className="bg-[#111] border border-[#222] rounded-md px-12 py-2 text-base cursor-pointer hover:bg-[#1a1a1a] relative animate-fadeInUp"
            onClick={() => setInfoOpen(!infoOpen)}
          >
            <div className="flex items-center gap-2">
              <Image src={infoLogo} alt="Info Icon" width={25} height={25} className="object-contain" />
              <span className="font-semibold text-base">Information</span>
            </div>

            {/* Pop-up */}
            {infoOpen && (
              <div
                className="absolute top-full mt-2 left-0 w-[260px] bg-[#111] border border-[#222] rounded-md p-3 z-50 shadow-lg text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <ul className="space-y-1 text-white">
                  <li><span className="font-bold text-yellow-400">Crystal GrandMaster:</span> Achieve Top 1</li>
                  <li><span className="font-bold text-gray-300">Crystal Master:</span> Achieve Top 2-4</li>
                  <li><span className="font-bold text-[#CD7F32]">Crystal Ace:</span> Achieve Top 5-7</li>
                  <li><span className="font-bold text-gray-700">Crystal Pro:</span> Achieve Top 8-10</li>
                </ul>
              </div>
            )}
          </div>

          {/* FAQ Box */}
          <div className="bg-[#111] border border-[#222] rounded-md px-12 py-2 text-base cursor-default hover:bg-[#1a1a1a] relative animate-fadeInUp">
            <div className="flex items-center gap-2">
              <Image src={faqLogo} alt="FAQ Icon" width={25} height={25} className="object-contain" />
              <span className="font-semibold text-base">FAQ!?</span>
            </div>
          </div>
        </div>

        {/* Right side: High Council */}
        <div
          className="bg-[#111] border border-[#222] rounded-md px-12 py-2 text-base cursor-pointer hover:bg-[#1a1a1a] relative animate-fadeInUp"
          onClick={() => setCouncilOpen(!councilOpen)}
        >
          <div className="flex items-center gap-2">
            <Image src={clogo} alt="cLogo" width={25} height={25} className="object-contain" />
            <span className="font-semibold text-base">High Council</span>
          </div>

          {/* Pop-up */}
          {councilOpen && (
            <div
              className="absolute top-full mt-2 right-0 w-[260px] bg-[#111] border border-[#222] rounded-md p-3 z-50 shadow-lg text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <ul className="space-y-1 text-white">
                <li><span className="font-bold text-red-400">Network Owner:</span> D3adre4p</li>
                <li><span className="font-bold text-yellow-400">Network Executor:</span> ahaz3m_</li>
                <li><span className="font-bold text-yellow-400">Network Executor:</span> Pojavxpain</li>
                <li><span className="font-bold text-yellow-400">Network Executor:</span> Pojavxcpvp</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* FULL WIDTH TABS */}
      <div className="w-full px-3 mt-2 border-b border-[#222]">
        <div className="grid grid-cols-2">
          <Link
            href="/leaderboard"
            className="text-center py-3 bg-[#111] border border-[#222] border-b-0 border-r-0 rounded-tl-xl font-semibold tracking-wide hover:bg-[#1a1a1a] animate-fadeInUp"
          >
            Leaderboard
          </Link>
          <Link
            href="/"
            className="text-center py-3 bg-yellow-500 text-black border border-yellow-400 border-b-0 rounded-tr-xl font-bold tracking-wide hover:brightness-110 animate-fadeInUp"
          >
            Tierlist
          </Link>
        </div>
      </div>

      {searchError && <p className="text-center text-red-500 mt-3">{searchError}</p>}

      {loading ? (
        <p className="text-center mt-10">Loading players...</p>
      ) : (
        <div className="p-4 sm:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full max-w-[1700px] 2xl:max-w-[1900px] mx-auto">
          {tiers.map((tier) => (
            <div key={tier} className="bg-[#111] border border-[#222] rounded-xl p-3 min-h-[420px] lg:min-h-[520px]">
              <h2 className={`text-center mb-3 py-2 rounded-lg ${getTierHeaderStyle(tier)}`}>
                {tier}
                <span className={shineStyle}></span>
              </h2>
              <div className="flex flex-col gap-2">
                {[...tierMap[tier].high, ...tierMap[tier].low].map((p) => {
                  const skinIGN = p.ign.charAt(0).toUpperCase() + p.ign.slice(1).toLowerCase();
                  const isAS = p.region.toLowerCase() === "as";
                  const isEU = p.region.toLowerCase() === "eu";

                  return (
                    <div
                      key={p.ign}
                      className="group flex h-[46px] bg-[#0f0f0f] border border-[#222] rounded-md hover:bg-[#151515] transition cursor-pointer"
                      onClick={() => setSelectedPlayer(p)}
                    >
                      <img
                        src={`https://minotar.net/helm/${skinIGN}/32.png`}
                        alt={p.ign}
                        className="w-8 h-8 m-auto rounded-sm"
                        onError={(e) => (e.currentTarget.src = "https://minotar.net/helm/Steve/32.png")}
                      />
                      <div className="flex-1 flex items-center pl-2 text-sm gap-2">
                        <div className="flex gap-[2px]">
                          {p.tier.toUpperCase().startsWith("HT") ? (
                            <>
                              <span className="text-yellow-400 font-bold">|</span>
                              <span className="text-yellow-400 font-bold">|</span>
                            </>
                          ) : (
                            <span className="text-yellow-400 font-bold">|</span>
                          )}
                        </div>
                        <span>{p.ign}</span>
                      </div>
                      <div className="flex items-center pr-2">
                        <div
                          className={`flex items-center justify-center h-5 w-[3px] text-[10px] font-bold rounded-full text-white overflow-hidden transition-all duration-200 group-hover:w-10 group-hover:rounded-md ${
                            isAS ? "bg-red-500" : isEU ? "bg-green-500" : "bg-gray-500"
                          }`}
                        >
                          <span className="opacity-0 group-hover:opacity-100 transition">
                            {p.region.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPlayer && (
        <div
          className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-50"
          onClick={() => setSelectedPlayer(null)}
        >
          <div
            className="bg-[#111] border border-[#222] rounded-2xl shadow-xl px-6 py-5 flex flex-col items-center gap-3 w-[92%] sm:w-[280px] md:w-[320px] max-w-[340px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-4 text-white text-lg font-bold opacity-70 hover:opacity-100"
              onClick={() => setSelectedPlayer(null)}
            >
              ×
            </button>

            <h2 className="text-white font-bold text-lg tracking-wide">
              {selectedPlayer.ign}
            </h2>

            <div className="text-gray-400 text-sm">
              Region : {selectedPlayer.region.toUpperCase()}
            </div>

            <div className="w-[220px] h-[320px] flex items-center justify-center">
              <MinecraftSkinViewer ign={selectedPlayer.ign} />
            </div>

            <div className="bg-yellow-400 text-black font-bold px-4 py-1 rounded-md relative overflow-hidden">
              <span className="absolute top-0 left-[-75%] w-3/4 h-full bg-white opacity-20 transform -skew-x-12 animate-shine"></span>
              {selectedPlayer.tier.toUpperCase()}
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes shine { 0% { left: -75%; } 100% { left: 125%; } }
          .animate-shine { animation: shine 2s linear infinite; }
        `}
      </style>
    </main>
  );
}
