import { Router } from "express";
import { getTestController } from "../controllers/test/test.controller.js";

const router: Router = Router();

router.get("/:id", getTestController);

export default router;
