// Mapa nome da definição → imagem (impressão em português quando houver) e texto Oracle,
// enviado uma vez ao cliente autenticado.

import imagens from '../gerado/imagens.json' with { type: 'json' };
import dados from '../gerado/cartas.json' with { type: 'json' };
import { registry } from '../motor/defs.ts';
import { hasOracle, oracle } from '../motor/oracle.ts';
import type { InfoCarta } from './protocolo.ts';

type Img = { id: string; frente: string; verso: string | null; nome?: string; reserva?: boolean } | null;
const IMG = imagens as Record<string, { en: Img; pt: Img }>;
const FICHAS = (dados as unknown as { fichas: { oracleId: string; imagem: { id: string; verso: string | null } | null }[] }).fichas;

export function infoCartas(): Record<string, InfoCarta> {
  const out: Record<string, InfoCarta> = {};
  for (const def of registry.cards.values()) {
    const i = IMG[def.name];
    const escolhida = (i?.pt && !i.pt.reserva ? i.pt : i?.en) ?? null;
    const texto = hasOracle(def.name) ? oracle(def.name).faces.map((f) => f.oracleText).join('\n//\n') : '';
    out[def.name] = { f: escolhida?.id ?? null, v: escolhida?.verso ? escolhida.id : null, pt: i?.pt?.nome ?? null, pendente: !!def.pending, oracle: texto };
  }
  for (const t of registry.tokens.values()) {
    const f = FICHAS.find((x) => x.oracleId === t.image);
    out[t.id] = { f: f?.imagem?.id ?? null, v: null, pt: null, pendente: false, ficha: true, nome: `${t.name} ${t.power ?? ''}${t.power !== null ? '/' : ''}${t.toughness ?? ''}`.trim(), oracle: t.abilities.map((a) => a.text ?? a.kw ?? '').filter(Boolean).join('\n') };
  }
  return out;
}
