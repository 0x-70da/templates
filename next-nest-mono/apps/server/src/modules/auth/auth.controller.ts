import { Controller, All, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../../lib/auth";

@Controller("api/auth")
export class AuthController {
  private readonly handler = toNodeHandler(auth);

  @All("*")
  async handleAuth(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.handler(req, res);
  }
}
