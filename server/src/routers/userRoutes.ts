import { Router } from "express";
import { getUsers, createUser } from "../controllers/usersControllers";

const router = Router();

router.get("/users", (req, res) => {
  res.send("List of users");
});

router.get("/users/:id", getUsers);

router.get("/user/:name", createUser);

export default router;
