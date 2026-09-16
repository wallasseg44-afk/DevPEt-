# DevPet

Um companheiro virtual que cresce junto com os estudos de programação. Aplicação funcional em português do Brasil, sem login, serviços externos ou dependências de produção.

## Abrir o aplicativo

Requer Node.js 22 ou superior. Na pasta do projeto, execute:

```sh
npm start
```

No PowerShell, se a execução de scripts estiver desabilitada, use `npm.cmd start` ou `node server.mjs`.

Abra **http://localhost:5173**. Não é necessário executar `npm install`. Para encerrar o servidor, pressione `Ctrl+C` no terminal. Abra sempre pelo mesmo endereço e porta para acessar os dados salvos nesse navegador.

## O que está incluído

- 23 atividades de estudantes em cinco categorias, com 5, 10, 15 ou 20 XP visíveis antes do registro.
- Registro rápido; conteúdo, minutos, anotação, dúvida, data e autoavaliação opcionais.
- Histórico pesquisável, filtro por categoria, edição e exclusão de sessões.
- Atividades personalizadas; edição e ocultação das sugestões. Sugestões consideram assuntos, momento de aprendizado e frequência de uso.
- Nome do pet, meta semanal ajustável e redução de animações. A preferência de movimento reduzido do sistema também é respeitada.
- XP, nível, transformações e conquistas calculados a partir dos registros. Nenhuma perda por pausas.
- Dados locais, exportação e importação de backup JSON com validação e prévia antes de substituir dados.
- Interface responsiva, diálogos nativos com navegação por teclado, foco visível e mensagens acessíveis.

## Evolução

Cada 100 XP aumenta um nível. O nível inicial é 1.

| Estágio | XP acumulado | Nível |
| --- | ---: | ---: |
| Ovo | 0 | 1 |
| Filhote | 100 | 2 |
| Jovem | 400 | 5 |
| Adulto | 900 | 10 |

Depois de adulto, a cada 500 XP aparece um novo detalhe: broche, óculos, luz companheira, brilhos e novas cores da luz. O nível continua aumentando.

O XP representa participação registrada, não domínio de programação. Pausas não alteram o pet. Editar ou excluir registros recalcula XP, nível, aparência, meta e conquistas. Editar uma **opção do catálogo** só afeta sessões futuras, preservando as informações do histórico; o XP de uma sessão existente pode ser corrigido no próprio registro.

A meta conta sessões de segunda-feira a domingo no fuso local do dispositivo, sem exigir dias consecutivos. Minutos são opcionais e não modificam o XP.

## Seus dados

Os dados ficam no `localStorage`, na chave `devpet.v1`, somente neste navegador, dispositivo e endereço. Não há sincronização, conta ou envio de estudos a um servidor. Limpar os dados do navegador ou usar uma janela anônima pode eliminar o progresso. Exporte um backup em **Configurações** para guardá-lo ou transferi-lo.

A importação valida o conteúdo antes de substituir os dados. IDs duplicados, referências inválidas, datas futuras, valores de XP indevidos e versões desconhecidas são rejeitados. Falhas ao salvar são informadas; o aplicativo não confirma registros que não foram persistidos. Alterações em outra aba atualizam a interface.

## Testar

```sh
npm test
npm run test:browser
```

Os testes de lógica usam o executor nativo do Node.js. Os testes de navegador usam o Chrome em modo headless pelo Chrome DevTools Protocol, sem bibliotecas extras. Por padrão, o Chrome é procurado em `C:\Program Files\Google\Chrome\Application\chrome.exe`. Defina `CHROME_PATH` para usar outro executável.

Os testes de navegador iniciam o servidor local se necessário e usam um perfil isolado, sem tocar nos dados do navegador pessoal. Capturas de desktop, celular e formulários ficam em `test-results/`.

São verificados: registro completo, clique repetido, sessões reais repetidas, pesquisa, edição e exclusão, restauração após recarregar, preferências, atividades personalizadas, backup inválido e válido, exportação, transformação aos 100 XP, recálculo após exclusão, contraste de texto nas cinco telas, interação por teclado e telas de 320 e 390 pixels.

## Estrutura

`app.js` contém as telas e interações; `model.js`, os dados e regras; `pet.js`, as ilustrações vetoriais dos estágios; `styles.css`, a interface; `server.mjs`, o servidor estático local. Todos os recursos visuais são locais e o aplicativo não faz requisições a serviços externos.
