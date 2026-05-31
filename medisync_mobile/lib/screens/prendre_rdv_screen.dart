import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class PrendreRdvScreen extends StatefulWidget {
  const PrendreRdvScreen({super.key});

  @override
  State<PrendreRdvScreen> createState() => _PrendreRdvScreenState();
}

class _PrendreRdvScreenState extends State<PrendreRdvScreen> {
  int _selectedDayIndex = 0;
  String _selectedTime = '10:00';

  final List<Map<String, String>> _days = [
    {'day': 'LUN', 'num': '16'},
    {'day': 'MAR', 'num': '17'},
    {'day': 'MER', 'num': '18'},
    {'day': 'JEU', 'num': '19'},
    {'day': 'VEN', 'num': '20'},
  ];

  final List<String> _hours = [
    '09:00', '09:30', '10:00',
    '10:45', '11:15', '11:45',
    '14:00', '14:30', '15:00',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: Row(
          children: [
            const CircleAvatar(
              radius: 18,
              backgroundImage: NetworkImage('https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=100&q=80'),
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
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Search Bar
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.02),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: TextField(
                      decoration: InputDecoration(
                        hintText: 'Médecin, spécialité...',
                        hintStyle: GoogleFonts.inter(color: const Color(0xFF94A3B8)),
                        icon: const Icon(Icons.search_rounded, color: Color(0xFF94A3B8)),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  // Calendar Header Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'OCTOBRE 2023',
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF1E293B),
                          letterSpacing: 0.5,
                        ),
                      ),
                      GestureDetector(
                        onTap: () {},
                        child: Text(
                          'Voir tout',
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF0066FF),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Calendar Days Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: List.generate(_days.length, (index) {
                      final isSelected = _selectedDayIndex == index;
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedDayIndex = index;
                          });
                        },
                        child: Container(
                          width: 60,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: isSelected ? Colors.transparent : Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected ? const Color(0xFF0066FF) : Colors.transparent,
                              width: 2,
                            ),
                            boxShadow: isSelected
                                ? []
                                : [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.01),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                          ),
                          child: Column(
                            children: [
                              Text(
                                _days[index]['day']!,
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: isSelected ? const Color(0xFF0066FF) : const Color(0xFF94A3B8),
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                _days[index]['num']!,
                                style: GoogleFonts.inter(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected ? const Color(0xFF0066FF) : const Color(0xFF1E293B),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 24),
                  // Doctor card
                  Container(
                    padding: const EdgeInsets.all(16.0),
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
                    child: Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Image.network(
                            'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=150&q=80',
                            height: 72,
                            width: 72,
                            fit: BoxFit.cover,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Dr. Sarah Lemoine',
                                style: GoogleFonts.inter(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFF1E293B),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Cardiologue • 12 ans d\'exp.',
                                style: GoogleFonts.inter(
                                  fontSize: 13,
                                  color: const Color(0xFF64748B),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  const Icon(Icons.star_rounded, color: Color(0xFFFFB000), size: 18),
                                  const SizedBox(width: 4),
                                  Text(
                                    '4.9',
                                    style: GoogleFonts.inter(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                      color: const Color(0xFF1E293B),
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    '(120 avis)',
                                    style: GoogleFonts.inter(
                                      fontSize: 13,
                                      color: const Color(0xFF94A3B8),
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  // Horaires disponibles title
                  Text(
                    'HORAIRES DISPONIBLES',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF475569),
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Grid of hours
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 2.2,
                    ),
                    itemCount: _hours.length,
                    itemBuilder: (context, index) {
                      final time = _hours[index];
                      final isSelected = _selectedTime == time;
                      final isDisabled = time == '11:45';

                      return GestureDetector(
                        onTap: isDisabled
                            ? null
                            : () {
                                setState(() {
                                  _selectedTime = time;
                                });
                              },
                        child: Container(
                          decoration: BoxDecoration(
                            color: isDisabled
                                ? const Color(0xFFF1F5F9)
                                : isSelected
                                    ? const Color(0xFFD1FAE5)
                                    : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isDisabled
                                  ? Colors.transparent
                                  : isSelected
                                      ? const Color(0xFF10B981)
                                      : const Color(0xFFE2E8F0),
                              width: 1.5,
                            ),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            time,
                            style: GoogleFonts.inter(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: isDisabled
                                  ? const Color(0xFF94A3B8)
                                  : isSelected
                                      ? const Color(0xFF065F46)
                                      : const Color(0xFF10B981),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 24),
                  // Consult details info box
                  Container(
                    padding: const EdgeInsets.all(16.0),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFBFDBFE)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline_rounded, color: Color(0xFF3B82F6), size: 22),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Détails de la consultation\nLundi 16 Octobre à $_selectedTime • Consultation vidéo',
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
          ),
          // Bottom button
          Container(
            padding: const EdgeInsets.all(16.0),
            color: Colors.white,
            child: SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Rendez-vous confirmé avec succès !'),
                      backgroundColor: Colors.green,
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0066FF),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Confirmer le rendez-vous',
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white, size: 16),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
