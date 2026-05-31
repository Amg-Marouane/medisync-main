package com.medisync.appointment;

import com.medisync.appointment.dto.AppointmentDto;
import com.medisync.appointment.dto.CreateAppointmentRequest;
import jakarta.validation.Valid;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('PATIENT') or hasRole('SECRETARY')")
    AppointmentDto create(@Valid @RequestBody CreateAppointmentRequest request, Principal principal) {
        return appointmentService.create(principal.getName(), request);
    }

    @PostMapping("/secretary")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SECRETARY')")
    AppointmentDto createForSecretary(@Valid @RequestBody CreateAppointmentRequest request) {
        if (request.patientEmail() == null || request.patientEmail().isBlank()) {
            throw new IllegalArgumentException("Patient requis.");
        }
        return appointmentService.createForSecretary(request.patientEmail(), request);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    List<AppointmentDto> myAppointments(Principal principal) {
        return appointmentService.forPatient(principal.getName());
    }

    @GetMapping("/doctor/me")
    @PreAuthorize("hasRole('DOCTOR')")
    List<AppointmentDto> doctorPlanning(Principal principal) {
        return appointmentService.forDoctor(principal.getName());
    }

    @GetMapping("/secretary")
    @PreAuthorize("hasRole('SECRETARY')")
    List<AppointmentDto> secretaryPlanning() {
        return appointmentService.forSecretary();
    }

    @GetMapping("/availability")
    @PreAuthorize("hasRole('PATIENT') or hasRole('SECRETARY')")
    List<String> availability(
            @RequestParam Long doctorId,
            @RequestParam LocalDate date
    ) {
        return appointmentService.availableSlots(doctorId, date);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('SECRETARY')")
    AppointmentDto updateStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status,
            Principal principal,
            Authentication authentication
    ) {
        boolean secretary = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_SECRETARY"));
        return secretary
                ? appointmentService.updateStatusBySecretary(id, status)
                : appointmentService.updateStatus(id, status, principal.getName());
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('SECRETARY')")
    AppointmentDto updateBeforeConfirmation(
            @PathVariable Long id,
            @Valid @RequestBody CreateAppointmentRequest request,
            Principal principal,
            Authentication authentication
    ) {
        boolean secretary = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_SECRETARY"));
        return secretary
                ? appointmentService.updateBySecretary(id, request)
                : appointmentService.updateByPatient(id, principal.getName(), request);
    }
}
