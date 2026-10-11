// Inferno Titan
// {R}: This creature gets +1/+0 until end of turn.
// Whenever this creature enters or attacks, it deals 3 damage divided as you choose among one, two, or three targets.
import { activated, chooseItems, dealDamage, defineCard, on, t, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { EffectFn } from '../../motor/defs.ts';
import type { TargetRef } from '../../motor/types.ts';

const rotulo = (c: Parameters<EffectFn>[0], r: TargetRef): string => (r.kind === 'player' ? c.g.state.players[r.id].name : (c.g.state.objects[r.id] ? c.g.state.objects[r.id].def : 'alvo'));

// a divisão segue o número de alvos: 3; 2 e 1; ou 1, 1 e 1 (cada alvo recebe pelo menos 1). Com dois alvos, você
// escolhe qual recebe 2 — o motor pergunta na resolução, e não ao pôr o gatilho na pilha
const dano: EffectFn = function* (c) {
  const alvos = (c.targets[0] ?? []).filter((r): r is TargetRef => r !== null);
  if (!alvos.length) return;
  let partes = alvos.length === 1 ? [3] : alvos.length === 3 ? [1, 1, 1] : [2, 1];
  // se um dos alvos escolhidos ficou ilegal, o dano dele se perde (CR 608.2b)
  const originais = (c.targets[0] ?? []).length;
  if (originais === 2) {
    const todos = c.targets[0] ?? [];
    if (alvos.length === 2) {
      const [esc] = yield* chooseItems(c.g, c.you, 'Inferno Titan: qual alvo recebe 2 de dano? (o outro recebe 1)', alvos.map((r, i) => ({ id: String(i), label: rotulo(c, r) })), 1, 1);
      partes = Number(esc) === 0 ? [2, 1] : [1, 2];
    } else partes = [todos[0] === null ? 1 : 2];
  } else if (originais === 3) partes = alvos.map(() => 1);
  dealDamage(c.g, alvos.map((r, i) => ({ source: c.source, target: r, amount: partes[i] ?? 1, combat: false })));
};
const TEXTO = 'Sempre que esta criatura entra ou ataca, ela causa 3 de dano divididos como você escolher entre um, dois ou três alvos.';

export default defineCard({
  name: 'Inferno Titan',
  faces: [{
    abilities: [
      activated('{R}', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'pt', p: 1, t: 0 }]);
      }, { text: '{R}: Esta criatura recebe +1/+0 até o fim do turno.' }),
      triggered(on.selfEnters(), dano, { targets: [{ ...t.any('um, dois ou três alvos'), min: 1, max: 3 }], text: TEXTO }),
      triggered(on.selfAttacks(), dano, { targets: [{ ...t.any('um, dois ou três alvos'), min: 1, max: 3 }], text: TEXTO }),
    ],
  }],
  rulings: {
    1: 'teste: 3 de dano em um alvo; 2 e 1 em dois; 1 em cada um de três',
  },
});
