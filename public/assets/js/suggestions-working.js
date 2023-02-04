class TrieNode {
    constructor() {
        this.children = {};
        this.isEnd = false;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        let node = this.root;
        for (let char of word) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.isEnd = true;
    }

    suggest(prefix) {
        let node = this.root;
        let suggestions = []
        for (let char of prefix) {
            node = node.children[char];
            if (!node) {
                return suggestions;
            }
        }
        this._suggest(node, prefix, suggestions);
        return suggestions;
    }

    _suggest(node, prefix, suggestions) {
        if (node.isEnd) {
            suggestions.push(prefix);
        }
        for (let child in node.children) {
            this._suggest(node.children[child], prefix + child, suggestions);
        }
        if (Object.keys(node.children).length === 0) suggestions.push(prefix);
    }
}

let trie = new Trie();
let objects = ["apple", "banana", "orange", "grapes"];

objects.forEach(object => trie.insert(object));

document.getElementById("input").addEventListener("input", e => {
    let input = e.target.value;
    suggestions = trie.suggest(input);
    let suggestionsElem = document.getElementById("suggestions");
    suggestionsElem.innerHTML = "";
    suggestions.forEach(suggestion => {
        let suggestionElem = document.createElement("div");
        suggestionElem.innerHTML = suggestion;
        suggestionElem.onclick = () => {
            document.getElementById("input").value = suggestion;
            suggestionsElem.innerHTML = "";
        };
        suggestionsElem.appendChild(suggestionElem);
    });
});



function suggest() {
    let input = document.getElementById("input").value;
    suggestions = trie.suggest(input);
    let suggestionsElem = document.getElementById("suggestions");
    suggestionsElem.innerHTML = "";
    suggestions.forEach(suggestion => {
        let suggestionElem = document.createElement("div");
        suggestionElem.innerHTML = suggestion;
        suggestionElem.onclick = () => {
            document.getElementById("input").value = suggestion;
            suggestionsElem.innerHTML = "";
        };
        suggestionsElem.appendChild(suggestionElem);
    });
}
