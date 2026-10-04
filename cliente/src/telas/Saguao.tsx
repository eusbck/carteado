import { loja, useLoja } from '../loja.ts';
import { nomeCarta, urlImagem } from '../cartas.ts';
import { Simbolos } from '../mesa/Simbolos.tsx';
import type { DeckResumo } from '../../../servidor/protocolo.ts';

function Deck({ d, ativo, onClick }: { d: DeckResumo; ativo: boolean; onClick?: () => void }) {
  const img = urlImagem(d.comandante, 0, 'p');
  return (
    <button type="button" class={`deck ${ativo ? 'ativo' : ''}`} onClick={onClick} disabled={!onClick}>
      {img ? <img src={img} alt="" loading="lazy" /> : <span class="deck-sem-img" />}
      <span class="deck-nome">{d.nome}</span>
      <span class="deck-cmd">{nomeCarta(d.comandante, d.comandante)}</span>
      <Simbolos custo={d.cores.map((c) => `{${c}}`).join('')} />
    </button>
  );
}

export function Saguao() {
  const e = useLoja();
  const sala = e.sala!;
  const eu = e.voce!;
  const anfitriao = eu === sala.anfitriao;
  const meuDeck = sala.assentos[eu]?.deck ?? null;
  const nomeDeck = (id: string | null) => e.decks.find((d) => d.id === id)?.nome ?? 'sem deck';
  const pronto = sala.assentos.every((a) => a.tipo !== 'vazio' && a.deck);

  return (
    <main class="saguao">
      <header class="saguao-topo">
        <div>
          <h1 class="titulo">Sala {sala.codigo}</h1>
          <p class="suave">{sala.modo === '4p' ? 'Quatro jogadores, todos contra todos' : 'Um contra um'}. Passe o código e a senha para quem vai jogar.</p>
        </div>
        <button class="botao" onClick={() => loja.enviar({ t: 'sair' })}>Sair da sala</button>
      </header>

      {sala.estado === 'fim' && <p class="faixa">A última partida terminou. Quem criou a sala pode começar outra.</p>}

      <section>
        <h2>Lugares</h2>
        <ol class="assentos">
          {sala.assentos.map((a) => (
            <li key={a.indice} class="assento">
              <span class="assento-n">{a.indice + 1}</span>
              <span class="assento-nome">
                {a.tipo === 'vazio' ? <em class="suave">livre</em> : a.nome}
                {a.tipo === 'bot' && <span class="etiqueta">bot</span>}
                {a.indice === sala.anfitriao && <span class="etiqueta">anfitrião</span>}
                {a.tipo === 'humano' && !a.conectado && <span class="etiqueta alerta">desconectado</span>}
              </span>
              <span class="assento-deck">{a.tipo === 'vazio' ? '' : nomeDeck(a.deck)}</span>
              {anfitriao && a.tipo !== 'humano' && (
                <span class="assento-bot">
                  <label class="rotulo-select">
                    {a.tipo === 'bot' ? 'Deck do bot' : 'Pôr bot com'}
                    <select value={a.tipo === 'bot' ? a.deck ?? '' : ''} onChange={(ev) => {
                      const v = (ev.target as HTMLSelectElement).value;
                      loja.enviar({ t: 'bot', assento: a.indice, deck: v || null });
                    }}>
                      <option value="">{a.tipo === 'bot' ? 'tirar o bot' : 'escolha um deck'}</option>
                      {e.decks.map((d) => <option value={d.id}>{d.nome}</option>)}
                    </select>
                  </label>
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2>Seu deck</h2>
        <div class="decks">
          {e.decks.map((d) => <Deck d={d} ativo={d.id === meuDeck} onClick={() => loja.enviar({ t: 'deck', deck: d.id })} />)}
        </div>
      </section>

      <footer class="saguao-rodape">
        {anfitriao
          ? <button class="botao principal grande" disabled={!pronto} onClick={() => loja.enviar({ t: sala.estado === 'fim' ? 'novaPartida' : 'iniciar' })}>Começar a partida</button>
          : <p class="suave">Esperando quem criou a sala começar.</p>}
        {!pronto && anfitriao && <p class="suave">Preencha os lugares livres (com pessoas ou bots) e todos escolhem um deck.</p>}
      </footer>
    </main>
  );
}
