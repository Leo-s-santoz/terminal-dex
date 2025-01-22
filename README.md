Pokémon Search

Este é um aplicativo de linha de comando que permite pesquisar informações sobre Pokémon da primeira geração (Red/Blue) usando seu nome ou ID. O aplicativo utiliza a PokeAPI para buscar dados dos Pokémon e exibir informações detalhadas sobre cada um.

Requisitos:

Antes de rodar o aplicativo, certifique-se de ter o seguinte instalado:

- Node.js (versão 12 ou superior)
- npm (gerenciador de pacotes do Node.js, que já vem com o Node.js)

Você pode verificar se o Node.js e o npm estão instalados rodando os seguintes comandos no terminal:

node -v
npm -v

Caso não tenha o Node.js instalado, faça o download e instale-o no site oficial.

Instalação:

1. Clone este repositório:

git clone https://github.com/seu-usuario/pokemon-search-cli.git
cd pokemon-search-cli

2. Instale as dependências necessárias citadas acima

Uso:

Após instalar as dependências, rode o aplicativo com o seguinte comando no diretório do arquivo index.js`:

node index.js

Como usar a pesquisa:

- Pesquisar por Nome: Digite o nome de um Pokémon (ex: "Bulbasaur").
- Pesquisar por ID: Digite o ID do Pokémon (ex: "1" para Bulbasaur).
- Sair: Digite "exit" para sair da interface de pesquisa.

Quando você inserir o nome ou ID de um Pokémon, o aplicativo exibirá informações detalhadas, como:
- ID do Pokémon
- Nome
- Ordem no Pokédex
- Peso e altura
- Tipos e habilidades
- Cadeia evolutiva
- Localizações (onde o Pokémon pode ser encontrado nos jogos Red/Blue)
- Movimentos disponíveis nos jogos Red/Blue

Caso não encontre uma correspondência exata do nome digitado, o aplicativo sugerirá a correspondência mais próxima, basta digitar a correspondencia para obter a informação desejada.
Exemplo: 
Caso seja digitado "squartle" o aplicativo irá sugerir o nome correto, no caso "squirtle"
