const user = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      unique: true,
    },
  });

  User.associate = models => {
    User.hasMany(models.Message, { onDelete: 'CASCADE' });
  };

  User.findByLogin = async login => {
    let currentUser = await User.findOne({
      where: { username: login },
    });

    if (!currentUser) {
      currentUser = await User.findOne({
        where: { email: login },
      });
    }

    return currentUser;
  };

  return User;
};

export default user;
