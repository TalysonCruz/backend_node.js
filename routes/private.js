import { PrismaClient } from "@prisma/client";
import e from "express";
import authMiddleware from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js"

const router = e.Router()
const prisma = new PrismaClient()


router.post('/add_product', authMiddleware, isAdmin, async (req, res) => {
    try {
        const product = req.body;

        if (!product.name || !product.description || !product.price || !product.stock) {
            return res.status(400).json({ message: "Está faltando um dado" });
        }

        const productDB = await prisma.product.create({
            data: {
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                subCategoryId: product.subCategoryId,
                categoryId: product.categoryId
            }
        });

        res.status(200).json(productDB);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post("/category",authMiddleware, isAdmin,async (req, res) => {
  try {
    const { name } = req.body; // pega o campo name do corpo da requisição

    if (!name) {
      return res
        .status(400)
        .json({ message: "Nome da categoria é obrigatório." });
    }

    const categoryDB = await prisma.category.create({
      data: { name },
    });

    res.status(201).json(categoryDB); // responder com 201 Created e categoria criada
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    res.status(500).json({ message: "Erro no servidor, tente novamente." });
  }
});

router.post('/subcategory',authMiddleware ,isAdmin ,async (req, res) => {
  try {
    const {name, categoryId} = req.body

    const subCategoryDB = await prisma.subCategory.create({
      data : {
        name: name,
        categoryId : categoryId
      }
    })

    res.status(200).json(subCategoryDB)
    
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    res.status(500).json({ message: "Erro no servidor, tente novamente." });
  }
})


export default router