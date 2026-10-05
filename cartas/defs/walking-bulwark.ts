// Walking Bulwark
// Defender
// {2}: Until end of turn, target creature with defender gains haste, can attack as though it didn't have defender, and
// assigns combat damage equal to its toughness rather than its power. Activate only as a sorcery.
import { activated, defineAbility, defineCard, is, keyword, staticAbility, t, tgt, untilEndOfTurn } from '../../motor/api.ts';
import type { ContinuousEffect } from '../../motor/types.ts';

// "pode atacar como se não tivesse defensor": só a criatura afetada pelo efeito
const ATACA = defineAbility('Walking Bulwark:ataca', staticAbility({
  rules: { canAttackWithDefender: (c, criatura) => !!(c as { effect?: ContinuousEffect }).effect?.affected?.includes(criatura) },
  text: 'Pode atacar como se não tivesse defensor.',
}));

export default defineCard({
  name: 'Walking Bulwark',
  faces: [{
    abilities: [
      keyword('defender'),
      activated('{2}', function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // ruling 1: só muda o dano de combate que ela atribui, não a força (CR 510.1a)
        untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'haste' }, { k: 'rule', id: ATACA.id! }, { k: 'rule', id: 'rule:assignsByToughness' }]);
      }, { timing: 'sorcery', targets: [t.creature(is.kw('defender'), 'criatura alvo com defensor')], text: '{2}: Até o fim do turno, a criatura alvo com defensor ganha ímpeto, pode atacar como se não tivesse defensor e atribui dano de combate igual à resistência em vez da força. Ative só como feitiço.' }),
    ],
  }],
  rulings: { 1: 'teste: atribui dano pela resistência; a força não muda' },
});
