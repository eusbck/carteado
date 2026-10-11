// Cleric Class
// (Gain the next level as a sorcery to add its ability.)
// If you would gain life, you gain that much life plus 1 instead.
// {3}{W}: Level 2
// Whenever you gain life, put a +1/+1 counter on target creature you control.
// {4}{W}: Level 3
// When this Class becomes level 3, return target creature card from your graveyard to the battlefield. You gain life
// equal to that creature's toughness.
import { activated, addCounters, defineCard, emit, gainLife, is, isCreature, on, putOntoBattlefield, staticAbility, t, tgt, toughness, triggered } from '../../motor/api.ts';
import type { ActivatedDef } from '../../motor/defs.ts';
import { GANHO_DE_VIDA } from '../miku.ts';

/** CR 716.2a: "[custo]: nível N" — o nível desta Classe passa a ser N; só no nível N-1 e só como feitiço */
function nivel(custo: string, n: number): ActivatedDef {
  return activated(custo, function* (c) {
    const o = c.g.state.objects[c.source];
    if (!o || o.zone !== 'battlefield' || o.classLevel !== n - 1) return;
    o.classLevel = n;
    c.g.bump();
    c.g.log(`Cleric Class passa ao nível ${n}.`, { rule: '716.2a' });
    emit(c.g, [{ type: 'levelUp', obj: c.source, level: n }]);
  }, { timing: 'sorcery', condition: (c) => c.g.state.objects[c.source]?.classLevel === n - 1, text: `${custo}: Nível ${n}` });
}

export default defineCard({
  name: 'Cleric Class',
  faces: [{
    abilities: [
      staticAbility({ rules: { lifeGainBonus: (c, p) => (p === c.you ? 1 : 0) }, text: 'Se você fosse ganhar vida, em vez disso você ganha essa quantidade de vida mais 1.' }),
      // rulings 8-11: ganhar nível é habilidade ativada comum; a Classe mantém as habilidades dos níveis anteriores
      nivel('{3}{W}', 2),
      triggered(on.youGainLife(), function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, {
        condition: (c) => (c.g.state.objects[c.source]?.classLevel ?? 1) >= 2,
        targets: [t.creature(is.yours, 'criatura alvo que você controla')],
        text: 'Nível 2 — Sempre que você ganha vida, coloque um marcador +1/+1 na criatura alvo que você controla.',
      }),
      nivel('{4}{W}', 3),
      triggered(on.custom((e, c) => e.type === 'levelUp' && e.obj === c.source && e.level === 3), function* (c) {
        const carta = tgt(c);
        if (carta === null || c.g.state.objects[carta]?.zone !== 'graveyard') return;
        const [nova] = yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you }], 'effect');
        // ruling 6: a resistência dela no campo
        if (nova !== undefined && c.g.state.objects[nova]?.zone === 'battlefield') gainLife(c.g, c.you, toughness(c.g, nova), c.source);
      }, {
        targets: [t.card('graveyard', (c, id) => isCreature(c.g, id), 'carta de criatura alvo do seu cemitério', 'you')],
        text: 'Nível 3 — Quando esta Classe passa ao nível 3, devolva ao campo a carta de criatura alvo do seu cemitério. Você ganha vida igual à resistência dessa criatura.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 716.2b — cada Classe guarda o próprio nível (objeto.classLevel)',
    2: GANHO_DE_VIDA.danoLetal,
    3: GANHO_DE_VIDA.umPorEvento,
    4: GANHO_DE_VIDA.vinculo,
    5: GANHO_DE_VIDA.paraCada,
    6: 'teste: nível 3: devolve uma carta de criatura do cemitério ao campo e você ganha vida igual à resistência dela, mais 1',
    7: 'regra geral: CR 716.2 — três habilidades de classe e duas de nível (cartas/defs/cleric-class.ts)',
    8: 'teste: nível 2: a cada ganho de vida, um marcador +1/+1 na criatura alvo que você controla',
    9: 'teste: nível 3: devolve uma carta de criatura do cemitério ao campo e você ganha vida igual à resistência dela, mais 1',
    10: 'regra geral: CR 716.2a — ganhar nível é habilidade ativada: usa a pilha (cartas/defs/cleric-class.ts)',
    11: 'teste: no nível 1 só dá para ganhar o nível 2, e só como feitiço',
    12: 'não se aplica: Cleric Class não tem efeito que cresce com outras Classes',
  },
});