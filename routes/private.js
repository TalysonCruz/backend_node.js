import { PrismaClient } from "@prisma/client";
import e from "express";
import authMiddleware from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = e.Router();
const prisma = new PrismaClient();

// Rotas existentes (POST)
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

router.post("/category", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Nome da categoria é obrigatório." });
    }

    const categoryDB = await prisma.category.create({
      data: { name },
    });

    res.status(201).json(categoryDB);
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    res.status(500).json({ message: "Erro no servidor, tente novamente." });
  }
});

router.post('/subcategory', authMiddleware, isAdmin, async (req, res) => {
  try {
    const {name, categoryId} = req.body;

    const subCategoryDB = await prisma.subCategory.create({
      data : {
        name: name,
        categoryId : categoryId
      }
    });

    res.status(200).json(subCategoryDB);
    
  } catch (error) {
    console.error("Erro ao criar subcategoria:", error); // Ajuste no log
    res.status(500).json({ message: "Erro no servidor, tente novamente." });
  }
});

// NOVAS ROTAS PARA ATUALIZAÇÃO (PUT)

// Atualizar Produto
router.put('/product/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const productData = req.body;

        const updatedProduct = await prisma.product.update({
            where: { id: id },
            data: productData,
        });

        res.status(200).json(updatedProduct);
    } catch (error) {
        if (error.code === 'P2025') { // Prisma Client error for record not found
            return res.status(404).json({ message: "Produto não encontrado." });
        }
        console.error("Erro ao atualizar produto:", error);
        res.status(500).json({ message: "Erro no servidor, tente novamente." });
    }
});

// Atualizar Categoria
router.put('/category/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Nome da categoria é obrigatório." });
        }

        const updatedCategory = await prisma.category.update({
            where: { id: id },
            data: { name: name },
        });

        res.status(200).json(updatedCategory);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Categoria não encontrada." });
        }
        console.error("Erro ao atualizar categoria:", error);
        res.status(500).json({ message: "Erro no servidor, tente novamente." });
    }
});

// Atualizar Subcategoria
router.put('/subcategory/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, categoryId } = req.body; // categoryId opcional, pode ser alterado

        if (!name) {
            return res.status(400).json({ message: "Nome da subcategoria é obrigatório." });
        }

        const updatedSubCategory = await prisma.subCategory.update({
            where: { id: id },
            data: { 
                name: name,
                // Adiciona categoryId na atualização apenas se for fornecido
                ...(categoryId && { categoryId: categoryId })
            },
        });

        res.status(200).json(updatedSubCategory);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Subcategoria não encontrada." });
        }
        console.error("Erro ao atualizar subcategoria:", error);
        res.status(500).json({ message: "Erro no servidor, tente novamente." });
    }
});

// NOVAS ROTAS PARA EXCLUSÃO (DELETE)

// Deletar Produto
router.delete('/product/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.product.delete({
            where: { id: id },
        });

        res.status(204).send(); // 204 No Content para indicar sucesso sem retorno de corpo
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Produto não encontrado." });
        }
        console.error("Erro ao deletar produto:", error);
        res.status(500).json({ message: "Erro no servidor, tente novamente." });
    }
});

// Deletar Categoria
router.delete('/category/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.category.delete({
            where: { id: id },
        });

        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Categoria não encontrada." });
        }
        console.error("Erro ao deletar categoria:", error);
        res.status(500).json({ message: "Erro no servidor, tente novamente." });
    }
});

// Deletar Subcategoria
router.delete('/subcategory/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.subCategory.delete({
            where: { id: id },
        });

        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Subcategoria não encontrada." });
        }
        console.error("Erro ao deletar subcategoria:", error);
        res.status(500).json({ message: "Erro no servidor, tente novamente." });
    }
});


export default router;
