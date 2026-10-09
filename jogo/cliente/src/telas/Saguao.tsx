// Saguão em passos, um de cada vez e o mesmo para a mesa toda (a etapa fica no servidor): primeiro quem joga entra e
// o anfitrião põe bots nos lugares livres; depois o anfitrião define as regras (mulligan e auxílios) enquanto os
// outros acompanham; por fim cada um escolhe o deck, com a prévia das cartas antes de escolher. Cada passo entra
// deslizando para o lado em que a mesa andou. Se um lugar vagar, a sala volta para os lugares (os decks escolhidos
// continuam marcados).

import { useEffect, useRef, useState } from 'preact/hooks';
import { lazy, Suspense } from 'preact/compat';
import { loja, useLoja } from '../loja.ts';
import { nomeCarta, urlArte } from '../cartas.ts';
import { Simbolos } from '../mesa/Simbolos.tsx';
import { quandoOcioso } from '../ocioso.ts';
import { EscolhaRetrato } from './EscolhaRetrato.tsx';
import { Avatar } from '../mesa/Avatar.tsx';
import { avatarDoAssento } from '../avatares.ts';
import type { AssentoPublico, DeckResumo, EtapaSaguao, SalaPublica } from '../../../servidor/protocolo.ts';
import { NIVEIS_BOT, NIVEL_PADRAO, nomeNivel, type NivelBot } from '../../../bots/niveis.ts';

// a prévia do deck fica fora do pacote inicial: o código vem com a página parada assim que o passo dos decks aparece
// (o clique num deck já o encontra carregado; se não, a janela abre um instante depois, sem nada no lugar)
const carregarPrevia = () => import('./PreviaDeck.tsx');
const PreviaDeck = lazy(() => carregarPrevia().then((m) => ({ default: m.PreviaDeck })));

const cores = (d: DeckResumo) => d.cores.map((c) => `{${c}}`).join('');
const ORDEM: Record<EtapaSaguao, number> = { lugares: 0, regras: 1, decks: 2 };
const PASSOS: [EtapaSaguao, string][] = [['lugares', 'Lugares'], ['regras', 'Regras'], ['decks', 'Decks']];
const ordenados = (decks: DeckResumo[]) => [...decks].sort((a, b) => a.nome.localeCompare(b.nome));

function Selo({ a, sala }: { a: AssentoPublico; sala: SalaPublica }) {
  return (
    <>
      {a.tipo === 'bot' && <span class="etiqueta">bot</span>}
      {a.indice === sala.anfitriao && <span class="etiqueta destaque">anfitrião</span>}
      {a.tipo === 'humano' && !a.conectado && <span class="etiqueta alerta">desconectado</span>}
    </>
  );
}

const nomeAssento = (a: AssentoPublico) => (a.tipo === 'vazio' ? null : a.tipo === 'bot' ? <>{a.nome} <span class="nivel-bot">· {nomeNivel(a.nivel ?? NIVEL_PADRAO)}</span></> : a.nome);

function SelectNivel({ valor, mudar, rotulo = 'Nível' }: { valor: NivelBot; mudar: (n: NivelBot) => void; rotulo?: string }) {
  return (
    <label class="nivel-select">
      <span>{rotulo}</span>
      <select value={valor} title={NIVEIS_BOT.find((n) => n.id === valor)?.descricao} onChange={(ev) => mudar((ev.target as HTMLSelectElement).value as NivelBot)}>
        {NIVEIS_BOT.map((n) => <option key={n.id} value={n.id} title={n.descricao}>{n.nome}</option>)}
      </select>
    </label>
  );
}

/** passo 1: os lugares; o anfitrião põe bots (com um deck sorteado, que dá para trocar no passo dos decks) */
function PassoLugares({ sala, eu, decks }: { sala: SalaPublica; eu: number; decks: DeckResumo[] }) {
  const anfitriao = eu === sala.anfitriao;
  const [nivelNovo, setNivelNovo] = useState<Record<number, NivelBot>>({});
  const [copiado, setCopiado] = useState(false);
  const [trocarRetrato, setTrocarRetrato] = useState(false);
  const retratoDe = (a: AssentoPublico) => avatarDoAssento(a.avatar, decks.find((d) => d.id === a.deck)?.comandante);
  const livres = sala.assentos.filter((a) => a.tipo === 'vazio').length;
  const deckSorteado = () => {
    const usados = new Set(sala.assentos.map((a) => a.deck));
    const sobra = decks.filter((d) => !usados.has(d.id));
    const l = sobra.length ? sobra : decks;
    return l[Math.floor(Math.random() * l.length)]?.id ?? null;
  };
  const copiar = () => {
    void navigator.clipboard?.writeText(sala.codigo).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 1800); }).catch(() => {});
  };
  return (
    <div class="saguao-passo">
      <div class="saguao-codigo">
        <div>
          <span class="rot">Código da sala</span>
          <strong>{sala.codigo}</strong>
        </div>
        <p class="suave">Passe o código e a senha para quem vai jogar. {sala.modo === '4p' ? 'Quatro jogadores, todos contra todos.' : 'Um contra um.'}</p>
        <button type="button" class="botao pequeno" onClick={copiar}>{copiado ? 'Copiado' : 'Copiar código'}</button>
      </div>
      <ol class={`lugares lugares-${sala.assentos.length}`}>
        {sala.assentos.map((a) => (
          <li key={a.indice} class={`lugar lugar-${a.tipo} ${a.indice === eu ? 'meu' : ''}`}>
            {a.tipo !== 'vazio' && retratoDe(a)
              ? <span class="lugar-avatar com-retrato" aria-hidden="true"><Avatar jogador={a.indice} avatar={retratoDe(a)} vida={0} nome={a.nome ?? '?'} local tamanho={52} cor="var(--ouro)" /></span>
              : <span class="lugar-avatar" aria-hidden="true">{a.tipo === 'vazio' ? '' : a.tipo === 'bot' ? '⚙' : (a.nome ?? '?').slice(0, 1).toUpperCase()}</span>}
            <span class="lugar-texto">
              <span class="assento-nome">{nomeAssento(a) ?? <em class="suave">Lugar livre</em>}<Selo a={a} sala={sala} /></span>
              <span class="lugar-sub">{a.tipo === 'vazio' ? 'esperando alguém entrar' : a.tipo === 'bot' ? 'joga sozinho' : a.indice === eu ? 'você' : 'na sala'}</span>
              {a.indice === eu && <button type="button" class="botao pequeno trocar-retrato" onClick={() => setTrocarRetrato(true)}>Trocar retrato</button>}
            </span>
            {anfitriao && a.tipo === 'vazio' && (
              <span class="lugar-acoes">
                <SelectNivel valor={nivelNovo[a.indice] ?? NIVEL_PADRAO} mudar={(n) => setNivelNovo({ ...nivelNovo, [a.indice]: n })} />
                <button type="button" class="botao pequeno" aria-label={`Pôr bot no lugar ${a.indice + 1}`} disabled={!decks.length}
                  onClick={() => loja.enviar({ t: 'bot', assento: a.indice, deck: deckSorteado(), nivel: nivelNovo[a.indice] ?? NIVEL_PADRAO })}>Pôr bot</button>
              </span>
            )}
            {anfitriao && a.tipo === 'bot' && (
              <span class="lugar-acoes">
                <SelectNivel valor={a.nivel ?? NIVEL_PADRAO} mudar={(n) => loja.enviar({ t: 'bot', assento: a.indice, deck: a.deck, nivel: n })} />
                <button type="button" class="botao pequeno fantasma" aria-label={`Tirar o bot do lugar ${a.indice + 1}`} onClick={() => loja.enviar({ t: 'bot', assento: a.indice, deck: null })}>Tirar</button>
              </span>
            )}
          </li>
        ))}
      </ol>
      {trocarRetrato && <EscolhaRetrato atual={sala.assentos[eu]?.avatar ?? null} nome={sala.assentos[eu]?.nome ?? ''} cor="var(--ouro)" fechar={() => setTrocarRetrato(false)} />}
      <footer class="saguao-rodape">
        {anfitriao
          ? <>
              <p class="suave">{livres ? `${livres === 1 ? 'Falta 1 lugar' : `Faltam ${livres} lugares`}: espere alguém entrar ou ponha um bot.` : 'Todos os lugares estão ocupados.'}</p>
              <button class="botao cheio grande" disabled={livres > 0} onClick={() => loja.enviar({ t: 'etapa', etapa: 'regras' })}>Continuar para as regras</button>
            </>
          : <p class="saguao-espera"><span class="pulso" aria-hidden="true" />{livres ? 'Esperando os outros entrarem.' : 'Esperando o anfitrião continuar.'}</p>}
      </footer>
    </div>
  );
}

/** passo 2: as regras da sala; só o anfitrião muda, os outros acompanham */
function PassoRegras({ sala, eu }: { sala: SalaPublica; eu: number }) {
  const anfitriao = eu === sala.anfitriao;
  return (
    <div class="saguao-passo">
      <div class="regras">
        <section class="opcao">
          <h2 class="rot">Regra de mulligan</h2>
          <div class="segmentado" role="radiogroup" aria-label="Regra de mulligan">
            {([['londres', 'Londres', 'compra 7 e põe cartas no fundo'], ['livre', 'Livre', 'troca a mão inteira, até 3 vezes']] as const).map(([id, nome, dica]) => (
              <button key={id} type="button" role="radio" aria-checked={sala.mulligan === id} class={sala.mulligan === id ? 'ativo' : ''} disabled={!anfitriao}
                onClick={() => loja.enviar({ t: 'mulligan', regra: id })}>{nome}<small>{dica}</small></button>
            ))}
          </div>
        </section>
        <section class="opcao">
          <h2 class="rot">Auxílios</h2>
          <div class="segmentado" role="radiogroup" aria-label="Auxílios">
            {([['permitidos', 'Permitidos', 'cada um escolhe nas Configurações'], ['proibidos', 'Proibidos', 'todos jogam em Mesa real']] as const).map(([id, nome, dica]) => (
              <button key={id} type="button" role="radio" aria-checked={sala.auxilios === id} class={sala.auxilios === id ? 'ativo' : ''} disabled={!anfitriao}
                onClick={() => loja.enviar({ t: 'auxilios', regra: id })}>{nome}<small>{dica}</small></button>
            ))}
          </div>
          <p class="suave dica-opcao">Auxílios são os brilhos nas cartas jogáveis, os avisos e o pagamento automático.</p>
        </section>
      </div>
      <footer class="saguao-rodape">
        {anfitriao
          ? <>
              <button class="botao fantasma" onClick={() => loja.enviar({ t: 'etapa', etapa: 'lugares' })}>Voltar</button>
              <button class="botao cheio grande" onClick={() => loja.enviar({ t: 'etapa', etapa: 'decks' })}>Continuar para os decks</button>
            </>
          : <p class="saguao-espera"><span class="pulso" aria-hidden="true" />O anfitrião está escolhendo as regras.</p>}
      </footer>
    </div>
  );
}

function CartaoDeck({ d, meu, de, abrir }: { d: DeckResumo; meu: boolean; de: string[]; abrir: () => void }) {
  const arte = urlArte(d.comandante);
  return (
    <button type="button" class={`deck ${meu ? 'ativo' : ''}`} onClick={abrir} style={arte ? { backgroundImage: `url(${arte})` } : undefined} aria-pressed={meu} title="Ver as cartas e escolher">
      {meu && <span class="deck-selo">Seu deck</span>}
      {de.length > 0 && <span class="deck-quem">{de.join(', ')}</span>}
      <span class="deck-info">
        <span class="deck-nome">{d.nome}</span>
        <span class="deck-cmd"><span>{nomeCarta(d.comandante, d.comandante).split(',')[0]}</span><Simbolos custo={cores(d)} /></span>
      </span>
      <span class="deck-ver" aria-hidden="true">Ver cartas</span>
    </button>
  );
}

/** passo 3: cada um escolhe o deck (clicar abre a prévia); o anfitrião escolhe também o dos bots */
function PassoDecks({ sala, eu, decks }: { sala: SalaPublica; eu: number; decks: DeckResumo[] }) {
  const anfitriao = eu === sala.anfitriao;
  const [previa, setPrevia] = useState<DeckResumo | null>(null);
  useEffect(() => quandoOcioso(() => void carregarPrevia()), []);
  const meuDeck = sala.assentos[eu]?.deck ?? null;
  const deckDe = (id: string | null) => decks.find((d) => d.id === id) ?? null;
  const faltam = sala.assentos.filter((a) => a.tipo !== 'vazio' && !a.deck).length;
  const pronto = sala.assentos.every((a) => a.tipo !== 'vazio' && a.deck);
  return (
    <div class="saguao-passo saguao-decks">
      <aside class="decks-lugares">
        <h2 class="rot">Quem escolheu</h2>
        <ol>
          {sala.assentos.map((a) => {
            const deck = deckDe(a.deck);
            const arte = deck ? urlArte(deck.comandante) : null;
            return (
              <li key={a.indice} class={`assento ${deck ? 'com-deck' : ''}`}>
                <span class={`assento-arte ${arte ? 'com-arte' : ''}`} style={arte ? { backgroundImage: `url(${arte})` } : undefined} />
                <span>
                  <span class="assento-nome">{nomeAssento(a) ?? <em class="suave">livre</em>}<Selo a={a} sala={sala} /></span>
                  <span class="assento-deck">{deck ? deck.nome : a.tipo === 'vazio' ? 'esperando alguém' : 'escolhendo…'}</span>
                  {anfitriao && a.tipo === 'bot' && (
                    <label class="deck-bot">
                      <span>Deck do bot</span>
                      <select value={a.deck ?? ''} onChange={(ev) => loja.enviar({ t: 'bot', assento: a.indice, deck: (ev.target as HTMLSelectElement).value, nivel: a.nivel ?? NIVEL_PADRAO })}>
                        {ordenados(decks).map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
                      </select>
                    </label>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </aside>
      <section class="decks-escolha">
        <div class="sala-dir-topo">
          <h2 class="titulo-verde">{meuDeck ? 'Seu deck' : 'Escolha seu deck'}</h2>
          <span class="sala-dir-decks">
            <span class="suave">Clique num deck para ver as cartas</span>
            <button type="button" class="botao pequeno" onClick={() => void loja.abrirDecks()} title="Importar um deck pelo link do Moxfield ou atualizar os da mesa">Decks</button>
          </span>
        </div>
        <div class="decks">
          {ordenados(decks).map((d) => (
            <CartaoDeck key={d.id} d={d} meu={d.id === meuDeck} abrir={() => setPrevia(d)}
              de={sala.assentos.filter((a) => a.deck === d.id && a.indice !== eu && a.tipo !== 'vazio').map((a) => a.nome ?? '?')} />
          ))}
        </div>
      </section>
      <footer class="saguao-rodape">
        {anfitriao
          ? <>
              <button class="botao fantasma" onClick={() => loja.enviar({ t: 'etapa', etapa: 'regras' })}>Voltar</button>
              <p class="suave">{pronto ? 'Todos escolheram.' : faltam === 1 ? 'Falta 1 pessoa escolher o deck.' : `Faltam ${faltam} escolherem o deck.`}</p>
              <button class="botao cheio grande" disabled={!pronto} onClick={() => loja.enviar({ t: sala.estado === 'fim' ? 'novaPartida' : 'iniciar' })}>Começar a partida</button>
            </>
          : <p class="saguao-espera"><span class="pulso" aria-hidden="true" />{meuDeck ? (pronto ? 'Esperando o anfitrião começar.' : 'Esperando os outros escolherem.') : 'Escolha seu deck.'}</p>}
      </footer>
      {previa && <Suspense fallback={null}><PreviaDeck d={previa} meu={previa.id === meuDeck} escolher={() => loja.enviar({ t: 'deck', deck: previa.id })} fechar={() => setPrevia(null)} /></Suspense>}
    </div>
  );
}

export function Saguao() {
  const e = useLoja();
  const sala = e.sala!;
  const eu = e.voce!;
  const etapa = sala.etapa ?? 'lugares';
  // o passo novo entra do lado em que a mesa andou
  const anterior = useRef(etapa);
  const sentido = useRef<'frente' | 'tras'>('frente');
  if (anterior.current !== etapa) {
    sentido.current = ORDEM[etapa] > ORDEM[anterior.current] ? 'frente' : 'tras';
    anterior.current = etapa;
  }

  return (
    <div class="tela-fundo">
      <main class="janela saguao">
        <header class="saguao-topo">
          <div>
            <h1 class="sala-codigo">Sala {sala.codigo}</h1>
            <p class="sala-sub">{sala.modo === '4p' ? 'Quatro jogadores, todos contra todos' : 'Um contra um'}</p>
          </div>
          <ol class="saguao-passos" aria-label="Passos do saguão">
            {PASSOS.map(([id, nome], i) => (
              <li key={id} class={i < ORDEM[etapa] ? 'feito' : i === ORDEM[etapa] ? 'atual' : ''} aria-current={i === ORDEM[etapa] ? 'step' : undefined}>
                <span class="saguao-passo-n">{i + 1}</span>{nome}
              </li>
            ))}
          </ol>
          <button class="botao fantasma" onClick={() => loja.enviar({ t: 'sair' })}>Sair da sala</button>
        </header>
        {sala.estado === 'fim' && <p class="faixa">A última partida terminou. Quem criou a sala pode começar outra.</p>}
        <div key={etapa} class={`passo passo-${sentido.current}`}>
          {etapa === 'lugares' && <PassoLugares sala={sala} eu={eu} decks={e.decks} />}
          {etapa === 'regras' && <PassoRegras sala={sala} eu={eu} />}
          {etapa === 'decks' && <PassoDecks sala={sala} eu={eu} decks={e.decks} />}
        </div>
      </main>
    </div>
  );
}
