import{Express,Response,Request} from 'express'
import {
    createUserSessionHandler,
    getUserSessionsHandler,
    deleteSessionHandler,
  } from "./controller/session.controller";
import { createUserHandler,getUserInfo,updateUser } from "./controller/user.controller";
import requireUser from "./middleware/requireUser";
import validateResource from "./middleware/validateResource";
import { createSessionSchema } from "./schema/session.schema";
import { createUserSchema } from "./schema/user.schema";
import deviceRouter from './routes/deviceRouter';
function routes(app:Express){
    app.get("/healthCheck",(req: Request,res: Response)=>{ 
        console.log('HealthCheck endpoint was hit');
        return res.sendStatus(200);
        

    });
    app.post("/api/users", validateResource(createUserSchema), createUserHandler);
    app.post(
        "/api/sessions",
        validateResource(createSessionSchema),
        createUserSessionHandler
      );
    app.get("/api/sessions", requireUser, getUserSessionsHandler);
    app.get('/api/users/:userID/info', requireUser, getUserInfo);
    app.patch('/api/users/:userID', requireUser, updateUser);
    app.delete("/api/sessions", requireUser, deleteSessionHandler);
    app.use('/api/devices', deviceRouter);
}
export default routes