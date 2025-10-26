import { Router } from "express";
import expensesV1 from "./v1/expenses";
import groupV1 from "./v1/group";

const router = Router();

router.use("/v1/group", groupV1);
router.use("/v1/expense", expensesV1);

export default router;
