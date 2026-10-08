// Martial Impetus
// Enchant creature
// Enchanted creature gets +1/+1 and is goaded. (It attacks each combat if able and attacks a player other than you if
// able.)
// Whenever enchanted creature attacks, each other creature that's attacking one of your opponents gets +1/+1 until end
// of turn.
import { attachedGets, defineCard, goadsEnchanted, on, t, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Martial Impetus',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 1, t: 1 }], 'A criatura encantada recebe +1/+1.'),
      // rulings 1-5: goad pelo controlador da Aura (motor: exigências de ataque, CR 701.15b)
      goadsEnchanted(),
      triggered(on.custom((e, c) => {
        const enc = c.g.state.objects[c.source]?.attachedTo;
        return e.type === 'attackers' && enc != null && e.attackers.some((a) => a.obj === enc) ? { criatura: enc } : false;
      }), function* (c) {
        const s = c.g.state;
        const outras = (s.combat?.attackers ?? []).filter((a) => !a.removed && a.id !== c.event.criatura && a.target.kind === 'player' && c.g.isOpponent(c.you, a.target.id)).map((a) => a.id);
        untilEndOfTurn(c, outras, [{ k: 'pt', p: 1, t: 1 }]);
      }, { text: 'Sempre que a criatura encantada ataca, cada outra criatura que está atacando um dos seus oponentes recebe +1/+1 até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: a criatura goadada precisa atacar outro jogador',
    2: 'regra geral: CR 701.15b — goad vale em combates adicionais',
    3: 'regra geral: CR 508.1d — virada ou impedida, não ataca; custo não é obrigatório',
    4: 'regra geral: CR 701.15b — maior número de exigências cumpridas',
    5: 'regra geral: CR 701.15 — goad não é habilidade da criatura',
  },
});
