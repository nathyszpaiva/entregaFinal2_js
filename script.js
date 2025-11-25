document.addEventListener('DOMContentLoaded', () => {
    // REMOVIDO: Objeto/mapa em JavaScript para mapear tipos a cores e classes de legibilidade (pokemonTypes)

    const searchHistory = [];
    const historyList = document.getElementById('history-list');
    const searchButton = document.getElementById('search-button');
    const pokemonInput = document.getElementById('pokemon-input');
    const pokemonListDiv = document.getElementById('pokemon-list');
    const loadMoreButton = document.getElementById('load-more-button');
    const pokemonInfoDiv = document.getElementById('pokemon-info');

    let offset = 0;
    let activeDetailCard = null;

    // Evento do botão de busca (Busca manual)
    searchButton.addEventListener('click', () => {
        const pokemonNameOrId = pokemonInput.value.toLowerCase().trim();
        if (pokemonNameOrId) {
            fetchAndDisplayDetails(pokemonNameOrId, pokemonInfoDiv, true);
        } else {
            // Mensagem de erro se o campo estiver VAZIO
            pokemonInfoDiv.innerHTML = '<p style="text-align: center; color: red;">Por favor, digite o nome ou ID do Pokémon.</p>';
        }
    });

    /**
     * Limpa o estilo e o estado do card de detalhes anterior.
     */
    function resetActiveCard() {
        if (activeDetailCard && activeDetailCard.pokemonData) {
            // Reverte o estilo do card
            activeDetailCard.classList.remove('active-details');
            // REMOVIDO: Limpeza de classes de cor e background-color
            activeDetailCard.style.textAlign = 'center';
            activeDetailCard.style.height = 'auto';

            // Reverte o conteúdo do card para o estado de lista
            const data = activeDetailCard.pokemonData;
            const pokeId = data.id;
            activeDetailCard.innerHTML = `
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png" alt="${data.name}">
                <h3>${data.name}</h3>
            `;
            // Adiciona o listener de volta
            addCardClickListener(activeDetailCard, data.name, pokeId);
            
            activeDetailCard = null; // Limpa o estado
        } else if (pokemonInfoDiv.classList.contains('active-details')) {
             // Limpa o card de busca manual
             pokemonInfoDiv.classList.remove('active-details');
             // REMOVIDO: Limpeza de classes de cor e background-color
             pokemonInfoDiv.innerHTML = ''; // Não coloca instrução inicial
        }
    }

    // Função centralizada para buscar e exibir detalhes
    async function fetchAndDisplayDetails(query, targetElement, isManualSearch = false) {
        
        // Se a busca é por clique na lista, limpamos o card anterior
        if (!isManualSearch) {
            resetActiveCard(); 
        }

        // Mostrar "Carregando"
        targetElement.innerHTML = '<p style="text-align: center;">Carregando...</p>';
        targetElement.style.textAlign = 'center';
        targetElement.style.height = '150px';

        try {
            const apiUrl = `https://pokeapi.co/api/v2/pokemon/${query}`;
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                targetElement.innerHTML = `<p style="color: red;">Erro: Pokémon não encontrado!</p>`;
                targetElement.style.backgroundColor = '#fff';
                targetElement.classList.remove('active-details');
                return;
            }
            
            const data = await response.json();
            addToHistory(data.name);
            displayPokemonDetails(data, targetElement, isManualSearch);
            
        } catch (error) {
            console.error(error.message);
            targetElement.innerHTML = `<p style="color: red;">Erro ao carregar detalhes.</p>`;
        }
    }

    // Exibir Pokémon na tela (Renderiza os detalhes)
    function displayPokemonDetails(pokemon, cardElement, isManualSearch) {
        
        // 1. Configurações de Estado
        if (!isManualSearch) {
            activeDetailCard = cardElement; // Define o novo card ativo
            cardElement.pokemonData = pokemon; // Armazena os dados originais no elemento
        }

        // 2. Estilos Dinâmicos
        // REMOVIDO: Lógica para obter primaryType e typeInfo
        
        cardElement.classList.add('active-details');
        // REMOVIDO: cardElement.classList.add(typeInfo.textClass);
        // REMOVIDO: cardElement.style.backgroundColor = typeInfo.color;
        cardElement.style.textAlign = 'left';
        cardElement.style.height = 'auto';


        // 3. Conteúdo HTML
        const types = pokemon.types
            .map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1))
            .join(', ');

        const pokeImage =
            pokemon.sprites.front_default ||
            pokemon.sprites.other['official-artwork'].front_default;

        const htmlContent = `
            <h2>${pokemon.name} (#${pokemon.id})</h2>
            <img src="${pokeImage}" alt="${pokemon.name}" class="detail-img">
            <p><strong>Tipo(s):</strong> ${types}</p>
            <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
            <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
        `;
        
        cardElement.innerHTML = htmlContent;

        // 4. Se for busca manual, adiciona o botão de Limpar
        if (isManualSearch) {
            const closeButton = document.createElement('button');
            closeButton.classList.add('close-details-button');
            closeButton.textContent = 'Limpar Card';
            closeButton.addEventListener('click', resetActiveCard);
            cardElement.appendChild(closeButton);
        }
    }

    // Adicionar ao histórico de buscas
     function addToHistory(name) {
        if (!searchHistory.includes(name)) {
            searchHistory.push(name);
        }
        displayHistory();
    }

    // Mostrar histórico de buscas
    function displayHistory() {
        historyList.innerHTML = "";
        searchHistory.forEach(pokeName => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.textContent = pokeName;
            link.href = "#";
            link.addEventListener('click', () => {
                // Ao clicar no histórico, exibe no card de info padrão
                fetchAndDisplayDetails(pokeName, pokemonInfoDiv, true); 
            });
            li.appendChild(link);
            historyList.appendChild(li);
        });
    }


    // Função auxiliar para adicionar o listener de clique
    function addCardClickListener(cardElement, pokemonName, pokeId) {
        const handler = () => {
            fetchAndDisplayDetails(pokemonName, cardElement, false);
        };
        cardElement.addEventListener('click', handler, { once: true });
    }


    // Exibir a lista de Pokémon
    function displayPokemonList(pokemonArray) {
        pokemonArray.forEach(pokemon => {
            const card = document.createElement('div');
            card.classList.add('pokemon-card', 'list-item');
            
            const pokeId = pokemon.url.split('/').filter(Boolean).pop();
            
            card.innerHTML = `
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png" alt="${pokemon.name}">
                <h3>${pokemon.name}</h3>
            `;
            
            addCardClickListener(card, pokemon.name, pokeId);
            
            pokemonListDiv.appendChild(card);
        });
    }

    // Função para carregar a lista de Pokémon (150 por vez)
    async function fetchPokemonList(offset = 0) {
        try {
            const apiUrl = `https://pokeapi.co/api/v2/pokemon?limit=150&offset=${offset}`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Não foi possível carregar a lista de Pokémon.');
            }
            const data = await response.json();
            displayPokemonList(data.results);
        } catch (error) {
            console.error(error);
        }
    }

    // Evento do botão "Carregar Mais"
    loadMoreButton.addEventListener('click', () => {
        offset += 150;
        fetchPokemonList(offset);
    });

    // Carregar a lista inicial de Pokémon
    fetchPokemonList(offset);
});