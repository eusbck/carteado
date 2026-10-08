// Songbirds' Blessing
// Enchant creature
// Whenever enchanted creature attacks, reveal cards from the top of your library until you reveal an Aura card. You may
// put that card onto the battlefield. If you don't, put it into your hand. Put the rest on the bottom of your library in
// a random order.
import { defineCard, enchantCandidates, isSubtype, moveObjects, nameOf, on, putOntoBattlefield, t, triggered, yesNo } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';

export default defineCard({
  name: "Songbirds' Blessing",
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [triggered(on.custom((e, c) => {
      const enc = c.g.state.objects[c.source]?.attachedTo;
      return e.type === 'attackers' && enc != null && e.attackers.some((a) => a.obj === enc);
    }), function* (c) {
      const s = c.g.state;
      const lib = s.zones.library[c.you];
      const i = lib.findIndex((id) => isSubtype(c.g, id, 'Aura'));
      const reveladas = i < 0 ? [...lib] : lib.slice(0, i + 1);
      c.g.log(`${s.players[c.you].name} revela ${reveladas.map((id) => nameOf(c.g, id)).join(', ') || 'nada'}.`, { rule: '701.20' });
      if (i >= 0) {
        const aura = lib[i];
        // ruling 1: não mira; escolhe o que encantar ao entrar; se não puder encantar nada, vai para a mão
        const pode = enchantCandidates(c.g, s.objects[aura].def, 0, c.you).length > 0;
        let entrou = false;
        if (pode && (yield* yesNo(c.g, c.you, `Songbirds' Blessing: pôr ${nameOf(c.g, aura)} no campo? (senão, vai para a mão)`))) {
          entrou = (yield* putOntoBattlefield(c.g, [{ id: aura, controller: c.you }], 'effect')).length > 0;
        }
        if (!entrou && s.objects[aura]?.zone === 'library') yield* moveObjects(c.g, [{ id: aura, to: 'hand' }], 'effect');
      }
      const resto = shuffle(s.rng, reveladas.filter((id) => s.objects[id]?.zone === 'library'));
      s.zones.library[c.you] = [...s.zones.library[c.you].filter((id) => !resto.includes(id)), ...resto];
      c.g.bump();
    }, { text: 'Sempre que a criatura encantada ataca, revele cartas do topo do seu grimório até revelar uma carta de Aura. Você pode pô-la no campo; se não puser, ponha-a na sua mão. Ponha o resto no fundo do grimório em ordem aleatória.' })],
  }],
  rulings: { 1: 'teste: a Aura entra sem mirar e escolhe o que encantar' },
});
