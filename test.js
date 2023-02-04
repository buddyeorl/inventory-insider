
const employees = [[1, "alex", "l", "manager", 2], [2, "alex", "l", "manager", 1], [3, "alex", "l", "manager", 2], [4, "alex", "l", "manager", null]];

const managerIds = employees.map(employee => employee[4]);
//TODO : REMOVE DUPLICATES.
const managers = [];

for (let i = 0; i < managerIds.length; i++) {
    for (let j = 0; j < employees.length; j++) {
        if (managerIds[i] === employees[j][0]) {
            // managers.push(employees[j])
            managers.push({
                id: employees[j][0],
                name: employees[j][1],
                lastName: employees[j][2],
                position: employees[j][3],
                manager_id: employees[j][4],
            })
        }
    }
}

console.log(employees)
console.log(managerIds)
console.log(managers)