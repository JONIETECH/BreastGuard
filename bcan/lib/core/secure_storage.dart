import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const _storage = FlutterSecureStorage();
const _tokenKey = 'auth_token';

class AuthStorage {
  const AuthStorage._();

  static Future<String?> readToken() => _storage.read(key: _tokenKey);

  static Future<void> writeToken(String token) =>
      _storage.write(key: _tokenKey, value: token);

  static Future<void> deleteToken() => _storage.delete(key: _tokenKey);
}
