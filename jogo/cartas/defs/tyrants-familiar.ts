// Tyrant's Familiar
// Flying, haste
// Lieutenant — As long as you control your commander, this creature gets +2/+2 and has "Whenever this creature attacks,
// it deals 7 damage to target creature defending player controls."
import { controllerOf, dealDamage, defineAbility, defineCard, keywords, on, selfGets, t, tgt, triggered } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';
import type { PlayerId } from '../../motor/types.ts';

/**
 * Tenente (palavra de habilidade, CR 207.2c): "você controla o seu comandante" = um permanente no campo que é um dos
 * seus comandantes (CR 903.3d). Rulings 1-3: só o seu comandante conta, e "você" é quem controla esta criatura.
 */
function controlaSeuComandante(c: SCtx): boolean {
  const s = c.g.state;
  const meus = s.players[c.you]?.commanders ?? [];
  return s.zones.battlefield.some((id) => {
    const o = s.objects[id];
    return !o.phasedOut && !o.isToken && o.card !== null && meus.includes(o.card) && controllerOf(c.g, id) === c.you;
  });
}

const ATAQUE = defineAbility("Tyrant's Familiar:ataque", triggered(on.custom((e, c) => {
  if (e.type !== 'attackers') return false;
  const a = e.attackers.find((x) => x.obj === c.source);
  if (!a) return false;
  // CR 802.2a: o jogador defensor é o jogador atacado ou o controlador do planeswalker atacado
  return { defensor: a.target.kind === 'player' ? a.target.id : controllerOf(c.g, a.target.id) };
}), function* (c) {
  const alvo = tgt(c);
  if (alvo !== null) dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id: alvo }, amount: 7, combat: false }]);
}, {
  targets: [t.creature((c, id) => controllerOf(c.g, id) === (c.event?.defensor as PlayerId | undefined), 'criatura alvo que o jogador defensor controla')],
  text: 'Sempre que esta criatura ataca, ela causa 7 de dano à criatura alvo que o jogador defensor controla.',
}));

export default defineCard({
  name: "Tyrant's Familiar",
  faces: [{
    abilities: [
      ...keywords('flying', 'haste'),
      // ruling 4: sem o comandante, o bônus some na hora (pode morrer pelo dano marcado)
      selfGets(() => [{ k: 'pt', p: 2, t: 2 }, { k: 'addAbility', id: ATAQUE.id! }],
        'Tenente — Enquanto você controlar o seu comandante, esta criatura recebe +2/+2 e tem "Sempre que esta criatura ataca, ela causa 7 de dano à criatura alvo que o jogador defensor controla."',
        { condition: controlaSeuComandante }),
    ],
  }],
  rulings: {
    1: 'teste: só vale com o seu comandante no campo sob o seu controle',
    2: 'teste: o comandante de outro jogador não conta',
    3: 'teste: sob o controle de outro jogador, vale o comandante desse jogador',
    4: 'teste: perdendo o comandante, o bônus some e a criatura pode morrer pelo dano marcado',
    5: 'teste: o gatilho já disparado resolve mesmo sem o comandante',
  },
});
