import { Request, Response } from "express";
import PixService from "./pix.service";

export default class PixController {

  async requet( req: Request, res: Response) {
    const pixService = new PixService();

    const {value } = req.body;
    const user = req.user;

    const requestKey = await pixService.request(value, user);

    return res.status(200).send({copyPasteKey: requestKey})

  }

  async pay( req: Request, res: Response) {
    const pixService = new PixService();

    const {key } = req.params;
    const user = req.user;

    const payment = await pixService.pay(key, user);

    return res.status(200).send( payment)

  }

  async transactions( req: Request, res: Response) {
    const pixService = new PixService();

    const transactions = await pixService.transaction(req.user);

    return res.status(200).send(transactions)

  }


}