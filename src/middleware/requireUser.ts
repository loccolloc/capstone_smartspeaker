import { Request, Response, NextFunction } from "express";

const requireUser = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;

  if (!user) {
    return res.sendStatus(403);
  }
  // if (!req.email) {  // Kiểm tra xem email có tồn tại trong req không
  //   return res.status(403).json({ message: "User not authenticated" });
  // }
  return next();
};

export default requireUser;
