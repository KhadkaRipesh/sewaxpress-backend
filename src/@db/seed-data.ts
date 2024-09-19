import { AuthType, User, UserRole } from 'src/users/entities/user.entity';
import { DataSource } from 'typeorm';
import * as argon from 'argon2';

export async function seedData(dataSource: DataSource) {
  try {
    const userRepository = dataSource.getRepository(User);

    console.log(userRepository);

    const usersToSeed: Partial<User>[] = [
      {
        role: UserRole.ADMIN,
        full_name: 'Admin Khadka',
        email: 'admin@admin.coom',
        is_verified: true,
        auth_type: AuthType.EMAIL,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: new Date(),
      },
    ];
    usersToSeed[0].password = await argon.hash('Admin@123');

    await userRepository.save(usersToSeed);
  } catch (error) {
    console.log(error);
  }
}
