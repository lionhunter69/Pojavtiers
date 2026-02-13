"use client";
import { useEffect, useState } from "react";
import supabase from "../../lib/supabase";
import Link from "next/link";
import logo from "../logo.png"; // adjust the path if your file is in a different folder
import Image from "next/image";
import discordIcon from "../discord.png";
import trophyIcon from "../trophy.png";
import MinecraftSkinViewer from "../MinecraftSkinViewer";
import clogo from "../clogo.png";   // High Council icon
import infoLogo from "../infologo.png";       // Information icon
import faqLogo from "../faqlogo.png";   

type Player = {
  ign: string;
  tier: string;
  region: string;
  gamemode: string;
};

export default function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState("");
  const [infoOpen, setInfoOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [councilOpen, setCouncilOpen] = useState(false);
  const [showBoxes, setShowBoxes] = useState(false);

useEffect(() => {
  setShowBoxes(true); // triggers fadeInUp on mount
}, []);


  

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .not("tier", "ilike", "R%") // hide retired
      .order("tier", { ascending: true })
      .order("ign", { ascending: true })
      .limit(10);

    if (!error) setPlayers(data as Player[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const getNumberBoxStyle = (index: number) => {
    if (index === 0) return "bg-yellow-400 text-black"; // 1st gold
    if (index === 1) return "bg-gray-300 text-black";   // 2nd silver
    if (index === 2) return "bg-[#CD7F32] text-white"; // 3rd bronze
    return "bg-gray-700 text-white";                   // rest
  };

  const getRegionColor = (region: string) => {
    if (region.toLowerCase() === "as") return "bg-red-500/70";
    if (region.toLowerCase() === "eu") return "bg-green-500/70";
    return "bg-gray-500/70";
  };

  const getRankTitle = (index: number) => {
    if (index === 0) return "Crystal GrandMaster";
    if (index >= 1 && index <= 3) return "Crystal Master";
    if (index >= 4 && index <= 6) return "Crystal Ace";
    return "Crystal Pro";
  };

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
    setSelectedPlayer(data); // popup triggers
  };

  return (
    <main className="bg-[#0b0b0b] min-h-screen text-white font-sans">

      {/* 🔥 HEADER */}
      <div className="w-full bg-[#0d0d0d] px-6 py-4 flex items-center justify-between border-b border-[#222] relative">

        <Image src={logo} alt="Logo" style={{ maxWidth: "300px", height: "auto" }} />

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
          <div className="relative group flex items-center gap-1 cursor-pointer">
            <Image src={trophyIcon} alt="Trophy" width={24} height={24} />
            <span className="font-semibold">Ranking</span>
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-max p-3 bg-[#111] border border-[#222] rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-left">
                <span>1. HT1</span><span>2. LT1</span>
                <span>3. HT2</span><span>4. LT2</span>
                <span>5. HT3</span><span>6. LT3</span>
                <span>7. HT4</span><span>8. LT4</span>
                <span>9. HT5</span><span>10.LT5</span>
              </div>
            </div>
          </div>

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

 
<div className="w-full px-6 mt-12 flex flex-col sm:flex-row justify-between gap-2">

  {/* Left side: Information + FAQ */}
  <div className="flex flex-row gap-2">
    {/* Information Box */}
    <div
      className="bg-[#111] border border-[#222] rounded-md px-12 py-2 text-base cursor-pointer hover:bg-[#1a1a1a] transition relative transition relative animate-fadeInUp"
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
    <div className="bg-[#111] border border-[#222] rounded-md px-12 py-2 text-base cursor-default hover:bg-[#1a1a1a] transition transition relative animate-fadeInUp">
      <div className="flex items-center gap-2">
        <Image src={faqLogo} alt="FAQ Icon" width={25} height={25} className="object-contain" />
        <span className="font-semibold text-base">FAQ!?</span>
      </div>
    </div>
  </div>

  {/* Right side: High Council */}
  <div
    className="bg-[#111] border border-[#222] rounded-md px-12 py-2 text-base cursor-pointer hover:bg-[#1a1a1a] transition relative transition relative animate-fadeInUp"
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


{/* 🔥 FULL WIDTH TABS */}
<div className="w-full px-3 mt-2 border-b border-[#222]">
  <div className="grid grid-cols-2">
    <Link
      href="/leaderboard"
      className="text-center py-3 bg-[#111] border border-[#222] border-b-0 border-r-0 rounded-tl-xl font-semibold tracking-wide hover:bg-[#1a1a1a] transition transition relative animate-fadeInUp"
    >
      Leaderboard
    </Link>
    <Link
      href="/"
      className="text-center py-3 bg-yellow-500 text-black border border-yellow-400 border-b-0 rounded-tr-xl font-bold tracking-wide hover:brightness-110 transition transition relative animate-fadeInUp"
    >
      Tierlist
    </Link>
  </div>
</div>


      {searchError && <p className="text-center text-red-500 mt-3">{searchError}</p>}

      {/* 🔥 LEADERBOARD CONTENT */}
      {loading ? (
        <p className="text-center mt-10">Loading leaderboard...</p>
      ) : (
        <div className="max-w-full mx-auto flex flex-col gap-3 p-8">
          {players.map((p, i) => (
            <div
              key={i}
              className={`flex items-center justify-between bg-[#111] border border-[#222] rounded-xl transition-all w-full hover:translate-x-2 hover:shadow-lg hover:shadow-yellow-400/40`}
            >
              <div
                className={`flex items-center justify-center font-bold text-lg ${getNumberBoxStyle(i)}`}
                style={{
                  width: "90px",
                  minHeight: "60px",
                  clipPath: "polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)",
                  position: "relative",
                  overflow: "hidden",
                  zIndex: 10
                }}
              >
                {i + 1}
                {i < 3 && (
                  <>
                    <span className="absolute top-0 left-[-75%] w-[10%] h-full bg-white opacity-20 transform -skew-x-12 animate-shine"></span>
                    <span className="absolute top-0 left-[-25%] w-[10%] h-full bg-white opacity-20 transform -skew-x-12 animate-shine delay-200"></span>
                    <span className="absolute top-0 left-[25%] w-[10%] h-full bg-white opacity-20 transform -skew-x-12 animate-shine delay-400"></span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 pl-4 flex-1 z-10">
                <img
                  src={`https://minotar.net/helm/${p.ign}/32.png`}
                  alt={p.ign}
                  className="w-12 h-12 rounded-sm"
                  onError={(e) =>
                    (e.currentTarget.src = "https://minotar.net/helm/Steve/32.png")
                  }
                />
                <div className="flex flex-col">
                  <span className="font-bold text-white text-lg">{p.ign}</span>
                  <span className="text-sm text-gray-300">{getRankTitle(i)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pr-6 z-10">
                <div className={`px-4 py-1 rounded-md text-sm font-semibold ${getRegionColor(p.region)}`}>
                  {p.region.toUpperCase()}
                </div>
                <div className="px-4 py-1 rounded-md text-sm font-bold bg-yellow-400/70 text-black">
                  {p.tier.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔥 SEARCH POPUP */}
      {selectedPlayer && (
              <div
                className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-50"
                onClick={() => setSelectedPlayer(null)}
              >
                <div
                  className="bg-[#111] border border-[#222] rounded-2xl shadow-xl px-6 py-5 flex flex-col items-center gap-3 w-[260px]"
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
