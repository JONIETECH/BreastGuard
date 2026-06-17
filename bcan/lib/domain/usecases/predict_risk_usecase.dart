import '../entities/risk_result.dart';
import '../repositories/screening_repository.dart';

class PredictRiskUseCase {
  const PredictRiskUseCase(this._repository);

  final ScreeningRepository _repository;

  Future<RiskResult> call(Map<String, dynamic> factors) {
    return _repository.predictRisk(factors);
  }
}
