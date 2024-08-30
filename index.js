import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const program = new Command();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "data.json");
const months = {1: "January", 2: "Febuary", 3: "March", 
    4: "April", 5: "May", 6: "June", 
    7: "July", 8: "August", 9: "September", 
    10: "October", 11: "November", 12: "December"}

function loadFile() {
    const fileExists = fs.existsSync(filePath);
    if (!fileExists) {
        console.log("No JSON file has been created; creating JSON file");
        saveFile({});
    } 
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
}

function saveFile(data) {
    try {
        const newData = JSON.stringify(data, null, 4);
        fs.writeFileSync(filePath, newData, 'utf-8');
    } catch (err) {
        console.error(`Error while saving user data: ${newData}`);
    }
}

function generateID() {
    let id = 1;
    const fileExists = fs.existsSync(filePath);
    if (fileExists) {
        const data = loadFile();
        id = Math.max(Object.keys(data)) + 1;
    }
    return id;
}

function addExpense(description, amount) {
    const id = generateID();
    console.log(`ID: ${id}`);
    const data = loadFile();
    const newData = {}
    newData[id] = {
        "description": description,
        "amount": amount,
        "date": new Date().toJSON().slice(0, 10)
    };
    Object.assign(data, newData);
    saveFile(data);
}

function updateExpense(id, description, amount) {
    let data = loadFile();
    if (data.hasOwnProperty(id)) {
        if (description) {
            data[id]["description"] = description;
        }
        if (amount) {
            data[id]["amount"] = amount; 
        }
        saveFile(data);
    } else {
        console.log("Enter a valid ID")
    }   
}

function deleteExpense(id) {
    const data = loadFile();
    if (data.hasOwnProperty(id)) {
        delete data[id]
        saveFile(data);
        console.log("Expense deleted successfully")
    } else {
        console.log("Enter a valid ID");
    }
}

function listExpenses() {
    console.log("test");
    const data = loadFile();
    // TODO: The spacing between headers are fixed
    console.log("ID  Date       Description  Amount")
    
    for (const id in data) {
        console.log(`${id}   ${data[id]["date"]}  ${data[id]["description"]}        $${data[id]["amount"]}`);
    }
}

function summarizeExpenses(month) {
    const data = loadFile();
    let expense = 0
    if (month) {
        for (const id in data) {
            const date = parseInt(data[id]["date"].slice(5,7), 10);
            if (date == month) {
                expense += parseFloat(data[id]["amount"]);
            }   
        }
        console.log(`Total expenses for ${months[month]}: $${expense}`);
    } else {
        for (const id in data) {
            expense += parseFloat(data[id]["amount"]);
        }
        console.log(`Total expenses: $${expense}`);
    }
}

// Add new expense
program.command('add')
    .description("Add new expense to budget")
    .requiredOption("-d, --description <description>", "Description for the expense")
    .requiredOption("-a --amount <amount>", "Expense cost")
    .action((options) => {
        const { description, amount} = options;
        addExpense(description, amount)
    })

// Update existing expenses
program.command("update")
    .description("Update description and/or amount of existing expense")
    .requiredOption("--id <id>", "ID of expense to be updated")
    .option("-d, --description <description>", "New description for expense, if applicable")
    .option("-a, --amount <amount>", "New amount for expense, if applicable")
    .action((options) => {
        const { id, description, amount } = options;
        updateExpense(id, description, amount); 
    })

// Delete an expense
program.command("delete")
    .description("Delete an expense given it ID")
    .requiredOption("--id <id>", "ID of expense that is to be deleted")
    .action((options) => {
        const { id } = options;
        deleteExpense(id);
    })

// View all expenses
program.command("list")
    .description("List out all the expenses")
    .action(() => {
        listExpenses();
    })

// View a summary of all expenses
program.command("summary")
    .description("Give a summary of the all the expenses (ID, Date, Description, Amount)")
    .option("-m, --month [int]", "(Optional) Can provide number value of month to view summary of expense only in that month")
    .action((options) => {
        const { month } = options;
        summarizeExpenses(month);
    })

// View a summary of all expenses of a specific month

program.parse(process.argv);
