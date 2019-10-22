import { expect } from 'chai';
import * as userApi from './api';

describe('users', () => {
  describe('user(id: String!): User', () => {
    it('returns a user when user can be found', async () => {
      const expectedResult = {
        data: {
          user: {
            id: '1',
            username: 'dcruse',
            email: 'dylan@email.com',
            role: 'ADMIN',
          },
        },
      };

      const result = await userApi.user({ id: '1' });

      expect(result.data).to.eql(expectedResult);
    });

    it('returns null when user cannot be found', async () => {
      const expectedResult = {
        data: {
          user: null,
        },
      };

      const result = await userApi.user({ id: '9999999' });

      expect(result.data).to.eql(expectedResult);
    });
  });
  describe('deleteUser(id: String!): Boolean!', () => {
    it('returns an error - only admins can delete users', async () => {
      const {
        data: {
          data: {
            signIn: { token },
          },
        },
      } = await userApi.signIn({
        login: 'klarberg',
        password: 'klarberg',
      });

      const {
        data: { errors },
      } = await userApi.deleteUser({ id: '1' }, token);

      expect(errors[0].message).to.eql('User not authorized as admin.');
    });
  });
});
