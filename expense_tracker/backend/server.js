require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error(err));

// Define Expense Schema
const ExpenseSchema = new mongoose.Schema({
    desc: String,
    amount: Number,
    date: String
},{ collection: "expenses" });

const Expense = mongoose.model("Expense", ExpenseSchema);

// Add Expense to Database
// app.post("/api/expenses", async (req, res) => {
//     try {
//         const { desc, amount, date } = req.body;
//         const newExpense = new Expense({ desc, amount, date });
//         await newExpense.save();
//         res.status(201).json(newExpense);
//     } catch (error) {
//         res.status(500).json({ error: "Failed to save expense" });
//     }
// });

// ✅ Combined Route for Both Single & Bulk Uploads
app.post("/api/expenses", async (req, res) => {
    try {
        const { expenses, desc, amount, date } = req.body;

        console.log("Received Data:", req.body); // ✅ Debugging incoming request

        // Case 1: Bulk Upload
        if (Array.isArray(expenses) && expenses.length > 0) {
            await Expense.insertMany(expenses);
            return res.status(201).json({ message: "Bulk expenses added successfully!" });
        }

        // Case 2: Single Upload
        if (desc && amount && date) {
            const newExpense = new Expense({ desc, amount, date });
            await newExpense.save();
            return res.status(201).json(newExpense);
        }

        return res.status(400).json({ error: "Invalid expense data" });
    } catch (error) {
        console.error("Error adding expense:", error);
        res.status(500).json({ error: "Failed to save expense" });
    }
});

// Get All Expenses
app.get("/api/expenses", async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
});

// Delete Expense
app.delete("/api/expenses/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedExpense = await Expense.findByIdAndDelete(id);
        if (!deletedExpense) {
            return res.status(404).json({ message: "Expense not found" });
        }
        res.json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete expense" });
    }
});


// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
