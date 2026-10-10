// Mapa nome da definição → imagem (impressão em português quando houver), texto Oracle e linhas de tipo (em inglês e,
// se houver, em português), enviado uma vez ao cliente autenticado.

import imagens from '../gerado/imagens.json' with { type: 'json' };
import dados from '../gerado/cartas.json' with { type: 'json' };
import { registry } from '../motor/defs.ts';
import { hasOracle, oracle } from '../motor/oracle.ts';
import type { InfoCarta } from './protocolo.ts';

type Face = { nome?: string | null; tipo?: string | null; texto?: string | null };
type Img = ({ id: string; frente: string | null; verso: string | null; reserva?: boolean; faces?: Face[] | null } & Face) | null;
const IMG = imagens as unknown as Record<string, { en: Img; pt: Img }>;
const FICHAS = (dados as unknown as { fichas: { oracleId: string; imagem: { id: string; verso: string | null } | null }[] }).fichas;

/** os textos das faces juntos como no Oracle (vazio se nenhuma face tem) */
const juntar = (l: (string | null | undefined)[], sep: string) => l.filter(Boolean).join(sep);

export function infoCartas(): Record<string, InfoCarta> {
  const out: Record<string, InfoCarta> = {};
  for (const def of registry.cards.values()) {
    const i = IMG[def.name];
    const escolhida = (i?.pt && !i.pt.reserva ? i.pt : i?.en) ?? null;
    const faces = hasOracle(def.name) ? oracle(def.name).faces : [];
    const pt = i?.pt;
    // carta de duas faces: o português vem por face; as outras têm o tipo e o texto na própria impressão
    const fpt = pt?.faces?.length ? pt.faces : pt ? [pt] : [];
    const tipoPt = juntar(fpt.map((f) => f.tipo), ' // ');
    const textoPt = juntar(fpt.map((f) => f.texto), '\n//\n');
    out[def.name] = {
      f: escolhida?.id ?? null, v: escolhida?.verso ? escolhida.id : null, pt: pt?.nome ?? null, pendente: !!def.pending,
      oracle: faces.map((f) => f.oracleText).join('\n//\n'), tipo: faces.map((f) => f.typeLine).join(' // '),
      ...(tipoPt ? { tipoPt } : {}), ...(textoPt ? { textoPt } : {}),
    };
  }
  for (const t of registry.tokens.values()) {
    const f = FICHAS.find((x) => x.oracleId === t.image);
    const tipo = `Token ${[...(t.supertypes ?? []), ...t.types].join(' ')}${t.subtypes.length ? ` — ${t.subtypes.join(' ')}` : ''}`;
    // ficha de duas faces (Incubator // Phyrexian): o verso vem da mesma impressão
    out[t.id] = { f: f?.imagem?.id ?? null, v: f?.imagem?.verso ? f.imagem.id : null, pt: null, pendente: false, ficha: true, nome: `${t.name} ${t.power ?? ''}${t.power !== null ? '/' : ''}${t.toughness ?? ''}`.trim(), oracle: t.abilities.map((a) => a.text ?? a.kw ?? '').filter(Boolean).join('\n'), tipo };
  }
  return out;
}
