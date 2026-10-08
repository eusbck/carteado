import { loja, useLoja } from '../loja.ts';
import { nomeCarta, urlArte } from '../cartas.ts';
import { Simbolos } from '../mesa/Simbolos.tsx';
import type { DeckResumo } from '../../../servidor/protocolo.ts';
import { NIVEIS_BOT, NIVEL_PADRAO, nomeNivel, type NivelBot } from '../../../bots/niveis.ts';

const cores = (d: DeckResumo) => d.cores.map((c) => `{${c}}`).join('');

function Deck({ d, ativo, onClick }: { d: DeckResumo; ativo: boolean; onClick?: () => void }) {
  const arte = urlArte(d.comandante);
  return (
    <button type="button" class={`deck ${ativo ? 'ativo' : ''}`} onClick={onClick} disabled={!onClick} style={arte ? { backgroundImage: `url(${arte})` } : undefined} aria-pressed={ativo}>
      {ativo && <span class="deck-selo">Seu deck</span>}
      <span class="deck-info">
        <span class="deck-nome">{d.nome}</span>
        <span class="deck-cmd"><span>{nomeCarta(d.comandante, d.comandante).split(',')[0]}</span><Simbolos custo={cores(d)} /></span>
      </span>
    </button>
  );
}

export function Saguao() {
  const e = useLoja();
  const sala = e.sala!;
  const eu = e.voce!;
  const anfitriao = eu === sala.anfitriao;
  const meuDeck = sala.assentos[eu]?.deck ?? null;
  const deckDe = (id: string | null) => e.decks.find((d) => d.id === id) ?? null;
  const pronto = sala.assentos.every((a) => a.tipo !== 'vazio' && a.deck);

  return (
    <div class="tela-fundo">
      <main class="janela sala">
        <section class="sala-esq">
          <header>
            <h1 class="sala-codigo">Sala {sala.codigo}</h1>
            <p class="sala-sub">{sala.modo === '4p' ? 'Quatro jogadores, todos contra todos' : 'Um contra um'}. Passe o código e a senha para quem vai jogar.</p>
          </header>

          {sala.estado === 'fim' && <p class="faixa">A última partida terminou. Quem criou a sala pode começar outra.</p>}

          <h2 class="rot">Lugares</h2>
          <ol class="assentos">
            {sala.assentos.map((a) => {
              const deck = deckDe(a.deck);
              const arte = deck ? urlArte(deck.comandante) : null;
              return (
                <li key={a.indice} class="assento">
                  <span class={`assento-arte ${arte ? 'com-arte' : ''}`} style={arte ? { backgroundImage: `url(${arte})` } : undefined} />
                  <span>
                    <span class="assento-nome">
                      {a.tipo === 'vazio' ? <em class="suave">livre</em> : a.tipo === 'bot' ? <>{a.nome} <span class="nivel-bot">· {nomeNivel(a.nivel ?? NIVEL_PADRAO)}</span></> : a.nome}
                      {a.tipo === 'bot' && <span class="etiqueta">bot</span>}
                      {a.indice === sala.anfitriao && <span class="etiqueta destaque">anfitrião</span>}
                      {a.tipo === 'humano' && !a.conectado && <span class="etiqueta alerta">desconectado</span>}
                    </span>
                    <span class="assento-deck">{a.tipo === 'vazio' ? 'esperando alguém' : deck ? deck.nome : 'escolhendo deck…'}</span>
                  </span>
                  {deck ? <Simbolos custo={cores(deck)} /> : <span />}
                  {anfitriao && a.tipo !== 'humano' && (
                    <span class="assento-bot">
                      <label>
                        {a.tipo === 'bot' ? 'Deck do bot' : 'Pôr bot com'}
                        <select value={a.tipo === 'bot' ? a.deck ?? '' : ''} onChange={(ev) => {
                          const v = (ev.target as HTMLSelectElement).value;
                          loja.enviar({ t: 'bot', assento: a.indice, deck: v || null });
                        }}>
                          <option value="">{a.tipo === 'bot' ? 'tirar o bot' : 'escolha um deck'}</option>
                          {[...e.decks].sort((a, b) => a.nome.localeCompare(b.nome)).map((d) => <option value={d.id}>{d.nome}</option>)}
                        </select>
                      </label>
                      {a.tipo === 'bot' && (
                        <label>
                          Nível
                          <select value={a.nivel ?? NIVEL_PADRAO} title={NIVEIS_BOT.find((n) => n.id === (a.nivel ?? NIVEL_PADRAO))?.descricao} onChange={(ev) => {
                            loja.enviar({ t: 'bot', assento: a.indice, deck: a.deck, nivel: (ev.target as HTMLSelectElement).value as NivelBot });
                          }}>
                            {NIVEIS_BOT.map((n) => <option value={n.id} title={n.descricao}>{n.nome}</option>)}
                          </select>
                        </label>
                      )}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>

          <div class="opcao">
            <h2 class="rot">Regra de mulligan</h2>
            <div class="segmentado" role="radiogroup" aria-label="Regra de mulligan">
              {([['londres', 'Londres', 'põe cartas no fundo'], ['livre', 'Livre', 'troca a mão inteira, até 3 vezes']] as const).map(([id, nome, dica]) => (
                <button key={id} type="button" role="radio" aria-checked={sala.mulligan === id} class={sala.mulligan === id ? 'ativo' : ''} disabled={!anfitriao}
                  onClick={() => loja.enviar({ t: 'mulligan', regra: id })}>{nome}<small>{dica}</small></button>
              ))}
            </div>
          </div>

          <div class="opcao">
            <h2 class="rot">Auxílios</h2>
            <div class="segmentado" role="radiogroup" aria-label="Auxílios">
              {([['permitidos', 'Permitidos', 'cada um escolhe nas Configurações'], ['proibidos', 'Proibidos', 'todos jogam em Mesa real']] as const).map(([id, nome, dica]) => (
                <button key={id} type="button" role="radio" aria-checked={sala.auxilios === id} class={sala.auxilios === id ? 'ativo' : ''} disabled={!anfitriao}
                  onClick={() => loja.enviar({ t: 'auxilios', regra: id })}>{nome}<small>{dica}</small></button>
              ))}
            </div>
            {!anfitriao && <p class="suave dica-opcao">Quem criou a sala escolhe as regras.</p>}
          </div>

          <footer class="sala-acoes">
            {anfitriao
              ? <button class="botao principal grande" disabled={!pronto} onClick={() => loja.enviar({ t: sala.estado === 'fim' ? 'novaPartida' : 'iniciar' })}>Começar a partida</button>
              : <p class="suave">Esperando quem criou a sala começar.</p>}
            <button class="botao fantasma" onClick={() => loja.enviar({ t: 'sair' })}>Sair da sala</button>
            {!pronto && anfitriao && <p class="suave" style={{ flexBasis: '100%' }}>Preencha os lugares livres (com pessoas ou bots) e todos escolhem um deck.</p>}
          </footer>
        </section>

        <section class="sala-dir">
          <div class="sala-dir-topo">
            <h2 class="titulo-verde">Escolha seu deck</h2>
            <span class="sala-dir-decks">
              <span class="suave">{e.decks.length} decks da mesa</span>
              <button type="button" class="botao pequeno" onClick={() => void loja.abrirDecks()} title="Importar um deck pelo link do Moxfield ou atualizar os da mesa">Decks</button>
            </span>
          </div>
          <div class="decks">
            {[...e.decks].sort((a, b) => a.nome.localeCompare(b.nome)).map((d) => <Deck key={d.id} d={d} ativo={d.id === meuDeck} onClick={() => loja.enviar({ t: 'deck', deck: d.id })} />)}
          </div>
        </section>
      </main>
    </div>
  );
}
