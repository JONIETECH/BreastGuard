import '../../domain/entities/chat_reply.dart';
import '../../domain/entities/history_entry.dart';
import '../../domain/entities/image_classification.dart';
import '../../domain/entities/risk_result.dart';
import '../../domain/repositories/screening_repository.dart';
import '../datasources/remote/screening_remote_data_source.dart';

class ScreeningRepositoryImpl implements ScreeningRepository {
  const ScreeningRepositoryImpl(this._remoteDataSource);

  final ScreeningRemoteDataSource _remoteDataSource;

  @override
  Future<RiskResult> predictRisk(Map<String, dynamic> factors) async {
    final result = await _remoteDataSource.predictRisk(factors);
    return RiskResult.fromJson(result);
  }

  @override
  Future<ImageClassification> classifyImage(
    Map<String, dynamic> payload,
  ) async {
    final result = await _remoteDataSource.classifyImage(payload);
    return ImageClassification.fromJson(result);
  }

  @override
  Future<ChatReply> sendChatMessage(String message) async {
    final result = await _remoteDataSource.sendChatMessage(message);
    return ChatReply.fromJson(result);
  }

  @override
  Future<List<HistoryEntry>> getHistory() async {
    final result = await _remoteDataSource.getHistory();
    return result
        .whereType<Map<String, dynamic>>()
        .map(HistoryEntry.fromJson)
        .toList(growable: false);
  }
}
