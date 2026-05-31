package com.medisync.auth;

import com.medisync.audit.AuditService;
import com.medisync.auth.dto.AuthResponse;
import com.medisync.auth.dto.LoginRequest;
import com.medisync.auth.dto.RegisterRequest;
import com.medisync.security.JwtService;
import com.medisync.security.SecurityUser;
import com.medisync.security.TwoFactorService;
import com.medisync.user.User;
import com.medisync.user.UserRepository;
import com.medisync.user.UserSummary;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final TwoFactorService twoFactorService;
    private final AuditService audit;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService,
                       TwoFactorService twoFactorService, AuditService audit) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.twoFactorService = twoFactorService;
        this.audit = audit;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        String socialSecurityNumber = normalizeOptional(request.socialSecurityNumber());
        if (users.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (socialSecurityNumber != null && users.existsBySocialSecurityNumber(socialSecurityNumber)) {
            throw new IllegalArgumentException("Numero de securite sociale deja utilise");
        }
        User user = new User();
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setEmail(email);
        user.setPhone(normalizeOptional(request.phone()));
        user.setSocialSecurityNumber(socialSecurityNumber);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRoles(Set.of(request.effectiveRole()));
        User saved = users.save(user);
        audit.log("USER_REGISTERED", saved.getEmail(), "User", saved.getId().toString(),
                "Inscription : " + saved.getFullName());
        String token = jwtService.generateToken(new SecurityUser(saved));
        return new AuthResponse(token, UserSummary.from(saved));
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.email().trim().toLowerCase();
        String email = users.findByEmail(identifier)
                .or(() -> users.findBySocialSecurityNumber(identifier))
                .map(User::getEmail)
                .orElse(identifier);
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password())
        );
        User user = users.findByEmail(email).orElseThrow();

        if (user.isTwoFactorEnabled()) {
            if (request.totpCode() == null || request.totpCode().isBlank()) {
                return new AuthResponse(null, UserSummary.from(user), true);
            }
            if (!twoFactorService.verify(user.getTwoFactorSecret(), request.totpCode())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Code 2FA invalide.");
            }
        }

        audit.log("USER_LOGIN", user.getEmail(), "User", user.getId().toString(), "Connexion réussie");
        String token = jwtService.generateToken(new SecurityUser(user));
        return new AuthResponse(token, UserSummary.from(user));
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim().toLowerCase();
    }
}
