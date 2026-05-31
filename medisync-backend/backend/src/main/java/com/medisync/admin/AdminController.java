package com.medisync.admin;

import com.medisync.appointment.AppointmentRepository;
import com.medisync.audit.AuditService;
import com.medisync.doctor.DoctorProfile;
import com.medisync.doctor.DoctorRepository;
import com.medisync.user.Role;
import com.medisync.user.User;
import com.medisync.user.UserRepository;
import com.medisync.user.UserSummary;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserRepository users;
    private final DoctorRepository doctors;
    private final AppointmentRepository appointments;
    private final PasswordEncoder passwordEncoder;
    private final AuditService audit;

    public AdminController(UserRepository users, DoctorRepository doctors,
                           AppointmentRepository appointments,
                           PasswordEncoder passwordEncoder, AuditService audit) {
        this.users = users;
        this.doctors = doctors;
        this.appointments = appointments;
        this.passwordEncoder = passwordEncoder;
        this.audit = audit;
    }

    @GetMapping("/dashboard")
    DashboardStats dashboard() {
        return new DashboardStats(users.count(), doctors.count(), appointments.count());
    }

    @GetMapping("/users")
    List<UserSummary> getUsers() {
        return users.findAll().stream().map(UserSummary::from).toList();
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    UserSummary createUser(@Valid @RequestBody AdminUserRequest req, Principal principal) {
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new IllegalArgumentException("Email deja utilise.");
        }
        User user = new User();
        user.setFirstName(req.firstName().trim());
        user.setLastName(req.lastName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(
                req.password() != null && !req.password().isBlank()
                        ? req.password() : "Change@1234"
        ));
        user.setPhone(req.phone());
        user.setRoles(java.util.Set.of(req.role()));
        User saved = users.save(user);

        if (req.role() == Role.DOCTOR) {
            DoctorProfile profile = new DoctorProfile();
            profile.setUser(saved);
            profile.setSpecialty(req.specialty() != null ? req.specialty() : "");
            profile.setLocation(req.location() != null ? req.location() : "");
            profile.setSpokenLanguages(req.spokenLanguages() != null ? req.spokenLanguages() : "");
            profile.setConsultationFee(req.consultationFee() != null
                    ? req.consultationFee() : java.math.BigDecimal.ZERO);
            doctors.save(profile);
        }

        audit.log("USER_CREATED", principal.getName(), "User", saved.getId().toString(),
                "Créé : " + saved.getFullName() + " [" + req.role() + "]");
        return UserSummary.from(saved);
    }

    @PatchMapping("/users/{id}")
    UserSummary updateUser(@PathVariable Long id,
                           @Valid @RequestBody AdminUserRequest req,
                           Principal principal) {
        User user = users.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));
        user.setFirstName(req.firstName().trim());
        user.setLastName(req.lastName().trim());
        user.setPhone(req.phone());
        user.setRoles(java.util.Set.of(req.role()));
        if (req.password() != null && !req.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.password()));
        }
        User saved = users.save(user);

        if (req.role() == Role.DOCTOR) {
            DoctorProfile profile = doctors.findByUserEmail(saved.getEmail())
                    .orElseGet(() -> { DoctorProfile p = new DoctorProfile(); p.setUser(saved); return p; });
            if (req.specialty() != null) profile.setSpecialty(req.specialty());
            if (req.location() != null) profile.setLocation(req.location());
            if (req.spokenLanguages() != null) profile.setSpokenLanguages(req.spokenLanguages());
            if (req.consultationFee() != null) profile.setConsultationFee(req.consultationFee());
            doctors.save(profile);
        }

        audit.log("USER_UPDATED", principal.getName(), "User", id.toString(),
                "Modifié : " + saved.getFullName());
        return UserSummary.from(saved);
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteUser(@PathVariable Long id, Principal principal) {
        User user = users.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));
        String name = user.getFullName();
        users.deleteById(id);
        audit.log("USER_DELETED", principal.getName(), "User", id.toString(),
                "Supprimé : " + name);
    }

    public record DashboardStats(long users, long doctors, long appointments) {}
}
