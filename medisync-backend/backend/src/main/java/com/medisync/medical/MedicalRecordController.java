package com.medisync.medical;

import com.medisync.medical.dto.CreateMedicalRecordRequest;
import com.medisync.medical.dto.MedicalRecordDto;
import com.medisync.appointment.Appointment;
import com.medisync.appointment.AppointmentRepository;
import com.medisync.user.User;
import com.medisync.user.UserRepository;
import com.medisync.user.UserSummary;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {
    private final MedicalRecordRepository records;
    private final UserRepository users;
    private final AppointmentRepository appointments;

    public MedicalRecordController(MedicalRecordRepository records, UserRepository users, AppointmentRepository appointments) {
        this.records = records;
        this.users = users;
        this.appointments = appointments;
    }

    @GetMapping("/doctor/patients")
    @PreAuthorize("hasRole('DOCTOR')")
    List<UserSummary> doctorPatients(Principal principal) {
        Map<Long, User> patients = new LinkedHashMap<>();
        appointments.findByDoctorUserEmailOrderByStartsAtDesc(principal.getName())
                .stream()
                .map(Appointment::getPatient)
                .forEach(patient -> patients.putIfAbsent(patient.getId(), patient));
        return patients.values().stream().map(UserSummary::from).toList();
    }

    @GetMapping("/doctor/patients/{patientId}")
    @PreAuthorize("hasRole('DOCTOR')")
    List<MedicalRecordDto> patientRecords(@org.springframework.web.bind.annotation.PathVariable Long patientId,
                                           Principal principal) {
        ensureDoctorCanAccessPatient(principal.getName(), patientId);
        User patient = users.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient introuvable."));
        return records.findByPatientEmailOrderByCreatedAtDesc(patient.getEmail())
                .stream()
                .map(MedicalRecordDto::from)
                .toList();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    List<MedicalRecordDto> myRecords(Principal principal) {
        return records.findByPatientEmailOrderByCreatedAtDesc(principal.getName())
                .stream()
                .map(MedicalRecordDto::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('DOCTOR')")
    MedicalRecordDto create(@Valid @RequestBody CreateMedicalRecordRequest request, Principal principal) {
        User doctor = users.findByEmail(principal.getName()).orElseThrow();
        User patient = users.findById(request.patientId()).orElseThrow();
        ensureDoctorCanAccessPatient(principal.getName(), patient.getId());

        MedicalRecord record = new MedicalRecord();
        record.setDoctor(doctor);
        record.setPatient(patient);
        record.setReport(request.report());
        record.setPrescription(request.prescription());
        return MedicalRecordDto.from(records.save(record));
    }

    private void ensureDoctorCanAccessPatient(String doctorEmail, Long patientId) {
        if (!appointments.existsByDoctorUserEmailAndPatientId(doctorEmail, patientId)) {
            throw new IllegalArgumentException("Patient non rattache a ce medecin.");
        }
    }
}
