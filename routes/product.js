const { verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} = require("./verifyToken");
const Product = require("../models/Product");

const router = require("express").Router();

// CREATE
router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newProduct = new Product(req.body);

  try {
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  } catch (error) {
    res.status(500).json(error);
  }
});

// UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json(error)
  }

});

// DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.status(200).json("Product has been deleted...")
  } catch (error) {
    res.status(500).json(error)
  }
})

// GET PRODUCT
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    res.status(200).json(product)
  } catch (error) {
    // console.log(error);
    res.status(500).json(error)
  }
})

// GET ALL PRODUCT
router.get("/", async (req, res) => {

  const queryNew = req.query.new;
  const queryCategory = req.query.category;

  try {
    let products;

    // lấy sản phẩm theo từng loại, 5sp mới nhất hoặc tất cả sản phẩm
    if (queryNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(1)
    } else if (queryCategory) {
      products = await Product.find({
        categories: {
          // Trả về một boolean cho biết liệu một giá trị đã chỉ định 
          // có nằm trong một mảng hay không.
          $in: [queryCategory],
        },
      });
    } else {
      products = await Product.find();
    }

    res.status(200).json(products)
  } catch (error) {
    console.log(error);
    res.status(500).json(error)
  }
})



module.exports = router
