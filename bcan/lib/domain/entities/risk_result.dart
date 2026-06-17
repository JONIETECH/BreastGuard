class RiskResult {
  const RiskResult({required this.level, required this.score});

  final String level;
  final int score;

  factory RiskResult.fromJson(Map<String, dynamic> json) {
    return RiskResult(
      level: json['level'] as String? ?? 'Low',
      score: json['score'] as int? ?? 0,
    );
  }
}
