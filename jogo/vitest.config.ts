import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['node_modules/**', '.cache/**', 'cliente/**', 'dist/**'],
    // as transformações dos arquivos ficam guardadas entre uma rodada e outra (refeitas só para o que mudou): eram
    // perto de 70% do tempo da suíte. A pasta é a .cache desta cópia do jogo (fora do git; cada worktree tem a sua)
    fsModuleCache: true,
    fsModuleCachePath: '.cache/vitest',
  },
});
