import { Router } from "express";

import { userController } from "../controllers/user.controller";
import { commonMiddleware } from "../middlewares";
import { authMiddleware } from "../middlewares/auth.middleware";
import { fileMiddleware } from "../middlewares/file.middleware";
import { UserValidator } from "../validators";

const router = Router();

router.get("/", userController.findAllWithPagination);

router.post(
  "/",
  // тут ми передаємо в дужках саме той валідатор який хочемо використати
  commonMiddleware.isBodyValid(UserValidator.create),
  userController.create
);
router.get(
  "/:userId",
  // огорнули наш метод в функцію в мідлварі, щоб могти динамічно передавати філду з цього роутера в наш метод
  commonMiddleware.isIdValid("userId"),
  authMiddleware.checkAccessToken,
  userController.findById
);

router.put(
  "/:userId",
  commonMiddleware.isIdValid("userId"),
  commonMiddleware.isBodyValid(UserValidator.create),
  authMiddleware.checkAccessToken,
  userController.updateById
);
router.delete(
  "/:userId",
  commonMiddleware.isIdValid("userId"),
  authMiddleware.checkAccessToken,
  userController.deleteById
);
router.post(
  "/:userId/avatar",
  authMiddleware.checkAccessToken,
  commonMiddleware.isIdValid("userId"),
  fileMiddleware.isAvatarValid,
  userController.uploadAvatar
);
router.delete(
  "/:userId/avatar",
  authMiddleware.checkAccessToken,
  commonMiddleware.isIdValid("userId"),
  userController.deleteAvatar
);

router.post(
  "/:userId/video",
  authMiddleware.checkAccessToken,
  commonMiddleware.isIdValid("userId"),
  userController.uploadVideo
);

export const userRouter = router;
