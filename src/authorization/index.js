import { AuthenticationError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';

// Returns decoded token data from the req or an error
export const getUser = async req => {
  const token = req.headers['x-token'];

  if (token) {
    try {
      // Attempts to decode the token, throws an error if invalid
      return await jwt.verify(token, process.env.SECRET);
    } catch (e) {
      throw new AuthenticationError('Session expired. Please sign in again.');
    }
  }
};
