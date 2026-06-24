import '../../../core/constants/api_routes.dart';
import '../../../core/network/api_client.dart';

class AuthRemoteDataSource {
  const AuthRemoteDataSource(this._apiClient);

  final ApiClient _apiClient;

  Future<Map<String, dynamic>> signup({
    required String email,
    required String password,
    required String fullName,
  }) {
    return _apiClient.postJson(ApiRoutes.signup, {
      'email': email,
      'password': password,
      'fullName': fullName,
    });
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) {
    return _apiClient.postJson(ApiRoutes.login, {
      'email': email,
      'password': password,
    });
  }

  Future<Map<String, dynamic>> getCurrentUser() {
    return _apiClient.getJson(ApiRoutes.me);
  }

  Future<Map<String, dynamic>> logout() {
    return _apiClient.postJson(ApiRoutes.logout, {});
  }
}
