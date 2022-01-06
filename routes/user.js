const { verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} = require("./verifyToken");
const User = require("../models/User");

const router = require("express").Router();

// UPDATE
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SECURITY
    ).toString();
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json(error)
  }

});

// DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.status(200).json("USer has been deleted...")
  } catch (error) {
    res.status(500).json(error)
  }
})

// GET USER
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    const { password, ...others } = user._doc;

    res.status(200).json(others)
  } catch (error) {
    // console.log(error);
    res.status(500).json(error)
  }
})

// GET ALL USER
router.get("/", verifyTokenAndAdmin, async (req, res) => {

  const query = req.query.new;

  try {
    const users = quey ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find()

    res.status(200).json(users)
  } catch (error) {
    console.log(error);
    res.status(500).json(error)
  }
})

// GET USER STATS - Lấy số lượng người dùng mỗi tháng

router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  // Lấy ra năm cũ
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    // Aggregation framework cho phép thực hiện tính toán , xử lý và kết hợp từ nhiều document để cho ra thông tin cần thiết.
    const data = await User.aggregate([
      // chọn document mong muốn truy vấn.
      { $match: { createdAt: { $gte: lastYear } } },
      {
        // $project : chỉ định các field mong muốn truy vấn.
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        // $group: nhóm các document theo điều kiện nhất định
        $group: {
          _id: "$month",
          // tổng số người đăng ký theo tháng
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json(err);
  }

})

module.exports = router
