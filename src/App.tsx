import { useState } from "react";
import { Activity, ArrowDownToLine, ArrowUpRight, Bell, ChevronRight, CircleHelp, Crown, Flame, Gamepad2, Gift, Menu, ShieldCheck, Sparkles, Trophy, Wallet, X } from "lucide-react";

type Category = "Todos" | "Esportes" | "Arcade" | "Desafios";
const games = [
  { name: "Arena de Pênaltis", category: "Esportes", tag: "POPULAR", icon: "⚽", tone: "green", description: "Acerte o canto e marque pontos." },
  { name: "Modo Carreira", category: "Arcade", tag: "DESTAQUE", icon: "🐯", tone: "gold", description: "Um desafio visual de combinações." },
  { name: "Corrida Relâmpago", category: "Arcade", tag: "NOVO", icon: "🏎️", tone: "blue", description: "Teste seus reflexos em alta velocidade." },
  { name: "Quiz Campeão", category: "Desafios", tag: "DESAFIO", icon: "🏆", tone: "purple", description: "Responda e suba no placar." },
  { name: "Chute Certeiro", category: "Esportes", tag: "RÁPIDO", icon: "🥅", tone: "red", description: "Mire e acerte o alvo." },
  { name: "Treino de Habilidades", category: "Desafios", tag: "CASUAL", icon: "🧠", tone: "pink", description: "Encontre os pares no menor tempo." }
] as const;

export default function App() {
  const [category, setCategory] = useState<Category>("Todos");
  const [points, setPoints] = useState(10000);
  const [notice, setNotice] = useState("Bem-vindo ao WORLD FOOTBALL 2027!");
  const [selected, setSelected] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const visible = games.filter(g => category === "Todos" || g.category === category);

  function openGame(name: string) {
    setSelected(name);
    setNotice(name + " — demonstração selecionada");
  }

  return (
    <div className="app-shell">
      <aside className={menuOpen ? "sidebar open" : "sidebar"}>
        <div className="brand"><span className="brand-mark">⚽</span><span>WORLD <span className="gold-text">FOOTBALL</span></span><button className="close-menu" onClick={() => setMenuOpen(false)}><X size={19}/></button></div>
        <div className="side-label">MENU PRINCIPAL</div>
        <a className="nav-item active"><Activity size={18}/> Visão geral</a>
        <a className="nav-item" onClick={() => {setCategory("Esportes");setMenuOpen(false)}}><Trophy size={18}/> Esportes</a>
        <a className="nav-item" onClick={() => {setCategory("Arcade");setMenuOpen(false)}}><Gamepad2 size={18}/> Jogos arcade</a>
        <a className="nav-item" onClick={() => {setCategory("Desafios");setMenuOpen(false)}}><Sparkles size={18}/> Desafios</a>
        <div className="side-label second">SUA CONTA</div>
        <a className="nav-item"><Wallet size={18}/> Minha carteira</a>
        <a className="nav-item"><Trophy size={18}/> Classificação</a>
        <a className="nav-item"><CircleHelp size={18}/> Central de ajuda</a>
        <div className="sidebar-bottom"><div className="safe-icon"><ShieldCheck size={18}/></div><strong>Ambiente demonstrativo</strong><p>Somente pontos fictícios. Sem depósitos ou saques.</p></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)}><Menu/></button>
          <div className="breadcrumb">WORLD FOOTBALL <ChevronRight size={14}/> <strong>Início</strong></div>
          <div className="top-actions"><button className="icon-button" aria-label="Notificações"><Bell size={18}/><i/></button><div className="avatar">H</div></div>
        </header>

        <div className="content">
          <div className="welcome-row"><div><div className="eyebrow"><span className="live-dot"/> SIMULADOR DE FUTEBOL</div><h1>Viva o futebol<span className="gold-text">.</span></h1><p className="muted">Monte seu time, entre em campo e dispute partidas.</p></div><div className="date-chip">TEMPORADA DEMO · 2026</div></div>

          <section className="hero">
            <div className="hero-copy"><div className="hero-kicker"><Crown size={14}/> WORLD FOOTBALL 2027</div><h2>O próximo desafio<br/>começa <span>agora.</span></h2><p>Construa sua carreira no futebol. Prepare seu elenco e dispute partidas.</p><button className="primary-button" onClick={() => document.getElementById("games")?.scrollIntoView({behavior:"smooth"})}>Explorar modos <ArrowUpRight size={17}/></button></div>
            <div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="tiger">⚽</div><div className="hero-star star-one">✦</div><div className="hero-star star-two">✧</div><div className="hero-caption">PLAY<br/><b>YOUR WAY</b></div></div>
            <div className="hero-number">01 <span>/ 03</span></div>
          </section>

          <section className="stats-grid">
            <div className="stat-card"><div className="stat-icon gold-bg"><Wallet size={19}/></div><div><span className="stat-label">SALDO DEMONSTRATIVO</span><strong>{points.toLocaleString("pt-BR")} <small>PTS</small></strong><em>Créditos fictícios</em></div></div>
            <div className="stat-card"><div className="stat-icon blue-bg"><Gamepad2 size={19}/></div><div><span className="stat-label">JOGOS DISPONÍVEIS</span><strong>06</strong><em>Experiências de demonstração</em></div></div>
            <div className="stat-card"><div className="stat-icon purple-bg"><Trophy size={19}/></div><div><span className="stat-label">SUA POSIÇÃO</span><strong>—</strong><em>Ranking demonstrativo</em></div></div>
          </section>

          <div className="section-heading" id="games"><div><div className="eyebrow">ESCOLHA COMO JOGAR</div><h2>Modos de jogo</h2></div><button className="text-button" onClick={() => setCategory("Todos")}>Ver todos <ArrowUpRight size={15}/></button></div>
          <div className="filters">{(["Todos","Esportes","Arcade","Desafios"] as Category[]).map(c => <button key={c} className={category===c?"filter active-filter":"filter"} onClick={() => setCategory(c)}>{c}</button>)}</div>
          <div className="games-grid">{visible.map((game) => <article className="game-card" key={game.name}><div className={"game-cover "+game.tone}><span className="game-tag">{game.tag}</span><span className="game-art">{game.icon}</span><span className="cover-word">{game.category.toUpperCase()}</span></div><div className="game-info"><div><h3>{game.name}</h3><p>{game.description}</p></div><button className="play-button" onClick={() => openGame(game.name)} aria-label={"Abrir "+game.name}><ArrowUpRight size={18}/></button></div></article>)}</div>

          <section className="bottom-grid"><div className="promo-card"><div className="promo-icon"><Gift size={22}/></div><div><span className="eyebrow">ÁREA DE NOVIDADES</span><h3>Novos modos em desenvolvimento</h3><p>Estamos preparando novos recursos para o simulador.</p></div><Sparkles className="promo-spark" size={48}/></div><div className="notice-card"><div className="notice-icon"><ShieldCheck size={20}/></div><div><strong>Projeto em desenvolvimento</strong><p>Versão inicial do projeto. Recursos de partidas serão implementados por etapas.</p></div></div></section>
          <footer><span>© 2026 WORLD FOOTBALL 2027</span><span>PLATAFORMA DEMONSTRATIVA · PONTOS SEM VALOR MONETÁRIO</span></footer>
        </div>
      </main>

      {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="game-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}><X/></button><div className="modal-symbol">⚽</div><div className="eyebrow">MODO DE DEMONSTRAÇÃO</div><h2>{selected}</h2><p>Esta experiência está em preparação. Aqui serão adicionadas mecânicas interativas com pontuação fictícia, sem apostas ou dinheiro real.</p><div className="modal-points"><span>Seus pontos de demonstração</span><strong>{points.toLocaleString("pt-BR")} PTS</strong></div><button className="primary-button full" onClick={() => {setPoints(p => p + 25);setNotice("Você recebeu 25 pontos fictícios de teste.");setSelected(null)}}>Testar recompensa fictícia +25 pts</button><small className="modal-foot">Pontos de teste sem valor financeiro e sem possibilidade de conversão.</small></div></div>}
      <div className="toast" role="status">{notice}</div>
    </div>
  );
}