package com.medisync.auth;

import com.medisync.audit.AuditService;
import com.medisync.auth.dto.TwoFactorSetupResponse;
import com.medisync.security.TwoFactorService;
import com.medisync.user.User;
import com.medisync.user.UserRepository;
import java.security.Principal;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth/2fa")
public class TwoFactorController {
    private final TwoFactorService twoFactorService;
    private final UserRepository users;
    private final AuditService audit;

    public TwoFactorController(TwoFactorService twoFactorService, UserRepository users, AuditService audit) {
        this.twoFactorService = twoFactorService;
        this.users = users;
        this.audit = audit;
    }

    @PostMapping("/setup")
    TwoFactorSetupResponse setup(Principal principal) {
        User user = users.findByEmail(principal.getName()).orElseThrow();
        String secret = twoFactorService.generateSecret();
        user.setTwoFactorSecret(secret);
        users.save(user);
        String qrDataUri = twoFactorService.generateQrDataUri(secret, user.getEmail());
        return new TwoFactorSetupResponse(secret, qrDataUri);
    }

    @PostMapping("/enable")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void enable(@RequestBody Map<String, String> body, Principal principal) {
        User user = users.findByEmail(principal.getName()).orElseThrow();
        String code = body.get("code");
        if (!twoFactorService.verify(user.getTwoFactorSecret(), code)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code TOTP invalide.");
        }
        user.setTwoFactorEnabled(true);
        users.save(user);
        audit.log("2FA_ENABLED", principal.getName(), "User", user.getId().toString(), "2FA activé");
    }

    @DeleteMapping("/disable")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void disable(@RequestBody Map<String, String> body, Principal principal) {
        User user = users.findByEmail(principal.getName()).orElseThrow();
        String code = body.get("code");
        if (!twoFactorService.verify(user.getTwoFactorSecret(), code)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code TOTP invalide.");
        }
        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        users.save(user);
        audit.log("2FA_DISABLED", principal.getName(), "User", user.getId().toString(), "2FA désactivé");
    }
}
