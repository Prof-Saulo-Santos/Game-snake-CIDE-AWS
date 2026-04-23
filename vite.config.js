import { defineConfig } from 'vite';

export default defineConfig({
    // Garante que o Vite gere caminhos estáticos relativos (./) e não absolutos (/),
    // fundamental para que o jogo não quebre em subdomínios ou caminhos variados nas CDNs da AWS.
    base: './',
    build: {
        outDir: 'dist',
        emptyOutDir: true
    }
});
