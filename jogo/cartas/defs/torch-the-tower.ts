// Torch the Tower
// Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)
// Torch the Tower deals 2 damage to target creature or planeswalker. If this spell was bargained,
// instead it deals 3 damage to that permanent and you scry 1.
// If a permanent dealt damage by Torch the Tower would die this turn, exile it instead.
import { bargain, bargained, dealDamage, defineAbility, defineCard, lookAndArrange, ruleEffect, staticAbility, t, tgt, type ObjId, type SCtx, type StaticDef } from '../../motor/api.ts';

const EXILA = defineAbility<StaticDef>('Torch the Tower:exila', staticAbility({
  rules: {
    leavesBattlefield: (c, o, dest) => {
      const alvo = (c as SCtx & { params?: { permanente: ObjId } }).params?.permanente;
      return o.id === alvo && dest === 'graveyard' ? { dest: 'exile', label: 'Torch the Tower (exile em vez de morrer)' } : null;
    },
  },
}));

export default defineCard({
  name: 'Torch the Tower',
  faces: [{
    additionalCosts: [bargain()],
    spell: {
      targets: [t.creatureOrPlaneswalker()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const barganha = bargained(c);
        const danos = dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id }, amount: barganha ? 3 : 2, combat: false }]);
        // CR 614.1a, 700.4: efeito independente da habilidade do alvo e do motivo da morte.
        // Usa o destinatário real do dano (pode haver redirecionamento), e só se houve dano.
        for (const dano of danos) if (dano.to.kind === 'obj') {
          ruleEffect(c, EXILA.id!, { kind: 'endOfTurn' }, { params: { permanente: dano.to.id } });
        }
        if (barganha) yield* lookAndArrange(c.g, c.you, 1, 'scry');
      },
    },
  }],
  rulings: {
    1: 'teste: morte posterior por destruição ou sacrifício também é substituída por exílio',
    2: 'teste: barganha sacrifica uma só permanente e causa 3 de dano com vidência 1',
    3: 'teste: sem barganha causa 2 e não usa vidência',
    4: 'teste: barganha sacrifica uma só permanente e causa 3 de dano com vidência 1',
    5: 'teste: CR 707.10: a cópia de uma mágica barganhada conserva a barganha sem novo sacrifício',
    6: 'não se aplica: a barganha desta carta não acrescenta alvos',
  },
});
