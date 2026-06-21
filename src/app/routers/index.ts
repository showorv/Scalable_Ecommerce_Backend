import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";

export const router = Router()

const moduleRouters = [
    {
        path:"/auth",
        route: authRoutes
    }
]


moduleRouters.forEach((routes)=>{
    router.use(routes.path, routes.route)
})