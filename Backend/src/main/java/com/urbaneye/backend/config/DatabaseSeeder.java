package com.urbaneye.backend.config;

import com.urbaneye.backend.models.User;
import com.urbaneye.backend.models.UserRole;
import com.urbaneye.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        Optional<User> adminOpt = userRepository.findByEmail("admin@urbaneye.com");
        if (adminOpt.isPresent()) {
            System.out.println("Admin already exists. You can login with admin@urbaneye.com / admin123");
        } else {
            User adminUser = User.builder()
                    .name("System Admin")
                    .email("admin@urbaneye.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(UserRole.admin)
                    .onboarded(true)
                    .build();
            userRepository.save(adminUser);
            System.out.println("✅ Admin user created successfully!");
            System.out.println("Email: admin@urbaneye.com");
            System.out.println("Password: admin123");
        }
    }
}
