// lote4-c: dobrar a terra (earthbend, CR 701.66) e "sempre que você vira uma criatura para gerar mana" (Badgermole Cub).
//
// CR 701.66a: "Earthbend N" = "O terreno alvo que você controla se torna uma criatura terreno 0/0 com ímpeto, além dos
// outros tipos. Coloque N marcadores +1/+1 nele. Quando esse terreno morrer ou for exilado, devolva-o ao campo virado
// sob o seu controle." O alvo fica com quem chama (a carta põe t.land(is.yours) nos alvos).
import { addCounters, putOntoBattlefield } from './actions.ts';
import { nameOf } from './chars.ts';
import { defineAbility, type Ctx, type Gen, type TriggeredDef } from './defs.ts';
import { delayed } from './efeitos.ts';
import { addEffect } from './state.ts';
import type { ObjId } from './types.ts';
import { obj, reg } from './registro.ts';

/** gatilho atrasado de dobrar a terra: quando o terreno morre ou é exilado, volta ao campo virado (CR 701.66a) */
const VOLTA: TriggeredDef = defineAbility<TriggeredDef>('motor:earthbend:volta', {
  kind: 'triggered',
  on: {
    kind: 'event',
    match: (e, c) => {
      const d = (c as { delayed?: { data: { terreno?: ObjId } } }).delayed?.data;
      // ruling 4: só morrer (campo → cemitério) ou ser exilado; para a mão ou o grimório não volta
      return e.type === 'zone' && e.from === 'battlefield' && e.old === d?.terreno && (e.to === 'graveyard' || e.to === 'exile') ? { carta: e.obj } : false;
    },
  },
  *effect(c) {
    const carta = c.event.carta as ObjId;
    const o = c.g.state.objects[carta];
    // ficha que saiu do campo deixa de existir (CR 111.7); carta que já mudou de zona de novo é outro objeto (CR 400.7)
    if (!o || o.isToken || (o.zone !== 'graveyard' && o.zone !== 'exile')) return;
    yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you, tapped: true }], 'effect');
  },
  text: 'Quando esse terreno morrer ou for exilado, devolva-o ao campo virado sob o seu controle.',
});

/**
 * Dobra a terra N (CR 701.66a) no terreno `terreno` (o alvo, já conferido). Vira criatura terreno 0/0 com ímpeto sem
 * prazo (enquanto for o mesmo objeto no campo), recebe N marcadores +1/+1 e cria o gatilho atrasado de volta. Num
 * terreno que já é criatura, a força e a resistência base passam a 0/0 (ruling 3). Não dá cor (ruling 7).
 */
export function* earthbend(c: Ctx, terreno: ObjId, n: number): Gen<void> {
  const g = c.g;
  if (g.state.objects[terreno]?.zone !== 'battlefield') return;
  addEffect(g, {
    source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'whileOnBattlefield', obj: terreno }, affected: [terreno],
    mods: [{ k: 'addTypes', types: ['Creature'] }, { k: 'setPT', p: 0, t: 0 }, { k: 'addKeyword', kw: 'haste' }],
  });
  reg(g, 'outro', { rule: '701.66a', actor: c.you })`${obj(terreno)} é dobrado pela terra (${n}).`;
  if (n > 0) addCounters(g, { kind: 'obj', id: terreno }, '+1/+1', n, c.you);
  delayed(c, VOLTA.id!, { data: { terreno } });
}
