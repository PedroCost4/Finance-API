import express from 'express';
import { v4 } from 'uuid';

const app = express();


const customers = [];

//Middleware

app.use(express.json());
const verifyIfAccountExistsCPF = (req, res, next) => {
    const { cpf } = req.headers;
    const customer = customers.find(customer => customer.cpf === cpf);
    req.customer = customer;
    return (!customer) ? res.status(400).send({ error: "Customer not found" }) : next(); 
}


app
.post('/account', (req, res) => {
    const { name, cpf } = req.body;
    const id = v4();
    let balance = 0;

    const cpfAlreadyExists = customers.some(customer => customer.cpf === cpf);
    if (cpfAlreadyExists) {
        res.status(400).send({error: "Customer already exists"})
    }

    customers.push({
        id,
        name,
        cpf,
        balance,
        statement: []
        });
    return res.status(201).send();
})

app.use(verifyIfAccountExistsCPF)

.get('/statement/', (req, res) => { 
    const { customer } = req;
    return res.json(customer.statement);
})

.post('/deposit', (req, res) => {
    const { description, amount } = req.body;
    const { customer } = req;

    customer.balance += amount;

    const statementOperation = {
        description,
        amount,
        createdAt: new Date(),
        type: "credit"
    }

    customer.statement.push(statementOperation);
    return res.status(201).send();
})

.post('/withdraw', (req, res) => {
    const {description, amount} = req.body;
    const { customer } = req;

    
    if (customer.balance < amount) {
        return res.status(400).send({error: "Insufficient funds!"});
    }

    customer.balance -= amount;

    const statementOperation = {
        description,
        amount,
        createdAt: new Date(),
        type: "debit"
    }

    customer.statement.push(statementOperation);
    return res.status(201).send();
})

.get('/statement/date', (req, res) => { 
    const { date } = req.query;
    const { customer } = req;
    const dateFormat = new Date(date + " 00:00 ");
    const statement = customer.statement.filter(statement => statement.createdAt.toDateString() === new Date(dateFormat).toDateString());
    return res.json(statement);
})

.put("/account", (req, res)=> {
    const { name } = req.body;
    const { customer } = req;
    customer.name = name;
    return res.status(201).send();
})

.get("/account", (req, res) => {
    const { customer } = req;
    return res.json(customer);
})

.delete("/account", (req, res) => {
    const { customer } = req;
    customers.splice(customer, 1);
    return res.status(200).json(customers);
})

.get('/balance', (req, res) => {
    const { customer } = req;
    const balance = customer.balance;
    return res.json(balance);
})

app.listen(3333, () => console.log('Server is running on port 3333'));