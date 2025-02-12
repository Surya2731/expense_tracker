const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/expense-tracker', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Expense Schema
const ExpenseSchema = new mongoose.Schema({
    desc: String,
    amount: Number,
    date: String
});

const Expense = mongoose.model('Expense', ExpenseSchema);

// Add Expense API
app.post('/add-expense', async (req, res) => {
    console.log("➡️ Received Expense:", req.body);
    const { desc, amount, date } = req.body;
    const expense = new Expense({ desc, amount, date });
    await expense.save();
    res.json({ message: '✅ Expense added!' });
});

// Get Expenses API
app.get('/expenses', async (req, res) => {
    console.log("📦 Fetching all expenses...");
    const expenses = await Expense.find();
    res.json(expenses);
});

// Delete Expense API
app.delete('/delete-expense/:id', async (req, res) => {
    console.log("🗑️ Deleting Expense ID:", req.params.id);
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: '✅ Expense deleted!' });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));