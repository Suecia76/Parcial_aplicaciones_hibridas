import Usuario from "../models/usuarios.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const secretKey = process.env.SECRET;

const getAllUsers = async (req, res) => {
  try {
    let users = await Usuario.find(); // Busca todos los usuarios en MongoDB
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

const getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await Usuario.findById(userId); // Busca un usuario por su ID
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el usuario" });
  }
};

const createUser = async (req, res) => {
  const { nombre, contraseña, email } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const newUser = new Usuario({
      nombre,
      email,
      contraseña: hashedPassword,
    });

    await newUser.save(); // Guarda el nuevo usuario en MongoDB

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Error al crear el usuario" });
  }
};

const loginUser = async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    const user = await Usuario.findOne({ email }); // Busca un usuario por su email
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const validPassword = await bcrypt.compare(contraseña, user.contraseña);
    if (!validPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, secretKey, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { nombre, email, contraseña } = req.body;

  try {
    const user = await Usuario.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualiza los campos si están presentes en el body
    user.nombre = nombre || user.nombre;
    user.email = email || user.email;
    if (contraseña) {
      user.contraseña = await bcrypt.hash(contraseña, 10);
    }

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el usuario" });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await Usuario.findByIdAndDelete(userId); // Elimina el usuario por ID
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el usuario" });
  }
};

export {
  getAllUsers,
  getUserById,
  createUser,
  loginUser,
  updateUser,
  deleteUser,
};
