import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";


const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/cadastro", async (req, res) => {
  try {
    const user = req.body;

    const salt = await bcrypt.genSalt(10);
    const passwordCrypt = await bcrypt.hash(user.password, salt);

    if (!user.name || !user.password || !user.email) {
      return res.status(400).json({ message: "Algum dado esta faltando!" });
    }

    if (!validator.isEmail(user.email)) {
      return res.status(400).json({ error: "E-mail inválido!" });
    }
    const userDB = await prisma.user.create({
      data: {
        name: user.name,
        password: passwordCrypt,
        email: user.email,
      },
    });
    if (!userDB) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const { password, ...userWithoutPassword } = userDB;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(400).json({ message: "Email já cadastrado." });
      }
    }
    res.status(500).json({
      message: "Erro no servidor, tente novamente.",
      error: error.message,
    });
  }
});

router.get('/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verifica se é admin ou user
    if (decoded.role === "admin") {
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
        }
      });
      return res.json(admin);
    } else {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,

        }
      });
      return res.json(user);
    }

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Token inválido" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expirado" });
    }
    console.error("Erro na rota /user:", error);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
});

router.get("/check-email", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email não fornecido na query." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    res.json({ exists: !!user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao verificar email.", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(401).json({ message: "Senha incorreta!" });

      // Token específico para ADMIN
      const token = jwt.sign(
        { 
          id: admin.id,
          email: admin.email,
          role: "admin",  // Diferente do role user
          name: admin.name
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: "admin"  
        }
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "E-mail não cadastrado." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Senha incorreta!" });

    // Token específico para USER
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: "user",
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: "user" 
      }
    });

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro interno no servidor" });
  }
});

router.get("/product", async (req, res) => {
  try {
    const products = await prisma.product.findMany();

    res.status(200).json(products);
  } catch (e) {
    res.status(500).json({ message: "Erro no servidor, tente novamente." });
  }
});

router.get("/product/name/:name", async (req, res) => {
  try {
    const productName = req.params.name;

    const productDB = await prisma.product.findMany({
      where: {
        name: {
          contains: productName,
          mode: "insensitive",
        },
      },
    });

    if (productDB.length === 0) {
      return res.status(400).json({ message: "Produto não encontrada" });
    }

    res.status(200).json(productDB);
  } catch (error) {
    res.status(500).json({ message: "Erro no servidor, tente novamente." });
  }
});


router.get("/category", async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Erro ao buscar por categoria:", error);
    res.status(500).json({ message: "Erro no servidor, tente novamente." });
  }
});

router.get("/subcategory", async (req, res) => {
  try {
    const subCategory = await prisma.subCategory.findMany()

    res.status(200).json(subCategory)
  } catch (error) {
    console.error("Erro ao buscar por categoria:", error);
    res.status(500).json({ message: "Erro no servidor, tente novamente." });
  }
})

export default router;
