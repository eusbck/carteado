// Ajuste manual: aplicar à mão o efeito de cartas ainda sem definição. Tudo vai para o log.

import { useState } from 'preact/hooks';
import type { ManualAction, ObjId, TargetRef } from '../../../motor/types.ts';
import type { GameView } from '../../../motor/view.ts';
import { fichas, urlImagem } from '../cartas.ts';
import { Janela } from '../Janela.tsx';
import { loja } from '../loja.ts';

export type Tipo = 'mover' | 'vida' | 'marcadores' | 'virar' | 'ficha' | 'comprar' | 'moer' | 'embaralhar' | 'buscar' | 'videncia' | 'vigiar';
const TIPOS: { id: Tipo; nome: string }[] = [
  { id: 'mover', nome: 'Mover carta' }, { id: 'vida', nome: 'Vida' }, { id: 'marcadores', nome: 'Marcadores' },
  { id: 'virar', nome: 'Virar ou desvirar' }, { id: 'ficha', nome: 'Criar ficha' }, { id: 'comprar', nome: 'Comprar' },
  { id: 'moer', nome: 'Moer' }, { id: 'buscar', nome: 'Procurar no grimório' }, { id: 'videncia', nome: 'Vidência' },
  { id: 'vigiar', nome: 'Vigiar' }, { id: 'embaralhar', nome: 'Embaralhar' },
];
const DESTINOS: { id: 'battlefield' | 'hand' | 'graveyard' | 'exile' | 'libraryTop' | 'libraryBottom'; nome: string }[] = [
  { id: 'battlefield', nome: 'Campo' }, { id: 'hand', nome: 'Mão' }, { id: 'graveyard', nome: 'Cemitério' },
  { id: 'exile', nome: 'Exílio' }, { id: 'libraryTop', nome: 'Topo do grimório' }, { id: 'libraryBottom', nome: 'Fundo do grimório' },
];
const MARCAS = ['+1/+1', '-1/-1', 'loyalty', 'poison', 'charge', 'time', 'oil', 'stun', 'shield'];
const NOME_MARCA: Record<string, string> = { '+1/+1': '+1/+1', '-1/-1': '−1/−1', loyalty: 'lealdade', poison: 'veneno', charge: 'carga', time: 'tempo', oil: 'óleo', stun: 'atordoamento', shield: 'escudo' };

export interface PegarCarta { prompt: string; cb: (obj: ObjId) => void }

interface Props {
  v: GameView;
  /** aba que abre primeiro */
  tipoInicial?: Tipo;
  decisao: number;
  fechar: () => void;
  pegar: (p: PegarCarta | null) => void;
  nomeObj: (id: ObjId) => string;
  /** escondida enquanto você escolhe uma carta na mesa */
  escondida?: boolean;
}

function Passo({ n, set, min = 1, max = 20 }: { n: number; set: (x: number) => void; min?: number; max?: number }) {
  return (
    <span class="contador">
      <button class="botao pequeno" onClick={() => set(Math.max(min, n - 5))} disabled={n <= min}>−5</button>
      <button class="botao pequeno" onClick={() => set(Math.max(min, n - 1))} disabled={n <= min}>−</button>
      <output>{n}</output>
      <button class="botao pequeno" onClick={() => set(Math.min(max, n + 1))} disabled={n >= max}>+</button>
      <button class="botao pequeno" onClick={() => set(Math.min(max, n + 5))} disabled={n >= max}>+5</button>
    </span>
  );
}

export function Manual({ v, decisao, fechar, pegar, nomeObj, tipoInicial, escondida }: Props) {
  const [tipo, setTipo] = useState<Tipo>(tipoInicial ?? 'mover');
  const [obj, setObj] = useState<ObjId | null>(null);
  const [jogador, setJogador] = useState<number>(v.you ?? 0);
  const [alvoJogador, setAlvoJogador] = useState(false);
  const [n, setN] = useState(1);
  const [delta, setDelta] = useState(-1);
  const [marca, setMarca] = useState('+1/+1');
  const [ficha, setFicha] = useState<string | null>(null);
  const vivos = v.players.filter((p) => !p.left);

  const enviar = (m: ManualAction) => { loja.manual(decisao, m); fechar(); };
  const escolherCarta = () => pegar({ prompt: 'Clique na carta que você quer ajustar', cb: (o) => { setObj(o); pegar(null); } });
  const objAtual = obj !== null ? (v.battlefield.find((o) => o.id === obj) ?? v.hand.find((o) => o.id === obj) ?? v.exile.find((o) => o.id === obj) ?? v.command.find((o) => o.id === obj) ?? v.players.flatMap((p) => p.graveyard).find((o) => o.id === obj)) : undefined;
  const cartaEscolhida = (
    <div class="manual-carta">
      {objAtual ? <span>Carta: <strong>{nomeObj(objAtual.id)}</strong></span> : <span class="suave">Nenhuma carta escolhida</span>}
      <button class="botao" onClick={escolherCarta}>{objAtual ? 'Trocar carta' : 'Escolher carta na mesa'}</button>
    </div>
  );
  const escolhaJogador = (
    <div class="botoes-linha">
      {vivos.map((p) => <button key={p.id} class={`botao pequeno ${jogador === p.id ? 'ativo' : ''}`} onClick={() => setJogador(p.id)}>{p.name}</button>)}
    </div>
  );

  let corpo;
  switch (tipo) {
    case 'mover':
      corpo = (<>
        {cartaEscolhida}
        <p class="suave">Mover para:</p>
        <div class="botoes-linha">
          {DESTINOS.map((d) => <button key={d.id} class="botao" disabled={obj === null} onClick={() => enviar({ k: 'mover', obj: obj!, to: d.id })}>{d.nome}</button>)}
        </div>
      </>);
      break;
    case 'vida':
      corpo = (<>
        {escolhaJogador}
        <Passo n={delta} set={(x) => setDelta(x === 0 ? (delta > 0 ? -1 : 1) : x)} min={-100} max={100} />
        <button class="botao principal" onClick={() => enviar({ k: 'vida', player: jogador, delta })}>{delta > 0 ? `Ganhar ${delta}` : `Perder ${-delta}`}</button>
      </>);
      break;
    case 'marcadores': {
      const alvo: TargetRef | null = alvoJogador ? { kind: 'player', id: jogador } : obj !== null ? { kind: 'obj', id: obj } : null;
      corpo = (<>
        <div class="botoes-linha">
          <button class={`botao pequeno ${!alvoJogador ? 'ativo' : ''}`} onClick={() => setAlvoJogador(false)}>Numa carta</button>
          <button class={`botao pequeno ${alvoJogador ? 'ativo' : ''}`} onClick={() => setAlvoJogador(true)}>Num jogador</button>
        </div>
        {alvoJogador ? escolhaJogador : cartaEscolhida}
        <div class="botoes-linha">
          {MARCAS.map((m) => <button key={m} class={`botao pequeno ${marca === m ? 'ativo' : ''}`} onClick={() => setMarca(m)}>{NOME_MARCA[m]}</button>)}
        </div>
        <Passo n={delta} set={(x) => setDelta(x === 0 ? (delta > 0 ? -1 : 1) : x)} min={-20} max={20} />
        <button class="botao principal" disabled={!alvo} onClick={() => enviar({ k: 'marcadores', target: alvo!, kind: marca, delta })}>{delta > 0 ? `Colocar ${delta}` : `Remover ${-delta}`}</button>
      </>);
      break;
    }
    case 'virar': {
      const o = v.battlefield.find((x) => x.id === obj);
      corpo = (<>
        {cartaEscolhida}
        {o?.tapped && o.manaGasta && <p class="suave">A mana dessa permanente já foi gasta: para voltar atrás, use Desfazer.</p>}
        <button class="botao principal" disabled={!o || (o.tapped && !!o.manaGasta)} onClick={() => enviar({ k: 'virar', obj: obj!, tapped: !o!.tapped })}>{o?.tapped ? 'Desvirar' : 'Virar'}</button>
      </>);
      break;
    }
    case 'ficha':
      corpo = (<>
        <div class="itens fichas">
          {fichas().map((f) => {
            const img = urlImagem(f.id, 0, 'p');
            return <button key={f.id} class={`item item-carta ${ficha === f.id ? 'escolhido' : ''}`} onClick={() => setFicha(f.id)}>{img && <img src={img} alt="" loading="lazy" />}<span>{f.nome}</span></button>;
          })}
        </div>
        <p class="suave">Para:</p>
        {escolhaJogador}
        <Passo n={n} set={setN} />
        <button class="botao principal" disabled={!ficha} onClick={() => enviar({ k: 'ficha', def: ficha!, n, player: jogador })}>Criar {n}</button>
      </>);
      break;
    case 'comprar': case 'moer': case 'videncia': case 'vigiar':
      corpo = (<>
        <Passo n={n} set={setN} max={tipo === 'moer' ? 30 : 10} />
        <button class="botao principal" onClick={() => enviar({ k: tipo, n })}>{TIPOS.find((t) => t.id === tipo)!.nome} {n}</button>
      </>);
      break;
    case 'buscar':
      corpo = (<>
        <p class="suave">Você vê o grimório, escolhe uma carta e embaralha (exceto se ela for para o topo). Mandar a carta para:</p>
        <div class="botoes-linha">
          {DESTINOS.filter((d) => d.id !== 'libraryBottom').map((d) => <button key={d.id} class="botao" onClick={() => enviar({ k: 'buscar', to: d.id as 'hand' })}>{d.nome}</button>)}
        </div>
      </>);
      break;
    case 'embaralhar':
      corpo = <button class="botao principal" onClick={() => enviar({ k: 'embaralhar' })}>Embaralhar meu grimório</button>;
      break;
  }

  return (
    <Janela titulo="Ajuste manual" fechar={fechar} escondida={escondida}>
      <p class="suave">Use para aplicar o efeito de cartas marcadas como "manual". Todo ajuste aparece no registro para todos.</p>
      <div class="abas">
        {TIPOS.map((t) => <button key={t.id} class={`aba ${tipo === t.id ? 'ativa' : ''}`} onClick={() => { setTipo(t.id); setN(1); setDelta(t.id === 'marcadores' ? 1 : -1); }}>{t.nome}</button>)}
      </div>
      <div class="manual-corpo">{corpo}</div>
    </Janela>
  );
}
