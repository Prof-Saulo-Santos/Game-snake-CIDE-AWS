# Snake Game 🐍 (@games/game1)

Um jogo clássico do Snake reencapsulado como módulo dentro da Suíte Monorepo.

## 🛠 Arquitetura Modernizada
- **Bundler:** Vite (ES Modules) ao invés de raw script inclusion.
- **Local Scripts:** `npm run dev -w game1` (Para rodar apenas este jogo no terminal).
- **Code Quality e Regras:** Herda globalmente o `eslint.config.js` do Monorepo (Raiz).

> ⚠️ **Atenção:** Como o código agora depende de `type="module"`, extensões legadas como o *Python SimpleHTTP* ou abrir direto no navegador podem gerar falhas de resolução de módulo (CORS/MIME Types). Utilize os comandos NPM.

*Para rodar ou gerar ambiente de produção, siga as instruções no diretório pai ([README Principal](../README.md)).*
