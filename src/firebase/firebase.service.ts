import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import { FIREBASE_SERVICE_ACCOUNT } from 'src/@config/constants.config';
import { DataSource, In } from 'typeorm';
import { FirebaseToken } from './entities/firebase-token.entity';
import { CreateFirebaseNotificationTokenDto } from './dto/firebase.dto';
import { Printer } from 'src/@helpers/printer';

@Injectable()
export class FirebaseService {
  constructor(private readonly dataSource: DataSource) {
    const firebaseConfig: firebase.ServiceAccount = {
      projectId: FIREBASE_SERVICE_ACCOUNT.project_id,
      clientEmail: FIREBASE_SERVICE_ACCOUNT.client_email,
      privateKey: FIREBASE_SERVICE_ACCOUNT.private_key,
    };
    //check if firebase is already initialized if not then initialize it
    if (!firebase.apps.length) {
      firebase.initializeApp({
        credential: firebase.credential.cert(firebaseConfig),
      });
    }
  }
  // Save new token
  async createToken(
    user_id: string,
    payload: CreateFirebaseNotificationTokenDto,
  ) {
    const existingToken = await this.dataSource.manager.findOne(FirebaseToken, {
      where: {
        user_id,
        notification_token: payload.notification_token,
      },
    });

    if (existingToken) {
      return { message: 'Token already exists for this user.' };
    }

    await this.dataSource.manager.save(FirebaseToken, {
      user_id,
      device_type: payload.device_type,
      notification_token: payload.notification_token,
    });
    return { message: 'Token initialized.' };
  }
  // Update token
  async updateToken(
    user_id: string,
    token_id: string,
    payload: CreateFirebaseNotificationTokenDto,
  ) {
    await this.dataSource.manager.update(
      FirebaseToken,
      { id: token_id, user_id },
      payload,
    );
    return { message: 'Token updated.' };
  }
  // Delete token
  async deleteToken(user_id: string, token_id: string) {
    await this.dataSource.manager.update(
      FirebaseToken,
      { id: token_id, user_id },
      { is_active: false },
    );
    return { message: 'Token deleted.' };
  }

  //   Send push notification
  async sendPushNotifications(
    user_ids: string[],
    payload: { title: string; body: string },
  ) {
    const tokens = await this.dataSource.manager.find(FirebaseToken, {
      where: { user_id: In(user_ids), is_active: true },
    });
    console.log('Tokens', tokens);
    for (const token of tokens) {
      await firebase
        .messaging()
        .send({
          token: token.notification_token,
          notification: {
            title: payload.title,
            body: payload.body,
          },
        })
        .then((res) => console.log(res))
        .catch((error) => {
          Printer('FIREBASE NOTIFICATION ERROR: ', error);
        });
    }
    return { message: 'Push notification sent.' };
  }
}
