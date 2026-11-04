import { useState } from "react";
import {
  Activity, ArrowDownUp, ArrowLeftRight, ArrowRight, Bell, CalendarDays,
  ChevronDown, ChevronRight, CircleHelp, Coins, Crown, Gift, Home,
  Menu, Search, Settings, Shield, ShoppingBag, Swords, Trophy, Users,
  Wallet, X, Zap, Star, LockKeyhole, Sparkles, ChartNoAxesCombined
} from "lucide-react";

type Section = "Início" | "Jogar" | "Meu Clube" | "Cartas" | "Mercado" | "Leilões" | "Carreira" | "Competições" | "Amigos";
const nav: { label: Section; icon: typeof Home }[] = [
  { label: "Início", icon: Home }, { label: "Jogar", icon: Swords },
  { label: "Meu Clube", icon: Shield }, { label: "Cartas", icon: Crown },
  { label: "Mercado", icon: ShoppingBag }, { label: "Leilões", icon: ArrowDownUp },
  { label: "Carreira", icon: ChartNoAxesCombined }, { label: "Competições", icon: Trophy },
  { label: "Amigos", icon: Users }
];
const players = [
  { name: "Atacante Estrela", club: "WORLD XI", pos: "ATA", rating: 92, rarity: "ÍDOLO", color: "icon" },
  { name: "Meia Maestro", club: "WORLD XI", pos: "MEI", rating: 89, rarity: "LENDÁRIA", color: "gold" },
  { name: "Defensor Muralha", club: "WORLD XI", pos: "ZAG", rating: 86, rarity: "ÉPICA", color: "purple" }
];
const auctions = [
  { name: "Atacante Estrela", pos: "ATA · ÍDOLO", rating: 92, bid: "125.000", time: "12 min" },
  { name: "Meia Maestro", pos: "MEI · LENDÁRIA", rating: 89, bid: "87.500", time: "28 min" },
  { name: "Goleiro Seguro", pos: "GOL · ÉPICA", rating: 85, bid: "42.000", time: "51 min" }
];

function PlayerCard({ player, compact = false }: { player: typeof players[number]; compact?: boolean }) {
  return <div className={`player-card ${player.color} ${compact ? "compact" : ""}`}>
    <div className="player-card-top"><span>{player.rarity}</span><Star size={13} fill="currentColor"/></div>
    <div className="player-rating">{player.rating}<small>{player.pos}</small></div>
    <div className="player-silhouette"><div className="silhouette-head"/><div className="silhouette-body"/></div>
    <div className="player-card-name">{player.name}</div><div className="player-card-club">{player.club}</div>
  </div>;
}

export default function App() {
  const [section, setSection] = useState<Section>("Início");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [packOpen, setPackOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");

  function navigate(next: Section) { setSection(next); setMobileOpen(false); setPackOpen(false); }
  function showNotice(message: string) { setNotice(message); window.setTimeout(() => setNotice(""), 2600); }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-emblem"><Trophy size={21}/></div><div><b>WORLD FOOTBALL</b><span>2027 · THE FOOTBALL UNIVERSE</span></div><button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={18}/></button></div>
      <div className="season-card"><span className="season-label">TEMPORADA</span><strong>2027 <span>SEASON 01</span></strong><div className="season-progress"><i/></div><small>Pré-temporada · Projeto em construção</small></div>
      <div className="nav-label">JOGO</div>
      <nav>{nav.slice(0, 3).map(item => <button key={item.label} className={section === item.label ? "nav-link selected" : "nav-link"} onClick={() => navigate(item.label)}><item.icon size={18}/>{item.label}{item.label === "Jogar" && <span className="nav-live">NOVO</span>}</button>)}</nav>
      <div className="nav-label">ULTIMATE TEAM</div>
      <nav>{nav.slice(3, 6).map(item => <button key={item.label} className={section === item.label ? "nav-link selected" : "nav-link"} onClick={() => navigate(item.label)}><item.icon size={18}/>{item.label}</button>)}</nav>
      <div className="nav-label">COMUNIDADE</div>
      <nav>{nav.slice(6).map(item => <button key={item.label} className={section === item.label ? "nav-link selected" : "nav-link"} onClick={() => navigate(item.label)}><item.icon size={18}/>{item.label}</button>)}</nav>
      <div className="sidebar-bottom"><div className="secure-mark"><LockKeyhole size={16}/></div><div><b>PROJETO EM DESENVOLVIMENTO</b><p>Recursos serão ativados por etapas. Nenhuma economia real está habilitada.</p></div></div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <button className="menu-toggle" onClick={() => setMobileOpen(true)}><Menu size={20}/></button>
        <div className="breadcrumb">WORLD FOOTBALL <ChevronRight size={14}/><b>{section}</b></div>
        <div className="topbar-actions"><div className="season-pill"><span/> ONLINE · DEMO</div><button className="top-icon" aria-label="Notificações" onClick={() => showNotice("Central de notificações em desenvolvimento.")}><Bell size={18}/></button><button className="profile-chip" onClick={() => showNotice("Perfil e autenticação serão conectados ao Supabase.")}><span className="profile-avatar">WF</span><span>Meu perfil</span><ChevronDown size={14}/></button></div>
      </header>

      <div className="page-content">
        {section === "Início" ? <>
          <section className="welcome-line"><div><div className="eyebrow"><span className="eyebrow-dot"/> SEU UNIVERSO DO FUTEBOL</div><h1>O futebol é seu.<span> Viva o jogo.</span></h1><p>Monte seu elenco, abra pacotes e prepare-se para entrar em campo.</p></div><div className="welcome-season"><CalendarDays size={15}/> TEMPORADA 2027</div></section>
          <section className="hero-banner"><div className="hero-bg-ball"/><div className="hero-content"><div className="hero-kicker"><Sparkles size={14}/> WORLD FOOTBALL 2027</div><h2>CONSTRUA SEU<br/><em>TIME DOS SONHOS.</em></h2><p>Crie seu clube. Colecione craques. Domine o campo.</p><button className="gold-button" onClick={() => navigate("Meu Clube")}>MONTAR MEU ELENCO <ArrowRight size={16}/></button></div><div className="hero-side-stat"><span>SEASON</span><b>01</b><small>ROAD TO GLORY</small></div><div className="hero-stadium-lines"/></section>

          <section className="overview-grid">
            <div className="overview-card"><div className="overview-icon"><Coins size={19}/></div><div><span>MOEDAS DO JOGO</span><b>—</b><small>Economia será conectada</small></div></div>
            <div className="overview-card"><div className="overview-icon blue"><Shield size={19}/></div><div><span>MEU CLUBE</span><b>WORLD FC</b><small>Elenco inicial em configuração</small></div></div>
            <div className="overview-card"><div className="overview-icon purple"><Trophy size={19}/></div><div><span>DIVISÃO</span><b>INICIANTE</b><small>Temporada ainda não iniciada</small></div></div>
          </section>

          <div className="section-title"><div><span className="eyebrow">EXPLORE O JOGO</span><h2>Entre em ação</h2></div><button className="plain-link" onClick={() => navigate("Jogar")}>Ver modos <ArrowRight size={15}/></button></div>
          <section className="mode-grid">
            <button className="mode-card mode-match" onClick={() => navigate("Jogar")}><div className="mode-art"><Swords size={42}/></div><div><span>EM CAMPO</span><b>Partida rápida</b><small>Prepare-se para jogar</small></div><ArrowRight className="mode-arrow"/></button>
            <button className="mode-card mode-team" onClick={() => navigate("Meu Clube")}><div className="mode-art"><Shield size={42}/></div><div><span>SEU ESQUADRÃO</span><b>Meu Clube</b><small>Escalação e táticas</small></div><ArrowRight className="mode-arrow"/></button>
            <button className="mode-card mode-cards" onClick={() => navigate("Cartas")}><div className="mode-art"><Crown size={42}/></div><div><span>ULTIMATE TEAM</span><b>Cartas e pacotes</b><small>Monte sua coleção</small></div><ArrowRight className="mode-arrow"/></button>
          </section>
          <div className="section-title section-title-spaced"><div><span className="eyebrow">ULTIMATE TEAM</span><h2>Craques em destaque</h2></div><button className="plain-link" onClick={() => navigate("Cartas")}>Minha coleção <ArrowRight size={15}/></button></div>
          <section className="featured-cards">{players.map(p => <PlayerCard key={p.name} player={p}/>)}</section>
          <section className="bottom-notes"><div><Gift size={19}/><div><b>Eventos e recompensas</b><p>Desafios diários, temporadas e eventos especiais entrarão no roadmap.</p></div></div><div><Activity size={19}/><div><b>Desenvolvimento por etapas</b><p>Esta é a fundação visual. Dados reais e partidas ainda serão implementados.</p></div></div></section>
        </> : <ModulePage section={section} onNavigate={navigate} onPack={() => setPackOpen(true)} onNotice={showNotice} search={search} setSearch={setSearch}/>}
      </div>
      <footer className="app-footer"><span>© 2026–2027 WORLD FOOTBALL</span><span>BUILD 0.1 · FUNDAÇÃO VISUAL</span></footer>
    </main>

    {packOpen && <div className="modal-overlay" onClick={() => setPackOpen(false)}><div className="pack-modal" onClick={e => e.stopPropagation()}><button className="modal-x" onClick={() => setPackOpen(false)}><X size={18}/></button><div className="pack-glow"><div className="pack-box"><Crown size={46}/><b>WF</b></div></div><span className="eyebrow">ABERTURA DE PACOTE · PRÉVIA VISUAL</span><h2>Pacote Estrelas</h2><p>Esta animação é apenas uma prévia de interface. A abertura real, probabilidades, inventário e saldo serão conectados ao backend antes de serem ativados.</p><div className="pack-preview-card"><PlayerCard player={players[0]} compact/></div><button className="gold-button full-width" onClick={() => { setPackOpen(false); showNotice("Prévia visual encerrada. Nenhuma carta foi adicionada ao inventário."); }}>ENTENDI <ArrowRight size={16}/></button></div></div>}
    {notice && <div className="toast-message">{notice}</div>}
  </div>;
}

function ModulePage({ section, onNavigate, onPack, onNotice, search, setSearch }: {
  section: Section; onNavigate: (s: Section) => void; onPack: () => void; onNotice: (s: string) => void; search: string; setSearch: (s: string) => void;
}) {
  const descriptions: Record<Section, string> = {
    "Início": "", "Jogar": "Escolha como quer disputar suas partidas.", "Meu Clube": "Gerencie seu elenco, formação e identidade do clube.",
    "Cartas": "Colecione jogadores, abra pacotes e evolua seu time.", "Mercado": "Pesquise jogadores e acompanhe o mercado de transferências.",
    "Leilões": "Dispute cartas em leilões com outros treinadores.", "Carreira": "Construa sua trajetória como treinador e leve seu clube ao topo.",
    "Competições": "Entre em ligas, copas e desafios por temporada.", "Amigos": "Encontre amigos, convide para partidas e acompanhe seus rivais."
  };
  return <section className="module-page"><div className="module-heading"><div><div className="eyebrow">WORLD FOOTBALL 2027 · {section.toUpperCase()}</div><h1>{section}</h1><p>{descriptions[section]}</p></div><div className="module-status"><span/> EM DESENVOLVIMENTO</div></div>
    {section === "Cartas" ? <><div className="module-banner card-banner"><div><span className="eyebrow">ULTIMATE TEAM</span><h2>Sua coleção começa aqui.</h2><p>Pacotes, raridades, evolução e coleção de jogadores.</p><button className="gold-button" onClick={onPack}>VER PRÉVIA DE PACOTE <Sparkles size={15}/></button></div><Crown size={90}/></div><div className="section-title"><div><span className="eyebrow">COLEÇÃO DEMONSTRATIVA</span><h2>Cartas em destaque</h2></div></div><div className="featured-cards">{players.map(p => <PlayerCard key={p.name} player={p}/>)}</div><p className="info-line"><LockKeyhole size={15}/> Cartas de demonstração. Inventário, probabilidades e transações ainda não estão ativos.</p></> :
    section === "Mercado" || section === "Leilões" ? <><div className="market-toolbar"><label><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar jogador, posição ou raridade..."/></label><button className="filter-button" onClick={() => onNotice("Filtros avançados serão adicionados nesta etapa.")}>Filtros <ChevronDown size={15}/></button></div><div className="market-list">{auctions.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.pos.toLowerCase().includes(search.toLowerCase())).map(a => <div className="market-row" key={a.name}><div className="mini-card"><span>{a.rating}</span><Crown size={18}/></div><div className="market-player"><b>{a.name}</b><small>{a.pos}</small></div><div className="market-price"><small>{section === "Leilões" ? "LANCE ATUAL" : "PREÇO DE REFERÊNCIA"}</small><b>{a.bid} <i>COINS</i></b></div><div className="market-time"><small>{section === "Leilões" ? "TEMPO RESTANTE (DEMO)" : "STATUS"}</small><b>{section === "Leilões" ? a.time : "EM BREVE"}</b></div><button className="row-action" onClick={() => onNotice("Ações de compra e lance serão ativadas após integração segura do backend.")}>{section === "Leilões" ? "Ver leilão" : "Ver carta"} <ArrowRight size={14}/></button></div>)}</div><p className="info-line"><LockKeyhole size={15}/> Valores ilustrativos. Não há compra, venda ou lances reais nesta versão.</p></> :
    section === "Meu Clube" ? <><div className="club-overview"><div className="club-crest"><Shield size={54}/><b>WF</b></div><div><span className="eyebrow">CLUBE DO TREINADOR</span><h2>WORLD FC</h2><p>Identidade, elenco, escalação e táticas em construção.</p></div><button className="outline-button" onClick={() => onNotice("Editor do clube será implementado na próxima etapa.")}>Editar clube</button></div><div className="section-title"><div><span className="eyebrow">FORMAÇÃO</span><h2>Campo tático · 4-3-3</h2></div></div><div className="tactics-pitch"><div className="pitch-line center-circle"/>{["ATA","ATA","ATA","MEI","MEI","MEI","DEF","DEF","DEF","DEF","GOL"].map((p,i)=><div className="tactic-player" key={i} style={{left: i===10 ? "50%" : ["25%","50%","75%","35%","50%","65%","20%","40%","60%","80%"][i], top: i===10 ? "87%" : ["13%","8%","13%","35%","39%","35%","62%","66%","66%","62%"][i]}}><span>{p}</span></div>)}</div><p className="info-line">Escalação ilustrativa. Cadastro e evolução do elenco serão conectados ao inventário.</p></> :
    <div className="coming-grid">{(section === "Jogar" ? [["Partida rápida","Entre em campo contra a IA ou outro jogador.",Swords],["Treino","Pratique passes, finalizações e cobranças.",Zap],["PvP online","Desafie outros treinadores em tempo real.",Users]] : section === "Carreira" ? [["Carreira de treinador","Contratações, táticas, objetivos e temporadas.",ChartNoAxesCombined],["Base de jovens","Revele promessas e desenvolva talentos.",Star],["Gestão do clube","Finanças, estádio, equipe técnica e reputação.",Shield]] : section === "Competições" ? [["Ligas online","Suba de divisão e dispute temporadas.",Trophy],["Copas","Torneios eliminatórios e premiações.",Crown],["Eventos","Desafios especiais por tempo limitado.",CalendarDays]] : [["Adicionar amigos","Encontre treinadores e monte sua rede.",Users],["Convites","Convide amigos para partidas e clubes.",ArrowLeftRight],["Classificação","Compare resultados e conquistas.",ChartNoAxesCombined]]).map(([title,desc,Icon])=>{const I=Icon as typeof Home;return <div className="coming-card" key={title as string}><div className="coming-icon"><I size={23}/></div><h3>{title as string}</h3><p>{desc as string}</p><span>PLANEJADO</span><button onClick={() => onNotice("Este módulo está no planejamento e ainda não está ativo.")}>Detalhes <ArrowRight size={14}/></button></div>})}</div>}
  </section>;
}
