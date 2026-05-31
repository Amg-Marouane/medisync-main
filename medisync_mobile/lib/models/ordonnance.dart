class Ordonnance {
  final String title;
  final String category;
  final String dosage;
  final String doctorName;
  final String status; // 'EN COURS' or 'TERMINÉ'
  final bool isEnCours;

  Ordonnance({
    required this.title,
    required this.category,
    required this.dosage,
    required this.doctorName,
    required this.status,
    required this.isEnCours,
  });
}
