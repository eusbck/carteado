// Inventors' Fair
// At the beginning of your upkeep, if you control three or more artifacts, you gain 1 life.
// {T}: Add {C}.
// {4}, {T}, Sacrifice Inventors' Fair: Search your library for an artifact card, reveal it, put it into your hand, then
// shuffle. Activate only if you control three or more artifacts.
import { activated, controlledBy, defineCard, gainLife, isType, mana, on, searchTo, triggered } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

const tresArtefatos = (c: SCtx) => controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact')).length >= 3;

export default defineCard({
  name: "Inventors' Fair",
  faces: [{ abilities: [
    // CR 603.4: cláusula "se" interveniente — vista quando dispara e de novo ao resolver (rulings 3 e 4)
    triggered(on.upkeep('you'), function* (c) { gainLife(c.g, c.you, 1, c.source); }, {
      condition: tresArtefatos,
      text: 'No início da sua manutenção, se você controla três ou mais artefatos, você ganha 1 de vida.',
    }),
    mana('C'),
    // ruling 2: a condição de ativação só é vista ao ativar (CR 602.5: a restrição impede começar a ativar; depois não é revista)
    activated('{4}, {T}, Sacrifice this land', function* (c) {
      yield* searchTo(c, c.you, (id) => isType(c.g, id, 'Artifact'), 1, 'hand', { reveal: true, prompt: 'Procure uma carta de artefato' });
    }, {
      condition: tresArtefatos,
      text: "{4}, {T}, Sacrifique Inventors' Fair: Procure no seu grimório uma carta de artefato, revele-a, coloque-a na sua mão e embaralhe. Ative só se você controlar três ou mais artefatos.",
    }),
  ] }],
  rulings: {
    1: 'não se aplica: o símbolo de destaque da história (story spotlight) não tem efeito no jogo',
    2: 'teste: CR 602.5: os artefatos são contados só ao ativar',
    3: 'teste: CR 603.4: sem três artefatos no início da manutenção, não dispara',
    4: 'teste: CR 603.4: sem três artefatos ao resolver, não ganha vida',
  },
});
