import '../entities/history_entry.dart';
import '../repositories/screening_repository.dart';

class GetHistoryUseCase {
  const GetHistoryUseCase(this._repository);

  final ScreeningRepository _repository;

  Future<List<HistoryEntry>> call() {
    return _repository.getHistory();
  }
}
