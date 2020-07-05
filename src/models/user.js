/* eslint-disable no-return-await */
import bcrypt from 'bcrypt';

const user = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [8, 42],
      },
    },
    role: {
      type: DataTypes.STRING,
    },
  });

  // User Associations
  User.associate = models => {
    User.hasMany(models.Message, { onDelete: 'CASCADE' });
  };

  // Find a user by their username
  User.findByUsername = async username => {
    let currentUser = await User.findOne({
      where: { username },
    });

    if (!currentUser) {
      currentUser = await User.findOne({
        where: { email: username },
      });
    }

    return currentUser;
  };

  User.beforeCreate(async currentUser => {
    currentUser.password = await currentUser.generatePasswordHash();
  });

  User.prototype.generatePasswordHash = async function() {
    const saltRounds = 10;
    return await bcrypt.hash(this.password, saltRounds);
  };

  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
};

export default user;
