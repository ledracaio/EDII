class Grafo {
    constructor() {
        this.vertices = {};
    }

    adicionarVertice(nome) {
        if (!this.vertices[nome]) {
            this.vertices[nome] = {};
            atualizarListaVertices();
        }
    }

    adicionarAresta(de, para, peso) {
        if (!this.vertices[de] || !this.vertices[para]) {
            throw new Error('Ambos os vértices devem existir');
        }
        this.vertices[de][para] = peso;
        this.vertices[para][de] = peso;
        atualizarListaArestas();
    }

    dijkstra(inicio, fim) {
        const distancias = {};
        const anteriores = {};
        const filaPrioridade = new FilaPrioridade();

        for (const vertice in this.vertices) {
            distancias[vertice] = Infinity;
            anteriores[vertice] = null;
            filaPrioridade.enfileirar(vertice, Infinity);
        }
        distancias[inicio] = 0;
        filaPrioridade.enfileirar(inicio, 0);

        while (!filaPrioridade.estaVazia()) {
            const { elemento: verticeAtual } = filaPrioridade.desenfileirar();

            if (verticeAtual === fim) break;

            for (const vizinho in this.vertices[verticeAtual]) {
                const alternativa = distancias[verticeAtual] + this.vertices[verticeAtual][vizinho];
                if (alternativa < distancias[vizinho]) {
                    distancias[vizinho] = alternativa;
                    anteriores[vizinho] = verticeAtual;
                    filaPrioridade.enfileirar(vizinho, alternativa);
                }
            }
        }

        const caminhos = this.obterTodosOsCaminhos(inicio, fim, anteriores);
        const caminhoMaisCurto = caminhos.sort((a, b) => a.custo - b.custo)[0];

        return {
            distancias,
            caminhos,
            caminhoMaisCurto
        };
    }

    obterTodosOsCaminhos(inicio, fim, anteriores) {
        const caminhos = [];

        const dfs = (vertice, caminho, custo) => {
            caminho.push(vertice);

            if (vertice === fim) {
                caminhos.push({ caminho: caminho.slice(), custo });
            } else {
                for (const vizinho in this.vertices[vertice]) {
                    if (!caminho.includes(vizinho)) {
                        dfs(vizinho, caminho.slice(), custo + this.vertices[vertice][vizinho]);
                    }
                }
            }
        };

        dfs(inicio, [], 0);

        return caminhos;
    }

    exportarParaJSON() {
        return JSON.stringify(this.vertices, null, 2);
    }

    importarDeJSON(json) {
        this.vertices = JSON.parse(json);
        atualizarListaVertices();
        atualizarListaArestas();
    }
}

class FilaPrioridade {
    constructor() {
        this.fila = [];
    }

    enfileirar(elemento, prioridade) {
        this.fila.push({ elemento, prioridade });
        this.fila.sort((a, b) => a.prioridade - b.prioridade);
    }

    desenfileirar() {
        return this.fila.shift();
    }

    estaVazia() {
        return this.fila.length === 0;
    }
}

const grafo = new Grafo();

function adicionarVertice() {
    const nomeVertice = document.getElementById('vertexName').value.trim();
    if (nomeVertice) {
        grafo.adicionarVertice(nomeVertice);
        document.getElementById('vertexName').value = '';
    } else {
        alert('Por favor, insira um nome de vértice.');
    }
}

function adicionarAresta() {
    const verticeDe = document.getElementById('fromVertex').value.trim();
    const verticePara = document.getElementById('toVertex').value.trim();
    const peso = parseFloat(document.getElementById('weight').value);

    if (verticeDe && verticePara && !isNaN(peso)) {
        try {
            grafo.adicionarAresta(verticeDe, verticePara, peso);
            document.getElementById('fromVertex').value = '';
            document.getElementById('toVertex').value = '';
            document.getElementById('weight').value = '';
        } catch (error) {
            alert(error.message);
        }
    } else {
        alert('Por favor, insira todos os dados da aresta.');
    }
}

function executarDijkstra() {
    const verticeInicio = document.getElementById('startVertex').value.trim();
    const verticeFim = document.getElementById('endVertex').value.trim();
    if (verticeInicio && verticeFim) {
        try {
            const resultado = grafo.dijkstra(verticeInicio, verticeFim);
            document.getElementById('results').textContent = `Distâncias: ${JSON.stringify(resultado.distancias, null, 2)}`;
            
            document.getElementById('allPaths').textContent = `Todos os Caminhos:\n${resultado.caminhos.map(c => `Caminho: ${c.caminho.join(' -> ')}\nCusto: ${c.custo}`).join('\n\n')}`;
            
            if (resultado.caminhoMaisCurto) {
                document.getElementById('shortestPath').textContent = `Caminho Mais Curto: ${resultado.caminhoMaisCurto.caminho.join(' -> ')}\nCusto Total: ${resultado.caminhoMaisCurto.custo}`;
            } else {
                document.getElementById('shortestPath').textContent = 'Não há caminho disponível.';
            }
        } catch (error) {
            alert('Erro ao executar o algoritmo de Dijkstra.');
            console.error(error);
        }
    } else {
        alert('Por favor, insira o vértice inicial e o vértice final.');
    }
}

function atualizarListaVertices() {
    const listaVertices = document.getElementById('vertexList');
    const startVertexSelect = document.getElementById('startVertex');
    const endVertexSelect = document.getElementById('endVertex');
    const fromVertexSelect = document.getElementById('fromVertex');
    const toVertexSelect = document.getElementById('toVertex');

    listaVertices.innerHTML = '';
    startVertexSelect.innerHTML = '';
    endVertexSelect.innerHTML = '';
    fromVertexSelect.innerHTML = '';
    toVertexSelect.innerHTML = '';

    for (const vertice in grafo.vertices) {
        const li = document.createElement('li');
        li.textContent = vertice;
        listaVertices.appendChild(li);

        const option = document.createElement('option');
        option.value = vertice;
        option.textContent = vertice;
        
        // Adicionar opções para todos os selects
        startVertexSelect.appendChild(option.cloneNode(true));
        endVertexSelect.appendChild(option.cloneNode(true));
        fromVertexSelect.appendChild(option.cloneNode(true));
        toVertexSelect.appendChild(option.cloneNode(true));
    }
}

function atualizarListaArestas() {
    const listaArestas = document.getElementById('edgeList');
    listaArestas.innerHTML = '';
    for (const vertice in grafo.vertices) {
        for (const vizinho in grafo.vertices[vertice]) {
            const li = document.createElement('li');
            li.textContent = `${vertice} --(${grafo.vertices[vertice][vizinho]})--> ${vizinho}`;
            listaArestas.appendChild(li);
        }
    }
}

function exportarGrafo() {
    const json = grafo.exportarParaJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grafo.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importarGrafo() {
    const inputArquivo = document.getElementById('importFile');
    const arquivo = inputArquivo.files[0];
    if (arquivo) {
        const leitor = new FileReader();
        leitor.onload = function(event) {
            try {
                grafo.importarDeJSON(event.target.result);
            } catch (error) {
                alert('Erro ao importar o arquivo JSON.');
                console.error(error);
            }
        };
        leitor.readAsText(arquivo);
    } else {
        alert('Por favor, selecione um arquivo JSON para importar.');
    }
}