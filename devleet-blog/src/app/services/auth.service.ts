import { Injectable } from '@angular/core';
import { Auth } from '@aws-amplify/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  // Checks if a user is logged in and returns its details
  async getCurrentUser() {
    try {
      return await Auth.currentAuthenticatedUser();
    } catch (error) {
      return null; // No user logged in
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

  // after email verification
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

  // check if user is logged in with simple true or false
  async isAuthenticated(): Promise<boolean> {
    try {
      await Auth.currentAuthenticatedUser();
      return true;
    } catch {
      return false;
    }
  }

  // this ensures token is always fresh
  async getAccessToken(): Promise<string> {
    try {
      const session = await Auth.currentSession(); // Retrieves the latest session
      return session.getIdToken().getJwtToken();  // Returns fresh JWT token
    } catch (error) {
      console.error('Error fetching access token:', error);
      throw error;
    }
  }
}
