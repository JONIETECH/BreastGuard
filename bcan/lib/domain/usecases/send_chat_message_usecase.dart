import '../entities/chat_reply.dart';
import '../repositories/screening_repository.dart';

class SendChatMessageUseCase {
  const SendChatMessageUseCase(this._repository);

  final ScreeningRepository _repository;

  Future<ChatReply> call(String message) {
    return _repository.sendChatMessage(message);
  }
}
