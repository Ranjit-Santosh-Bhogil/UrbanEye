package com.urbaneye.backend.config;

import com.urbaneye.backend.models.User;
import com.urbaneye.backend.models.UserRole;
import com.urbaneye.backend.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataLoader implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataLoader.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedAdminUser();
    }

    private void seedAdminUser() {
        logger.info("Checking if admin user exists...");

        Optional<User> adminUser = userRepository.findByEmail("admin@urbaneye.com");

        if (adminUser.isEmpty()) {
            logger.info("Admin user does not exist. Creating one...");

            User admin = User.builder()
                    .name("Admin User")
                    .email("admin@urbaneye.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(UserRole.admin)
                    .mobile("9999999999")
                    .district("Sample District")
                    .city("Sample City")
                    .address("Sample Address")
                    .onboarded(true)
                    .build();

            userRepository.save(admin);
            logger.info("Admin user created successfully with email: admin@urbaneye.com");
        } else {
            logger.info("Admin user already exists");
        }
    }
}
