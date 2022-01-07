const { verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} = require("./verifyToken");
const Order = require("../models/Order");

const router = require("express").Router();

// CREATE
router.post("/", verifyToken, async (req, res) => {
  const newOrder = new Order(req.body);

  try {
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (error) {
    res.status(500).json(error);
  }
});

// UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.log(error);
    res.status(500).json(error)
  }

});

// DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id)
    res.status(200).json("Order has been deleted...")
  } catch (error) {
    res.status(500).json(error)
  }
})

// GET USER order
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const order = await Order.find({ userId: req.params.userId })

    res.status(200).json(order)
  } catch (error) {
    // console.log(error);
    res.status(500).json(error)
  }
})

// GET ALL 
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const allOrder = await Order.find()

    res.status(200).json(allOrder)
  } catch (error) {
    res.status(500).json(error);
  }
})

// GET MONTHLY INCOME

router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    // Aggregation framework cho phép thực hiện tính toán , xử lý và kết hợp từ nhiều document để cho ra thông tin cần thiết.
    const income = await Order.aggregate([
      // chọn document mong muốn truy vấn.
      { $match: { createdAt: { $gte: previousMonth } } },
      {
        // $project : chỉ định các field mong muốn truy vấn.
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        // $group: nhóm các document theo điều kiện nhất định
        $group: {
          _id: "$month",
          // tổng số người mua hàng theo tháng
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }

})

module.exports = router
