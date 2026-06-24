import '../../core/secure_storage.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/remote/auth_remote_data_source.dart';

class AuthRepositoryImpl implements AuthRepository {
  const AuthRepositoryImpl(this._remoteDataSource);

  final AuthRemoteDataSource _remoteDataSource;

  @override
  Future<User> signup({
    required String email,
    required String password,
    required String fullName,
  }) async {
    final result = await _remoteDataSource.signup(
      email: email,
      password: password,
      fullName: fullName,
    );
    final user = User.fromJson(result['user'] as Map<String, dynamic>);
    final token = result['token'] as String?;
    if (token != null && token.isNotEmpty) {
      await AuthStorage.writeToken(token);
    }
    return user;
  }

  @override
  Future<User> login({
    required String email,
    required String password,
  }) async {
    final result = await _remoteDataSource.login(
      email: email,
      password: password,
    );
    final user = User.fromJson(result['user'] as Map<String, dynamic>);
    final token = result['token'] as String?;
    if (token != null && token.isNotEmpty) {
      await AuthStorage.writeToken(token);
    }
    return user;
  }

  @override
  Future<User?> getCurrentUser() async {
    final token = await AuthStorage.readToken();
    if (token == null || token.isEmpty) return null;

    try {
      final result = await _remoteDataSource.getCurrentUser();
      final userJson = result['user'];
      if (userJson is Map<String, dynamic>) {
        return User.fromJson(userJson);
      }
      return null;
    } catch (_) {
      await AuthStorage.deleteToken();
      return null;
    }
  }

  @override
  Future<void> logout() async {
    try {
      await _remoteDataSource.logout();
    } catch (_) {
      // ignore network errors during logout
    }
    await AuthStorage.deleteToken();
  }
}
