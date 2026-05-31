package com.medisync.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.medisync.audit.AuditService;
import com.medisync.auth.dto.AuthResponse;
import com.medisync.security.JwtService;
import com.medisync.security.SecurityUser;
import com.medisync.user.Role;
import com.medisync.user.User;
import com.medisync.user.UserRepository;
import com.medisync.user.UserSummary;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GoogleAuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuditService audit;
    private final String googleClientId;

    public GoogleAuthService(
            UserRepository userRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            AuditService audit,
            @Value("${app.google.client-id}") String googleClientId
    ) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.audit = audit;
        this.googleClientId = googleClientId;
    }

    public AuthResponse authenticate(String idTokenString) {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google ID token.");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail().toLowerCase();
            
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                String name = (String) payload.get("name");
                String givenName = (String) payload.get("given_name");
                String familyName = (String) payload.get("family_name");

                if (givenName == null) {
                    givenName = name != null ? name : "Google";
                }
                if (familyName == null) {
                    familyName = "User";
                }

                User newUser = new User();
                newUser.setEmail(email);
                newUser.setFirstName(givenName);
                newUser.setLastName(familyName);
                newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                newUser.setRoles(Set.of(Role.PATIENT));
                
                User saved = userRepository.save(newUser);
                audit.log("USER_REGISTERED", saved.getEmail(), "User", saved.getId().toString(),
                        "Inscription via Google : " + saved.getFullName());
                return saved;
            });

            if (!user.isEnabled()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is disabled.");
            }

            audit.log("USER_LOGIN", user.getEmail(), "User", user.getId().toString(), "Connexion réussie via Google");
            String token = jwtService.generateToken(new SecurityUser(user));
            return new AuthResponse(token, UserSummary.from(user));

        } catch (GeneralSecurityException | IOException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Error verifying Google token: " + e.getMessage());
        }
    }
}
