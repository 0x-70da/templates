import { Router } from "express";

const router: Router = Router();

router.use("/test", (await import("./test.routes.js")).default);

export default router;
