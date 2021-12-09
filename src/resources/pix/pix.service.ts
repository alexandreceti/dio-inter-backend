

import { getRepository } from 'typeorm'
import {User} from '../../entity/User'
import {Pix} from '../../entity/Pix'
import { decodeKey, encodeKey } from '../../utils/pix';
import AppError from '../../shared/error/AppError';

export default class PixService {

  async request(value: number, user: Partial<User>){
    const pixRepository = getRepository(Pix);

    const userRepository = getRepository(User);

    const currentUser = await userRepository.findOne({where: {id: user.id}})

    const requestData = {
      requestingUser: currentUser,
      value,
      status: 'open',
    }

    const register = await pixRepository.save(requestData);

    const key = encodeKey(user.id || '', value, register.id)

    return key;
  }


  async pay(key: string, user: Partial<User>) {
    const keyDecode = decodeKey(key);

    if (keyDecode.userId === user.id) {
      throw new AppError("Não e possivel receber a Pix do mesmo usuario", 401)
    }

    const pixRepository = getRepository(Pix);
    const userRepository = getRepository(User);

    const requestingUser = await userRepository.findOne({where: {id: keyDecode.userId}});
    const payingUser = await userRepository.findOne({where: {id: user.id}});

    if (payingUser?.wallet && payingUser.wallet < Number(keyDecode.value)){
      throw new AppError("Não há saldo suficiente para fazer o pagamento", 401)
    }

    if (!requestingUser || !payingUser) {
      throw new AppError("Não encontramos os clientes da Transação, gere uma nova chave", 401)
    }

    requestingUser.wallet = Number(requestingUser?.wallet) + Number(keyDecode.value);
    await userRepository.save(requestingUser)

    payingUser.wallet = Number(payingUser?.wallet) - Number(keyDecode.value);
    await userRepository.save(payingUser)

    const pixTransaction = await pixRepository.findOne({where: {id: keyDecode.registerId, status: 'open'}})

    if (!pixTransaction) {
      throw new AppError("Chave invalida para pagamento", 401)
    }

    pixTransaction.status = 'close';
    pixTransaction.payingUser = payingUser;

    await pixRepository.save(pixTransaction);

    return { msg: "pagamento realizado com sucesso."}
  }

  async transaction(user: Partial<User>) {
    const pixRepository = getRepository(Pix);

    const pixReceived = await (await pixRepository.find({where: {requestingUser: user.id, status: 'close'}, relations: ['payingUser']}));
    const pixPaying = await (await pixRepository.find({where: {payingUser: user.id, status: 'close'}, relations: ['requestingUser']}));

    const received = pixReceived.map(transaction => ({
      value: transaction.value,
      user: {
        firstName: transaction.payingUser.firstName,
        lastName: transaction.payingUser.lastName,
      },
      updateAt: transaction.updatedAt,
      type: 'received'
    }));

    const paying = pixPaying.map((transaction) => {

      console.log(transaction);
      return {
        value: transaction.value,
        user: {
          firstName: transaction.requestingUser.firstName,
          lastName: transaction.requestingUser.lastName,
        },
        updateAt: transaction.updatedAt,
        type: 'paid'
      }
  }
    );

    const allTransaction = received.concat(paying);

    allTransaction.sort(function (a, b){
      const dataA = new Date(a.updateAt).getTime();
      const dataB = new Date(b.updateAt).getTime();
      return dataA < dataB ? 1 : -1;
    })

    return allTransaction;
  }
}

