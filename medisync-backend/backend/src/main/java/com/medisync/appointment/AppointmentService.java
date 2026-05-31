package com.medisync.appointment;

import com.medisync.appointment.dto.AppointmentDto;
import com.medisync.appointment.dto.CreateAppointmentRequest;
import com.medisync.doctor.DoctorRepository;
import com.medisync.user.User;
import com.medisync.user.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class AppointmentService {
    private static final List<LocalTime> WORKING_SLOTS = List.of(
            LocalTime.of(9, 0),
            LocalTime.of(9, 30),
            LocalTime.of(10, 0),
            LocalTime.of(10, 30),
            LocalTime.of(11, 0),
            LocalTime.of(14, 0),
            LocalTime.of(14, 30),
            LocalTime.of(15, 0),
            LocalTime.of(15, 30),
            LocalTime.of(16, 0)
    );

    private final AppointmentRepository appointments;
    private final DoctorRepository doctors;
    private final UserRepository users;

    public AppointmentService(AppointmentRepository appointments, DoctorRepository doctors, UserRepository users) {
        this.appointments = appointments;
        this.doctors = doctors;
        this.users = users;
    }

    public AppointmentDto create(String patientEmail, CreateAppointmentRequest request) {
        return createForPatient(users.findByEmail(patientEmail).orElseThrow(), request);
    }

    public AppointmentDto createForSecretary(String patientEmail, CreateAppointmentRequest request) {
        User patient = users.findByEmail(patientEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Patient introuvable."));
        return createForPatient(patient, request);
    }

    private AppointmentDto createForPatient(User patient, CreateAppointmentRequest request) {
        validateFutureSlot(request.startsAt());
        if (appointments.existsByDoctorIdAndStartsAtAndStatusNot(
                request.doctorId(), request.startsAt(), AppointmentStatus.CANCELLED)) {
            throw new IllegalArgumentException("Ce creneau est deja reserve.");
        }
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctors.findById(request.doctorId()).orElseThrow());
        appointment.setStartsAt(request.startsAt());
        appointment.setDurationMinutes(request.durationMinutes());
        appointment.setReason(request.reason());
        appointment.setBookedForName(request.bookedForName() == null || request.bookedForName().isBlank()
                ? patient.getFullName()
                : request.bookedForName().trim());
        appointment.setStatus(AppointmentStatus.REQUESTED);
        return AppointmentDto.from(appointments.save(appointment));
    }

    public AppointmentDto updateStatus(Long id, AppointmentStatus status, String doctorEmail) {
        Appointment appointment = appointments.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        if (!appointment.getDoctor().getUser().getEmail().equals(doctorEmail)) {
            throw new IllegalStateException("Not your appointment");
        }
        appointment.setStatus(status);
        return AppointmentDto.from(appointments.save(appointment));
    }

    public AppointmentDto updateStatusBySecretary(Long id, AppointmentStatus status) {
        Appointment appointment = appointments.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        appointment.setStatus(status);
        return AppointmentDto.from(appointments.save(appointment));
    }

    public AppointmentDto updateByPatient(Long id, String patientEmail, CreateAppointmentRequest request) {
        Appointment appointment = appointments.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        if (!appointment.getPatient().getEmail().equals(patientEmail)) {
            throw new IllegalStateException("Not your appointment");
        }
        if (appointment.getStatus() != AppointmentStatus.REQUESTED) {
            throw new IllegalArgumentException("Le rendez-vous ne peut etre modifie qu'avant confirmation.");
        }
        if (appointments.existsByDoctorIdAndStartsAtAndStatusNotAndIdNot(
                request.doctorId(), request.startsAt(), AppointmentStatus.CANCELLED, id)) {
            throw new IllegalArgumentException("Ce creneau est deja reserve.");
        }
        appointment.setDoctor(doctors.findById(request.doctorId()).orElseThrow());
        appointment.setStartsAt(request.startsAt());
        appointment.setDurationMinutes(request.durationMinutes());
        appointment.setReason(request.reason());
        appointment.setBookedForName(request.bookedForName() == null || request.bookedForName().isBlank()
                ? appointment.getPatient().getFullName()
                : request.bookedForName().trim());
        return AppointmentDto.from(appointments.save(appointment));
    }

    public AppointmentDto updateBySecretary(Long id, CreateAppointmentRequest request) {
        Appointment appointment = appointments.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        if (appointments.existsByDoctorIdAndStartsAtAndStatusNotAndIdNot(
                request.doctorId(), request.startsAt(), AppointmentStatus.CANCELLED, id)) {
            throw new IllegalArgumentException("Ce creneau est deja reserve.");
        }
        appointment.setDoctor(doctors.findById(request.doctorId()).orElseThrow());
        appointment.setStartsAt(request.startsAt());
        appointment.setDurationMinutes(request.durationMinutes());
        appointment.setReason(request.reason());
        appointment.setBookedForName(request.bookedForName() == null || request.bookedForName().isBlank()
                ? appointment.getPatient().getFullName()
                : request.bookedForName().trim());
        return AppointmentDto.from(appointments.save(appointment));
    }

    public List<AppointmentDto> forPatient(String email) {
        return appointments.findByPatientEmailOrderByStartsAtDesc(email).stream().map(AppointmentDto::from).toList();
    }

    public List<AppointmentDto> forDoctor(String email) {
        return appointments.findByDoctorUserEmailOrderByStartsAtDesc(email).stream().map(AppointmentDto::from).toList();
    }

    public List<AppointmentDto> forSecretary() {
        return appointments.findAll(Sort.by(Sort.Direction.DESC, "startsAt")).stream()
                .map(AppointmentDto::from)
                .toList();
    }

    public List<String> availableSlots(Long doctorId, LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();
        Set<LocalDateTime> reserved = appointments
                .findByDoctorIdAndStartsAtBetweenAndStatusNot(doctorId, start, end, AppointmentStatus.CANCELLED)
                .stream()
                .map(Appointment::getStartsAt)
                .collect(java.util.stream.Collectors.toSet());
        LocalDateTime now = LocalDateTime.now();
        return WORKING_SLOTS.stream()
                .map(date::atTime)
                .filter(slot -> slot.isAfter(now))
                .filter(slot -> !reserved.contains(slot))
                .map(LocalDateTime::toString)
                .toList();
    }

    private void validateFutureSlot(LocalDateTime startsAt) {
        if (!startsAt.isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Le creneau choisi est deja passe.");
        }
    }
}
