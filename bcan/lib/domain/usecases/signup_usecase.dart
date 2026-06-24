import '../entities/user.dart';
import '../repositories/auth_repository.dart';

class SignupUseCase {
  const SignupUseCase(this._repository);

  final AuthRepository _repository;

  Future<User> call({
    required String email,
    required String password,
    required String fullName,
  }) {
    return _repository.signup(
      email: email,
      password: password,
      fullName: fullName,
    );
  }
}
