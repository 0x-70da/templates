import { Router } from "express";
import { requireAuth } from "@workspace/service-kit";

const router: Router = Router();

router.use("/test", requireAuth, (await import("./test.routes.js")).default);

export default router;
