import '../entities/image_classification.dart';
import '../repositories/screening_repository.dart';

class ClassifyImageUseCase {
  const ClassifyImageUseCase(this._repository);

  final ScreeningRepository _repository;

  Future<ImageClassification> call(Map<String, dynamic> payload) {
    return _repository.classifyImage(payload);
  }
}
