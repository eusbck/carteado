// Visualização ampliada da carta sob o cursor, com o texto (útil para as cartas em modo manual).

import type { ObjView } from '../../../motor/view.ts';
import { info, nomeCarta, urlImagem } from '../cartas.ts';
import { TextoComSimbolos } from './Simbolos.tsx';
import { palavraChave } from '../pt.ts';

/** `enjoo`: diz quando a criatura ainda não pode atacar (só com o auxílio das cartas jogáveis) */
export function Zoom({ o, lado = 'esq', fixo = false, enjoo = true }: { o: ObjView | null; lado?: 'esq' | 'dir'; fixo?: boolean; enjoo?: boolean }) {
  if (!o || !o.def) return null;
  const def = o.copyOfDef ?? o.def;
  const img = urlImagem(def, o.face, fixo ? 'g' : 'm');
  const i = info(def);
  const textos = o.abilities.length ? o.abilities : [];
  return (
    <aside class={fixo ? 'zoom-fixo' : `zoom ${lado}`} aria-hidden={fixo ? undefined : 'true'}>
      {img ? <img src={img} alt="" /> : <div class="zoom-sem-arte"><strong>{nomeCarta(def, o.name)}</strong></div>}
      <div class="zoom-texto">
        <strong>{nomeCarta(def, o.name)}</strong>
        {i?.pendente && <p class="pendente-aviso">Carta em modo manual: aplique o efeito com "Ajuste manual". O texto está na própria carta.</p>}
        {o.power !== null && <p>Força e resistência atuais: {o.power}/{o.toughness}</p>}
        {enjoo && o.sick && o.types.includes('Creature') && <p>Enjoo de invocação: ainda não pode atacar nem usar habilidades com {'{T}'}.</p>}
        {o.loyalty !== null && o.counters.loyalty !== undefined && <p>Lealdade: {o.counters.loyalty}</p>}
        {o.keywords.length > 0 && <p>Palavras-chave: {o.keywords.map(palavraChave).join(', ')}</p>}
        {textos.map((t, k) => <p key={k}><TextoComSimbolos texto={t} /></p>)}
      </div>
    </aside>
  );
}
