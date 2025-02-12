// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Auth } from '@aws-amplify/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  async getCurrentUser() {
    try {
      return await Auth.currentAuthenticatedUser();
    } catch (error) {
      return null; // No user logged in so return nothing
    }
  }

  async signUp(email: string, password: string) {
    try {
      await Auth.signUp({
        username: email,
        password,
        attributes: { email },
      });
    } catch (error) {
      // Check for specific error when user already exists
      if (error.code === 'UsernameExistsException') {
        throw new Error('This email is already registered. Please use a different email.');
      }
      throw error;
    }
  }

  async confirmSignUp(email: string, code: string) {
    try {
      await Auth.confirmSignUp(email, code);
    } catch (error) {
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    try {
      return await Auth.signIn(email, password);
    } catch (error) {
      throw error;
    }
  }

  async signOut() {
    try {
      await Auth.signOut();
    } catch (error) {
      throw error;
    }
  }
}
