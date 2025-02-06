import { Injectable } from '@angular/core';
import { Auth } from 'aws-amplify';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  async signUp(email: string, password: string) {
    return Auth.signUp({ username: email, password, attributes: { email } });
  }

  async confirmSignUp(email: string, code: string) {
    return Auth.confirmSignUp(email, code);
  }

  async signIn(email: string, password: string) {
    return Auth.signIn(email, password);
  }

  async signOut() {
    return Auth.signOut();
  }
}
