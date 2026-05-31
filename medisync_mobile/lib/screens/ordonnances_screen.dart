import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/ordonnance.dart';

class OrdonnancesScreen extends StatefulWidget {
  const OrdonnancesScreen({super.key});

  @override
  State<OrdonnancesScreen> createState() => _OrdonnancesScreenState();
}

class _OrdonnancesScreenState extends State<OrdonnancesScreen> {
  String _selectedFilter = 'Toutes';

  final List<Ordonnance> _allOrdonnances = [
    Ordonnance(
      title: 'Desloratadine 5mg',
      category: 'ANTIHISTAMINIQUE',
      dosage: '1 comprimé / jour',
      doctorName: 'Dr. Marc Lefebvre',
      status: 'EN COURS',
      isEnCours: true,
    ),
    Ordonnance(
      title: 'Paracétamol 1000mg',
      category: 'ANTALGIQUE',
      dosage: 'Si besoin (max 4/j)',
      doctorName: 'Dr. Sarah Cohen',
      status: 'TERMINÉ',
      isEnCours: false,
    ),
    Ordonnance(
      title: 'Ventoline 100µg',
      category: 'INHALATEUR',
      dosage: '2 bouffées / crise',
      doctorName: 'Dr. Marc Lefebvre',
      status: 'EN COURS',
      isEnCours: true,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    List<Ordonnance> filteredList = _allOrdonnances;
    if (_selectedFilter == 'Actives') {
      filteredList = _allOrdonnances.where((o) => o.isEnCours).toList();
    } else if (_selectedFilter == 'Archives') {
      filteredList = _allOrdonnances.where((o) => !o.isEnCours).toList();
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: Row(
          children: [
            const CircleAvatar(
              radius: 18,
              backgroundImage: NetworkImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'),
            ),
            const SizedBox(width: 12),
            Text(
              'MediSync',
              style: GoogleFonts.outfit(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF0066FF),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_rounded, color: Color(0xFF0066FF), size: 26),
            onPressed: () {},
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Vos Ordonnances',
              style: GoogleFonts.inter(
                fontSize: 26,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 16),
            // Horizontal pills
            Row(
              children: [
                _buildFilterPill('Toutes'),
                const SizedBox(width: 8),
                _buildFilterPill('Actives'),
                const SizedBox(width: 8),
                _buildFilterPill('Archives'),
              ],
            ),
            const SizedBox(height: 20),
            // Prescription list
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: filteredList.length,
              itemBuilder: (context, index) {
                final ordonnance = filteredList[index];
                return _buildOrdonnanceCard(ordonnance);
              },
            ),
            const SizedBox(height: 16),
            // Blue info banner
            Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFBFDBFE)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.info_outline_rounded, color: Color(0xFF3B82F6), size: 22),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Toutes vos ordonnances sont certifiées et directement transmissibles à votre pharmacie via le QR code intégré au PDF.',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: const Color(0xFF1E3A8A),
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterPill(String title) {
    final isActive = _selectedFilter == title;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedFilter = title;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF0066FF) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(24),
        ),
        child: Text(
          title,
          style: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: isActive ? Colors.white : const Color(0xFF475569),
          ),
        ),
      ),
    );
  }

  Widget _buildOrdonnanceCard(Ordonnance ordonnance) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16.0),
      padding: const EdgeInsets.all(20.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top row (Category + Status badge)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                ordonnance.category,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF64748B),
                  letterSpacing: 0.5,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: ordonnance.isEnCours ? const Color(0xFFDCFCE7) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  ordonnance.status,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: ordonnance.isEnCours ? const Color(0xFF166534) : const Color(0xFF475569),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Title
          Text(
            ordonnance.title,
            style: GoogleFonts.inter(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF0056E2),
            ),
          ),
          const SizedBox(height: 16),
          // Columns (Posologie & Médecin)
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Posologie',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: const Color(0xFF94A3B8),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      ordonnance.dosage,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        color: const Color(0xFF1E293B),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Médecin',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: const Color(0xFF94A3B8),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      ordonnance.doctorName,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        color: const Color(0xFF1E293B),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          // Download button
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ordonnance.isEnCours
                ? ElevatedButton.icon(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0066FF),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    icon: const Icon(Icons.picture_as_pdf_outlined, color: Colors.white, size: 20),
                    label: Text(
                      'Télécharger PDF',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  )
                : OutlinedButton.icon(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFF0066FF)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      backgroundColor: Colors.transparent,
                    ),
                    icon: const Icon(Icons.download_rounded, color: Color(0xFF0066FF), size: 20),
                    label: Text(
                      'Télécharger PDF',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF0066FF),
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
