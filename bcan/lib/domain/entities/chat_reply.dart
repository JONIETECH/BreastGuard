class ChatReply {
  const ChatReply({required this.message});

  final String message;

  factory ChatReply.fromJson(Map<String, dynamic> json) {
    return ChatReply(message: json['message'] as String? ?? '');
  }
}
