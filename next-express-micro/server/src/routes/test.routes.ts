import { Router } from "express";
import { getTestController } from "@/controllers/test/test.controller";

const router: Router = Router();

router.get("/:id", getTestController);

export default router;
