let associationTrees = {
    summer: {
        heat: {
            heatstroke: {},
            dehydration: {}
        },
        sunburn: {},
        insect: {
            bites: {},
            stings: {}
        }
    },
    winter: {
        cold: {
            hypothermia: {},
            frostbite: {}
        },
        snow: {
            slippery: {},
            shoveling: {}
        },
        ice: {
            slips: {},
            falls: {}
        }
    },
    knee: {
        arthritis: {},
        meniscus: {},
        ligament: {
            ACL: {},
            PCL: {},
            MCL: {},
            LCL: {}
        },
        bursitis: {},
        tendinitis: {}
    }
}
let list = [{ description: "dehydration is fun dog", id: 1 }, { description: "heat is orange", id: 2 }, { description: "heatstroke cat", id: 3 }, { description: "summer catalog", id: 4 }, { description: "bird", id: 5 }];
const trie = createTrie(list);
console.log(trie)

function createTrie(list) {
    let root = {};

    for (let obj of list) {
        let current = root;
        for (let char of obj.description) {
            if (!current[char]) {
                current[char] = {};
            }
            current = current[char];
        }
        current.isWord = true;
        current.id = obj.id; // add an id to the current node if it exists in the object
    }

    return root;
}

function searchTrie(trie, searchString) {
    let suggestions = [];
    findWords(trie, searchString, suggestions, "");
    return suggestions;
}

function findWords(current, searchString, suggestions, word) {
    for (let char in current) {
        if (char === 'isWord' && word.includes(searchString)) {
            // suggestions.push(word);
            suggestions.push({ description: word, id: current.id });
        } else if (char !== 'isWord') {
            findWords(current[char], searchString, suggestions, word + char);
        }
    }
}


// working 100%
function searchAssociationTrees(list, associationTrees, searchString) {
    if (!searchString) {
        return [];
    }

    let suggestions = [];
    let currentTree;

    // Helper function to find the specific association tree that contains the searchString
    function findTree(current, searchString) {
        for (let char in current) {
            if (char === searchString) {
                currentTree = current;
                return;
            } else if (char !== 'isWord') {
                findTree(current[char], searchString);
            }
        }
    }

    // Helper function to search for the input in the association trees
    function findWords(current, suggestions, word) {
        for (let char in current) {
            suggestions.push(...searchTrie(trie, char));
            if (char !== 'isWord') {
                findWords(current[char], suggestions, word + char);
            }
        }
    }

    findTree(associationTrees, searchString);
    findWords(currentTree, suggestions, "");
    if (suggestions.length === 0) {
        suggestions.push(...searchTrie(trie, searchString));
    }
    return suggestions;
}





// let trie = createTrie(list);
// let searchString = 'og';
// console.log(searchAssociationTrees(list, associationTrees, searchString));

// console.log(searchTrie(trie, searchString));
// console.log(trie);
function trimString(str) {
    let noExtraSpaces = str.replace(/\s+/g, " ");
    return noExtraSpaces.replace(/^\s+|\s{2,}/g, "");
}


function displaySuggestions(suggestions, searchString) {
    console.log(suggestions)
    // Clear the previous suggestions
    document.getElementById("suggestions-list").innerHTML = "";

    // Loop through the suggestions array
    for (let i = 0; i < suggestions.length; i++) {
        // Create a new list item for each suggestion
        let suggestion = document.createElement("li");

        // Check if searchString exists in the suggestion
        if (suggestions[i].description.includes(searchString)) {
            // Split the suggestion by searchString
            let parts = suggestions[i].description.split(searchString);
            let newSuggestion = "";

            // loop through the parts and add bold tags around searchString
            for (let j = 0; j < parts.length; j++) {
                newSuggestion += parts[j];
                if (j !== parts.length - 1) {
                    newSuggestion += "<b>" + searchString + "</b>";
                }
            }
            suggestion.innerHTML = newSuggestion;
        } else {
            suggestion.innerHTML = suggestions[i].description;
        }

        // Append the new list item to the suggestions list
        document.getElementById("suggestions-list").appendChild(suggestion);
    }
}

let input = document.getElementById("input");
// let suggestionsList = document.getElementById("suggestions-list");

input.addEventListener("input", function () {
    let searchString = trimString(input.value);
    let suggestions = searchAssociationTrees(list, associationTrees, searchString);
    console.log(suggestions)
    // call the displaySuggestions function and pass in the suggestions and searchString
    displaySuggestions(suggestions, searchString);
});


