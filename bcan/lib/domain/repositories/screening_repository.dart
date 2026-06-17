import '../entities/chat_reply.dart';
import '../entities/history_entry.dart';
import '../entities/image_classification.dart';
import '../entities/risk_result.dart';

abstract class ScreeningRepository {
  Future<RiskResult> predictRisk(Map<String, dynamic> factors);
  Future<ImageClassification> classifyImage(Map<String, dynamic> payload);
  Future<ChatReply> sendChatMessage(String message);
  Future<List<HistoryEntry>> getHistory();
}
