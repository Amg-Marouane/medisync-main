package com.medisync.user;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findBySocialSecurityNumber(String socialSecurityNumber);

    boolean existsByEmail(String email);

    boolean existsBySocialSecurityNumber(String socialSecurityNumber);
}
