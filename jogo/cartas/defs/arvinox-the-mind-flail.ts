// Arvinox, the Mind Flail
// Arvinox isn't a creature unless you control three or more permanents you don't own.
// At the beginning of your end step, exile the bottom card of each opponent's library face down. For as long as those
// cards remain exiled, you may look at them, you may cast permanent spells from among them, and you may spend mana as
// though it were mana of any color to cast those spells.
import { addEffect, controlledBy, defineAbility, defineCard, isPermanentCard, moveObjects, on, staticAbility, triggered } from '../../motor/api.ts';
import type { SCtx, StaticDef } from '../../motor/defs.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

/**
 * A permissão das cartas exiladas, num efeito que dura enquanto elas estiverem no exílio (mesmo sem Arvinox): só mágicas
 * de permanente (não jogar terreno, CR 305.9 e 601.3) e mana de qualquer tipo (CR 609.4b). Simplificação: "como se
 * fosse de qualquer cor" vira "de qualquer tipo", como nas outras cartas de roubo do motor.
 */
const PERMISSAO = defineAbility<StaticDef>('Arvinox, the Mind Flail:permissao', staticAbility({
  rules: {
    mayPlayFrom: (c, p, carta) => {
      const prm = (c as SCtx & { params?: { objs: ObjId[]; player: PlayerId } }).params;
      const o = c.g.state.objects[carta];
      if (!prm || p !== prm.player || !prm.objs.includes(carta) || o?.zone !== 'exile' || !isPermanentCard(c.g, carta)) return null;
      return { key: `arvinox:${carta}`, label: 'conjurar a carta exilada por Arvinox', anyType: true };
    },
  },
  text: 'Você pode conjurar mágicas de permanente dentre as cartas exiladas por Arvinox, gastando mana como se fosse de qualquer cor.',
}));

export default defineCard({
  name: 'Arvinox, the Mind Flail',
  faces: [{
    abilities: [
      staticAbility({
        affects: (c, o) => o.id === c.source && o.zone === 'battlefield'
          && controlledBy(c.g, c.you, (id) => c.g.state.objects[id].owner !== c.you).length < 3,
        mods: () => [{ k: 'setTypes', types: ['Enchantment'], subtypes: [], keepSupertypes: true }],
        text: 'Arvinox não é uma criatura a menos que você controle três ou mais permanentes de que você não é dono.',
      }),
      triggered(on.endStep('you'), function* (c) {
        const s = c.g.state;
        const fundo = c.g.apnap().filter((p) => c.g.isOpponent(c.you, p) && !s.players[p].left)
          .map((p) => s.zones.library[p].at(-1)).filter((id): id is ObjId => id !== undefined);
        if (!fundo.length) return;
        // viradas para baixo; só você pode olhá-las (CR 406.3)
        const ex = (yield* moveObjects(c.g, fundo.map((id) => ({ id, to: 'exile' as const, faceDown: true, visibleTo: [c.you] })), 'exile'))
          .filter((id): id is ObjId => id !== null && s.objects[id]?.zone === 'exile');
        if (!ex.length) return;
        addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'permanent' }, affected: null, mods: [{ k: 'rule', id: PERMISSAO.id!, params: { objs: ex, player: c.you } }] });
        c.g.log(`${s.players[c.you].name} exila virada para baixo a carta do fundo do grimório de cada oponente (Arvinox).`);
      }, { text: 'No começo da sua etapa final, exile virada para baixo a carta do fundo do grimório de cada oponente. Enquanto elas estiverem exiladas, você pode olhá-las, conjurar mágicas de permanente dentre elas e gastar mana como se fosse de qualquer cor para conjurá-las.' }),
    ],
  }],
  rulings: {
    1: 'não se aplica: nenhuma carta dos decks se refere ao nome de Mind Flayer, the Shadow',
  },
});
