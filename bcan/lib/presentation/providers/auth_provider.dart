import 'package:flutter/foundation.dart';

import '../../core/network/api_client.dart';
import '../../data/datasources/remote/auth_remote_data_source.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';

class AuthProvider extends ChangeNotifier {
  AuthProvider({AuthRepository? repository})
    : _repository = repository ??
          AuthRepositoryImpl(
            AuthRemoteDataSource(ApiClient()),
          ) {
    loadUser();
  }

  final AuthRepository _repository;

  User? _user;
  bool _loading = true;
  String? _error;

  User? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> loadUser() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      _user = await _repository.getCurrentUser();
    } catch (e) {
      _user = null;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> signup({
    required String email,
    required String password,
    required String fullName,
  }) async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      _user = await _repository.signup(
        email: email,
        password: password,
        fullName: fullName,
      );
      _error = null;
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      _user = await _repository.login(
        email: email,
        password: password,
      );
      _error = null;
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    _user = null;
    notifyListeners();
  }
}
