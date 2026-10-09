// Tela inicial em passos, uma coisa de cada vez: o nome, depois criar ou entrar numa sala, depois só os campos
// daquela escolha. Cada passo entra deslizando (para frente ou para trás) e o painel acompanha a altura com uma
// transição; Enter avança, Esc volta. Quem já tem o nome guardado começa na escolha.

import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { Marca } from '../icones.tsx';
import { loja } from '../loja.ts';
import type { Modo } from '../../../servidor/protocolo.ts';

const NOME = 'commander-da-mesa:nome';
function nomeGuardado(): string {
  try { return localStorage.getItem(NOME) ?? ''; } catch { return ''; }
}
function guardarNome(n: string): void {
  try { localStorage.setItem(NOME, n); } catch { /* sem armazenamento */ }
}

type Passo = 'nome' | 'escolha' | 'criar' | 'entrar';
const ORDEM: Record<Passo, number> = { nome: 0, escolha: 1, criar: 2, entrar: 2 };

const IconeCriar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M12 8v8M8 12h8" /></svg>
);
const IconeEntrar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /></svg>
);
const IconeVoltar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
);

/** o painel acompanha a altura do passo atual com uma transição (o conteúdo novo é medido a cada mudança) */
function AlturaSuave({ children }: { children: ComponentChildren }) {
  const fora = useRef<HTMLDivElement>(null);
  const dentro = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const f = fora.current, d = dentro.current;
    if (!f || !d) return;
    f.style.height = `${d.offsetHeight}px`;
    const ro = new ResizeObserver(() => { f.style.height = `${d.offsetHeight}px`; });
    ro.observe(d);
    // a primeira medida vale sem animar; depois liga a transição
    requestAnimationFrame(() => f.classList.add('animar'));
    return () => ro.disconnect();
  }, []);
  return <div ref={fora} class="altura-suave"><div ref={dentro}>{children}</div></div>;
}

export function Inicio() {
  const [nome, setNome] = useState(nomeGuardado());
  const [passo, setPassoAtual] = useState<Passo>(() => (nomeGuardado().trim() ? 'escolha' : 'nome'));
  const [sentido, setSentido] = useState<'frente' | 'tras'>('frente');
  const [modo, setModo] = useState<Modo>('4p');
  const [senhaNova, setSenhaNova] = useState('');
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const val = (f: (s: string) => void) => (e: Event) => f((e.target as HTMLInputElement).value);
  const nomeLimpo = nome.replace(/\s+/g, ' ').trim();

  const ir = (p: Passo) => {
    setSentido(ORDEM[p] >= ORDEM[passo] ? 'frente' : 'tras');
    setPassoAtual(p);
  };
  const voltar = () => { if (passo === 'criar' || passo === 'entrar') ir('escolha'); else if (passo === 'escolha') ir('nome'); };

  // Esc volta um passo (fora de outras janelas)
  const voltarRef = useRef(voltar);
  voltarRef.current = voltar;
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape' && !e.defaultPrevented && !document.querySelector('.janela-fundo')) voltarRef.current(); };
    addEventListener('keydown', tecla);
    return () => removeEventListener('keydown', tecla);
  }, []);

  // o campo (ou a primeira escolha) de cada passo recebe o foco quando ele entra
  const caixaPasso = useRef<HTMLDivElement>(null);
  useEffect(() => { caixaPasso.current?.querySelector<HTMLElement>('[data-foco]')?.focus({ preventScroll: true }); }, [passo]);

  const continuar = (ev: Event) => {
    ev.preventDefault();
    if (!nomeLimpo) return;
    setNome(nomeLimpo);
    guardarNome(nomeLimpo);
    ir('escolha');
  };
  const criar = (ev: Event) => {
    ev.preventDefault();
    if (senhaNova.length < 3) return;
    loja.enviar({ t: 'criar', nome: nomeLimpo, senhaSala: senhaNova, modo });
  };
  const entrar = (ev: Event) => {
    ev.preventDefault();
    if (codigo.length !== 5 || !senha) return;
    loja.enviar({ t: 'entrar', codigo, senhaSala: senha, nome: nomeLimpo });
  };

  let conteudo;
  if (passo === 'nome') {
    conteudo = (
      <form class="passo-form" onSubmit={continuar}>
        <h1 class="passo-titulo">Como quer ser chamado, feiticeiro?</h1>
        <p class="passo-sub">É o nome que os outros vão ver na mesa.</p>
        <input class="campo-grande" value={nome} maxLength={24} onInput={val(setNome)} placeholder="Seu nome" aria-label="Seu nome na mesa" data-foco autoComplete="nickname" />
        <button class="botao cheio grande" type="submit" disabled={!nomeLimpo}>Continuar</button>
      </form>
    );
  } else if (passo === 'escolha') {
    conteudo = (
      <div class="passo-form">
        <h1 class="passo-titulo">Olá, {nomeLimpo}</h1>
        <p class="passo-sub">Que caminho você vai seguir? <button type="button" class="link-discreto" onClick={() => ir('nome')}>Trocar o nome</button></p>
        <div class="escolhas-inicio">
          <button type="button" class="escolha-inicio" onClick={() => ir('criar')} data-foco>
            <IconeCriar />
            <span><b>Criar sala</b><small>Você convoca a mesa: escolhe o formato e passa o código para os outros</small></span>
          </button>
          <button type="button" class="escolha-inicio" onClick={() => ir('entrar')}>
            <IconeEntrar />
            <span><b>Entrar numa sala</b><small>Com o código e a senha que te passaram</small></span>
          </button>
        </div>
      </div>
    );
  } else if (passo === 'criar') {
    conteudo = (
      <form class="passo-form" onSubmit={criar}>
        <button type="button" class="passo-voltar" onClick={voltar}><IconeVoltar />Voltar</button>
        <h1 class="passo-titulo">Criar sala</h1>
        <fieldset class="segmentado" style={{ border: 0, margin: 0 }} aria-label="Formato">
          <button type="button" class={modo === '4p' ? 'ativo' : ''} onClick={() => setModo('4p')}>Quatro jogadores<small>todos contra todos</small></button>
          <button type="button" class={modo === '1v1' ? 'ativo' : ''} onClick={() => setModo('1v1')}>Um contra um<small>duelo</small></button>
        </fieldset>
        <label class="campo-passo">
          Senha da sala
          <input type="password" value={senhaNova} onInput={val(setSenhaNova)} minLength={3} maxLength={64} data-foco autoComplete="new-password" />
          <small>Pelo menos 3 caracteres. Passe junto com o código para quem vai jogar.</small>
        </label>
        <button class="botao cheio grande" type="submit" disabled={senhaNova.length < 3}>Criar</button>
      </form>
    );
  } else {
    conteudo = (
      <form class="passo-form" onSubmit={entrar}>
        <button type="button" class="passo-voltar" onClick={voltar}><IconeVoltar />Voltar</button>
        <h1 class="passo-titulo">Entrar numa sala</h1>
        <label class="campo-passo">
          Código
          <input class="campo-codigo" value={codigo} onInput={(e) => setCodigo((e.target as HTMLInputElement).value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} maxLength={5} autocapitalize="characters" autoComplete="off" spellcheck={false} placeholder="ABCDE" data-foco />
        </label>
        <label class="campo-passo">
          Senha da sala
          <input type="password" value={senha} onInput={val(setSenha)} autoComplete="off" />
        </label>
        <button class="botao cheio grande" type="submit" disabled={codigo.length !== 5 || !senha}>Entrar</button>
      </form>
    );
  }

  return (
    <div class="tela-fundo">
      <main class="janela tela-passos">
        <header class="cat-topo">
          <div class="marca-jogo"><Marca /><span>MAGIC COMMANDER</span></div>
          <button type="button" class="botao" onClick={() => void loja.abrirDecks()}>Decks</button>
        </header>
        <ol class="passos-pontos" aria-label={`Passo ${ORDEM[passo] + 1} de 3`}>
          {[0, 1, 2].map((i) => <li key={i} class={i < ORDEM[passo] ? 'feito' : i === ORDEM[passo] ? 'atual' : ''} />)}
        </ol>
        <AlturaSuave>
          {/* a chave nova a cada passo remonta o conteúdo e dispara a animação de entrada */}
          <div key={passo} ref={caixaPasso} class={`passo passo-${sentido}`}>{conteudo}</div>
        </AlturaSuave>
      </main>
    </div>
  );
}
