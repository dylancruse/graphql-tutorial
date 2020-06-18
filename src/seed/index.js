import models from '../models';

export const createUsersWithMessages = async date => {
  await models.User.create(
    {
      username: 'dcruse',
      email: 'dylan@email.com',
      password: 'dcruseeeeee',
      role: 'ADMIN',
      messages: [
        {
          text: 'Well hello there.',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
      ],
    },
    {
      include: [models.Message],
    }
  );

  await models.User.create(
    {
      username: 'klarberg',
      email: 'kate@email.com',
      password: 'klarberg',
      messages: [
        {
          text: 'Hello',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
        {
          text: 'ayyyyyooooo',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
      ],
    },
    {
      include: [models.Message],
    }
  );
};
