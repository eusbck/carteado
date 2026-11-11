// Conformer Shuriken
// Equipped creature has "Whenever this creature attacks, tap target creature defending player controls. If that
// creature has greater power than this creature, put a number of +1/+1 counters on this creature equal to the
// difference."
// Equip {2}
import { addCounters, attachedGets, controllerOf, defineAbility, defineCard, equip, on, power, t, tap, tgt, triggered } from '../../motor/api.ts';

// habilidade concedida: a fonte (c.source) é a criatura equipada, não o Equipamento
const ATAQUE = 'Conformer Shuriken:ataque';
defineAbility(ATAQUE, triggered(on.custom((e, c) => {
  if (e.type !== 'attackers') return false;
  const a = e.attackers.find((x) => x.obj === c.source);
  if (!a) return false;
  // CR 506.2: o jogador defensor é o atacado, ou quem controla o planeswalker ou a batalha atacada
  return { defensor: a.target.kind === 'player' ? a.target.id : controllerOf(c.g, a.target.id) };
}), function* (c) {
  const id = tgt(c);
  if (id === null) return;
  tap(c.g, id);
  // as forças são comparadas na resolução; se esta criatura saiu do campo, não há onde pôr marcadores
  if (!c.g.state.objects[c.source] || c.g.state.objects[c.source].zone !== 'battlefield') return;
  const dif = power(c.g, id) - power(c.g, c.source);
  if (dif > 0) addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', dif, c.you);
}, {
  targets: [t.creature((c, id) => controllerOf(c.g, id) === (c.event?.defensor as number | undefined), 'criatura alvo que o jogador defensor controla')],
  text: 'Sempre que esta criatura ataca, vire a criatura alvo que o jogador defensor controla. Se aquela criatura tiver força maior que esta, coloque nesta uma quantidade de marcadores +1/+1 igual à diferença.',
}));

export default defineCard({
  name: 'Conformer Shuriken',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'addAbility', id: ATAQUE }], 'A criatura equipada tem "Sempre que esta criatura ataca, vire a criatura alvo que o jogador defensor controla. Se aquela criatura tiver força maior que esta, coloque nesta uma quantidade de marcadores +1/+1 igual à diferença."'),
      equip('{2}'),
    ],
  }],
  rulings: {},
});
