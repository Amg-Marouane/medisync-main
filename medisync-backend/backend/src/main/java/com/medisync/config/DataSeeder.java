package com.medisync.config;

import com.medisync.doctor.DoctorProfile;
import com.medisync.doctor.DoctorRepository;
import com.medisync.user.Role;
import com.medisync.user.User;
import com.medisync.user.UserRepository;
import java.math.BigDecimal;
import java.util.Set;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seed(UserRepository users, DoctorRepository doctors, PasswordEncoder encoder) {
        return args -> {
            if (users.existsByEmail("admin@medisync.local")) {
                return;
            }
            User admin = createUser("Admin", "MediSync", "admin@medisync.local", "Admin@1234", Role.ADMIN, encoder);
            User doctorUser = createUser("Sara", "Amrani", "doctor@medisync.local", "Doctor@1234", Role.DOCTOR, encoder);
            User patient = createUser("Youssef", "Benali", "patient@medisync.local", "Patient@1234", Role.PATIENT, encoder);
            users.save(admin);
            users.save(doctorUser);
            users.save(patient);

            DoctorProfile doctor = new DoctorProfile();
            doctor.setUser(doctorUser);
            doctor.setSpecialty("Cardiologie");
            doctor.setLocation("Casablanca");
            doctor.setSpokenLanguages("Français, Arabe, Anglais");
            doctor.setConsultationFee(BigDecimal.valueOf(350));
            doctors.save(doctor);
        };
    }

    private User createUser(String firstName, String lastName, String email, String password, Role role, PasswordEncoder encoder) {
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(encoder.encode(password));
        user.setRoles(Set.of(role));
        return user;
    }
}
