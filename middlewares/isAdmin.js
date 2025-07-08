function isAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Acesso negado. Apenas administradores." });
  }
  next();
}

export default isAdmin