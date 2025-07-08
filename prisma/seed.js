import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Criptografando a senha do admin
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("123@Admin@123", salt);

  // Criação ou atualização do admin
  await prisma.admin.upsert({
    where: { email: "admin@exemplo.com" },
    update: {},
    create: {
      name: "Admin Master",
      email: "admin@exemplo.com",
      password: passwordHash,
    },
  });

  // Criação das categorias
  const catEletronicos = await prisma.category.upsert({
    where: { name: "Eletrônicos" },
    update: {},
    create: { name: "Eletrônicos" },
  });

  const catMoveis = await prisma.category.upsert({
    where: { name: "Móveis" },
    update: {},
    create: { name: "Móveis" },
  });

  // Criação das subcategorias
  const subSmartphones = await prisma.subCategory.upsert({
    where: { name: "Smartphones" },
    update: {},
    create: {
      name: "Smartphones",
      categoryId: catEletronicos.id,
    },
  });

  const subMesas = await prisma.subCategory.upsert({
    where: { name: "Mesas" },
    update: {},
    create: {
      name: "Mesas",
      categoryId: catMoveis.id,
    },
  });

  // Criação dos produtos com subcategoria e categoria
  const prod1 = await prisma.product.upsert({
    where: { name: "Smartphone X" },
    update: {},
    create: {
      name: "Smartphone X",
      description: "Smartphone topo de linha",
      price: 3500,
      stock: 10,
      categoryId: catEletronicos.id,
      subCategoryId: subSmartphones.id,
    },
  });

  const prod2 = await prisma.product.upsert({
    where: { name: "Mesa de Jantar" },
    update: {},
    create: {
      name: "Mesa de Jantar",
      description: "Mesa para 6 pessoas",
      price: 1200,
      stock: 5,
      categoryId: catMoveis.id,
      subCategoryId: subMesas.id,
    },
  });

  console.log("Seed rodado com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro ao rodar o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
