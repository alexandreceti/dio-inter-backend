import { getRepository } from "typeorm"

import md5 from 'crypto-js/md5'
import { User } from '../../entity/User'

import AppError from "../../shared/error/AppError"

import {sign}  from 'jsonwebtoken'
import authConfig from '../../config/auth'

import {UserSignin} from "./dtos/user.signin.dtos"
import {UserSignUp} from "./dtos/user.signup.dtos"
import { response } from "express"


export default class UserService {

  async signin(user: UserSignin){
    const userRepository = getRepository(User);

    const {email, password} = user;
    const passwordHash = md5(password).toString();

    const existUser = await userRepository.findOne({where: {email, password: passwordHash}})

    if (!existUser){
      throw new AppError("Usuario não encontrado", 401);
    }

    const {secret, expiresIn } = authConfig.jwt

    const playload = {
      firstName: existUser.firstName,
      lastName: existUser.lastName,
      accountNumber: existUser.accountNumber,
      accountDigit: existUser.accountDigit,
      wallet: existUser.wallet,
    };
    const jwtOptions = { subject: existUser.id,
      expiresIn
    }
    const token = await sign(playload, secret, jwtOptions );

    return { accesstoken: token}
  }

  async signup(user: UserSignUp){
    const userRepository = getRepository(User);

    const existUser = await userRepository.findOne({where: {email: user.email}})

    if (existUser){
      throw new AppError("Já existe um usuario cadastrado com esse email", 401);
    }

    const userData = {
      ...user,
      password: md5(user.password).toString(),
      wallet: 5000,
      accountNumber: Math.floor(Math.random() * 999999),
      accountDigit: Math.floor(Math.random() * 99),
    }
    console.log(userData)
    const userCreate = await userRepository.save(userData);

    const {secret, expiresIn } = authConfig.jwt

    const playload = {
      firstName: userCreate.firstName,
      lastName: userCreate.lastName,
      accountNumber: userCreate.accountNumber,
      accountDigit: userCreate.accountDigit,
      wallet: userCreate.wallet,
    };

    const jwtOption = {
      subject: userCreate.id,
      expiresIn
    }

    const token = sign(playload, secret, jwtOption);

    return { accesstoken: token};
  }

  async me(user:Partial<User>) {
    const userRepository = getRepository(User);
    const currentUser = await userRepository.findOne({where: {id: user.id}});

    if (!currentUser) {
      throw new AppError('Usuario não encontrado', 401);
    }

    //@ts-expect-error ignore
    delete currentUser.password

    return currentUser;

  }
}