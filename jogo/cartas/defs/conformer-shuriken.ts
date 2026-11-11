// Conformer Shuriken
// Equipped creature has "Whenever this creature attacks, tap target creature defending player controls. If that
// creature has greater power than this creature, put a number of +1/+1 counters on this creature equal to the
// difference."
// Equip {2}
import { addCounters, attachedGets, controllerOf, defineAbility, defineCard, equip, on, power, t, tap, tgt, triggered } from '../../motor/api.ts';
import { defendingPlayerOf } from '../../motor/combat.ts';

const ATAQUE = defineAbility('Conformer Shuriken:ataque', triggered(on.selfAttacks(), function* (c) {
  const alvo = tgt(c);
  if (alvo === null) return;
  tap(c.g, alvo);
  const dif = power(c.g, alvo) - (c.g.state.objects[c.source]?.zone === 'battlefield' ? power(c.g, c.source) : 0);
  if (dif > 0 && c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', dif, c.you);
}, {
  targets: [t.creature((c, id) => {
    const a = c.g.state.combat?.attackers.find((x) => x.id === c.source);
    return !!a && controllerOf(c.g, id) === defendingPlayerOf(c.g, a.target);
  }, 'criatura alvo que o jogador defensor controla')],
  text: 'Sempre que esta criatura ataca, vire a criatura alvo que o jogador defensor controla. Se ela tiver força maior que esta criatura, coloque nesta criatura uma quantidade de marcadores +1/+1 igual à diferença.',
}));

export default defineCard({
  name: 'Conformer Shuriken',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'addAbility', id: ATAQUE.id! }], 'A criatura equipada tem "Sempre que esta criatura ataca, vire a criatura alvo que o jogador defensor controla. Se ela tiver força maior que esta criatura, coloque nesta criatura marcadores +1/+1 iguais à diferença."'),
      equip('{2}'),
    ],
  }],
  rulings: {},
});
