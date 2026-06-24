import '../entities/user.dart';

abstract class AuthRepository {
  const AuthRepository();

  Future<User> signup({
    required String email,
    required String password,
    required String fullName,
  });

  Future<User> login({
    required String email,
    required String password,
  });

  Future<User?> getCurrentUser();

  Future<void> logout();
}
