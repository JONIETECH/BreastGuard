import '../../../core/constants/api_routes.dart';
import '../../../core/network/api_client.dart';

class ScreeningRemoteDataSource {
  const ScreeningRemoteDataSource(this._apiClient);

  final ApiClient _apiClient;

  Future<Map<String, dynamic>> predictRisk(Map<String, dynamic> factors) {
    return _apiClient.postJson(ApiRoutes.predictRisk, factors);
  }

  Future<Map<String, dynamic>> classifyImage(Map<String, dynamic> payload) {
    return _apiClient.postJson(ApiRoutes.classifyImage, payload);
  }

  Future<Map<String, dynamic>> sendChatMessage(String message) {
    return _apiClient.postJson(ApiRoutes.sendChatMessage, {'message': message});
  }

  Future<List<dynamic>> getHistory() {
    return _apiClient.getJsonList(ApiRoutes.history);
  }
}
