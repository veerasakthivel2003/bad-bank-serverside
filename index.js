var express = require('express');
var mongoose = require('mongoose')
var app = express();
var cors = require('cors');
app.use(cors());
app.use(express.json());
app.get('/', (req,res)=>{res.send("Welcome")})

app.listen(1234, ()=>{console.log("Server Connected")})

mongoose.connect('mongodb://localhost:27017/bank').then(()=>{console.log("DB Connected")})

let data=new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    amount:Number
}) 

let Data=mongoose.model("test",data)


app.get('/data',(req, res) => {Data.find().then((item)=>res.send(item))})

app.post('/create',(req, res)=>{Data.create(req.body).then((item)=>{res.send(item)})})

app.delete('/delete/:id',(req, res)=>{Data.findByIdAndDelete(req.params.id).then((item)=>{res.send("Deleted Successfully")})})


app.put('/update/:id', async (req, res) => {
    try {
      const updatedData = await Data.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.send(updatedData);
    } catch (error) {
      res.status(500).send({ message: "Error updating data", error });
    }
  })


app.post("/data/deposit", async (req, res) => {
  const { email, amount ,password } = req.body;

  try {
      // Find user by email
      const user = await Data.findOne({ email });
      if (!user) {
          return res.status(400).json({ message: "User not found" });
      }

      // Ensure deposit amount is valid
      const depositAmount = parseFloat(amount);
      if (isNaN(depositAmount) || depositAmount <= 0) {
          return res.status(400).json({ message: "Invalid deposit amount" });
      }

      // Update user balance (amount field)
      user.amount += depositAmount;
      await user.save();

      res.json({ message: "Deposit successful", newBalance: user.amount });
  } catch (error) {
      console.error("Deposit Error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
});

  
//   withdraw method
app.post("/data/withdraw", async (req, res) => {
  const { email, amount ,password } = req.body;

  try {
      const user = await Data.findOne({ email });
      if (!user) {
          return res.status(400).json({ message: "User not found" });
      }

  
      const withdrawAmount = parseFloat(amount);
      if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
          return res.status(400).json({ message: "Invalid withdrawal amount" });
      }

      
      if (user.amount < withdrawAmount) {
          return res.status(400).json({ message: "Insufficient balance" });
      }

     
      user.amount -= withdrawAmount;
      await user.save();

      res.json({ message: "Withdrawal successful", newBalance: user.amount });
  } catch (error) {
      console.error("Withdraw Error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
});