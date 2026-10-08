// Serra Paragon
// Flying
// Once during each of your turns, you may play a land from your graveyard or cast a permanent spell with mana value 3 or
// less from your graveyard. If you do, it gains "When this permanent is put into a graveyard from the battlefield, exile it
// and you gain 2 life."
import { addEffect, defineAbility, defineCard, exile, gainLife, isLand, isPermanentCard, keyword, manaValue, on, staticAbility, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId } from '../../motor/types.ts';

const EXILA = defineAbility('Serra Paragon:exila', triggered(on.selfDies(), function* (c) {
  const carta = c.g.state.lki[c.source]?.newId ?? null;
  if (carta !== null && c.g.state.objects[carta]?.zone === 'graveyard') yield* exile(c.g, [carta]);
  gainLife(c.g, c.you, 2, c.source);
}, { text: 'Quando este permanente vai do campo para um cemitério, exile-o e você ganha 2 de vida.' }));

/** "ela ganha …": no permanente que entrou (terreno) ou na mágica, que leva a habilidade ao campo */
function conceder(g: G, id: ObjId, controlador: number): void {
  const o = g.state.objects[id];
  if (!o) return;
  if (o.zone === 'stack' && o.stack) {
    o.stack.data.grantOnEnter = [...((o.stack.data.grantOnEnter as string[] | undefined) ?? []), EXILA.id!];
    g.bump();
  } else if (o.zone === 'battlefield') {
    addEffect(g, { source: id, sourceDef: '', controller: controlador, duration: { kind: 'whileOnBattlefield', obj: id }, affected: [id], mods: [{ k: 'addAbility', id: EXILA.id! }] });
  }
}

export default defineCard({
  name: 'Serra Paragon',
  faces: [{
    abilities: [
      keyword('flying'),
      staticAbility({
        rules: {
          mayPlayFrom: (c, p, carta) => {
            const s = c.g.state;
            const eu = s.objects[c.source];
            // uma vez durante cada um dos seus turnos (por Serra Paragon)
            if (!eu || p !== c.you || s.turn.active !== c.you || eu.data.paragonTurno === s.turn.number) return null;
            const o = s.objects[carta];
            if (!o || o.zone !== 'graveyard' || o.owner !== c.you) return null;
            const terreno = isLand(c.g, carta);
            // X vale 0 no cemitério (CR 202.3e)
            if (!terreno && !(isPermanentCard(c.g, carta) && manaValue(c.g, carta) <= 3)) return null;
            const fonte = c.source;
            return {
              key: `paragon:${fonte}`, label: 'Serra Paragon', land: terreno,
              onUse: (u, novo) => {
                const p0 = u.g.state.objects[fonte];
                if (p0) { p0.data.paragonTurno = u.g.state.turn.number; u.g.bump(); }
                conceder(u.g, novo, u.you);
              },
            };
          },
        },
        text: 'Uma vez durante cada um dos seus turnos, você pode jogar um terreno do seu cemitério ou conjurar uma mágica de permanente com valor de mana 3 ou menos do seu cemitério. Se fizer isso, ela ganha "Quando este permanente vai do campo para um cemitério, exile-o e você ganha 2 de vida."',
      }),
    ],
  }],
});
