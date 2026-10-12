// Exploding Barrel
// {T}: Add one mana of any color. Put a pressure counter on this artifact.
// {8}, {T}, Sacrifice this artifact: It deals 20 damage to target creature. This ability costs {1} less to activate for
// each pressure counter on this artifact. Activate only as a sorcery.
import { activated, addCounters, dealDamage, defineCard, mana, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Exploding Barrel',
  faces: [{
    abilities: [
      mana('any', {
        text: '{T}: Adicione uma mana de qualquer cor. Coloque um marcador de pressão neste artefato.',
        *extra(c) { if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'pressure', 1, c.you); },
      }),
      activated('{8}, {T}, Sacrifice this artifact', function* (c) {
        const id = tgt(c);
        if (id !== null) dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id }, amount: 20, combat: false }]);
      }, {
        targets: [t.creature()],
        timing: 'sorcery',
        selfCost: (c) => ({ reduce: c.g.state.objects[c.source]?.counters.pressure ?? 0 }),
        text: '{8}, {T}, Sacrifique este artefato: Ele causa 20 de dano à criatura alvo. Esta habilidade custa {1} a menos para ativar para cada marcador de pressão neste artefato. Ative somente como um feitiço.',
      }),
    ],
  }],
  rulings: {},
});