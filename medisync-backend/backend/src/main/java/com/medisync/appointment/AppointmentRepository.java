package com.medisync.appointment;

import java.util.List;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientEmailOrderByStartsAtDesc(String email);

    List<Appointment> findByDoctorUserEmailOrderByStartsAtDesc(String email);

    List<Appointment> findByDoctorIdAndStartsAtBetweenAndStatusNot(
            Long doctorId,
            LocalDateTime start,
            LocalDateTime end,
            AppointmentStatus status
    );

    boolean existsByDoctorUserEmailAndPatientId(String doctorEmail, Long patientId);

    boolean existsByDoctorIdAndStartsAtAndStatusNot(Long doctorId, LocalDateTime startsAt, AppointmentStatus status);

    boolean existsByDoctorIdAndStartsAtAndStatusNotAndIdNot(
            Long doctorId,
            LocalDateTime startsAt,
            AppointmentStatus status,
            Long id
    );
}
