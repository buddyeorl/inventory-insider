const foundList = document.getElementById("found");
const wishList = document.getElementById("wish-list");

const renderWishList = () => {
    fetch('/api/wish-list')
        .then(response => response.json())
        .then(data => {
            let wishListData = data.wishList;
            let table = document.createElement("table");
            table.classList.add("my-table-class");
            let tableBody = document.createElement("tbody");

            wishListData.forEach(function (element) {
                let row = document.createElement("tr");
                let wishItem = document.createElement("td");

                wishItem.appendChild(document.createTextNode(element));
                row.appendChild(wishItem);
                tableBody.appendChild(row);
            });
            table.appendChild(tableBody);
            wishList.appendChild(table);
        });
}

const init = () => {
    fetch('/api/found')
        .then(response => response.json())
        .then(data => {
            foundList.innerHTML = "";
            let found = data.found;
            let table = document.createElement("table");
            table.classList.add("my-table-class");
            let tableBody = document.createElement("tbody");

            found.forEach(function (element) {
                let row = document.createElement("tr");
                let itemURL = document.createElement("td");
                let time = document.createElement("td");

                itemURL.appendChild(document.createTextNode(element.itemURL));
                time.appendChild(document.createTextNode(element.time));
                row.appendChild(itemURL);
                row.appendChild(time);
                tableBody.appendChild(row);
            });

            table.appendChild(tableBody);
            foundList.appendChild(table);
            renderWishList();
        });
}

init();