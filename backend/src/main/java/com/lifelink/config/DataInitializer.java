package com.lifelink.config;

import com.lifelink.entity.Role;
import com.lifelink.entity.User;
import com.lifelink.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Locale;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private DataSource dataSource;

    @Override
    public void run(String... args) {
        ensureDonorSchemaCompatibility();

        if (!userRepository.existsByEmail("admin@lifelink.com")) {
            User admin = new User();
            admin.setName("LifeLink Admin");
            admin.setEmail("admin@lifelink.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            logger.info("Default admin user created: admin@lifelink.com / admin123");
        }
    }

    private void ensureDonorSchemaCompatibility() {
        ensureColumn("donors", "age", "integer");
        ensureColumn("donors", "weight", "double");
        ensureColumn("donors", "healthy", "boolean default true");
        ensureColumn("donors", "latitude", "double");
        ensureColumn("donors", "longitude", "double");
        ensureColumn("donors", "updated_at", "timestamp");
        ensureColumn("donors", "last_active_at", "timestamp");
        ensureColumn("blood_requests", "state_name", "varchar(255)");
        ensureColumn("blood_requests", "district_name", "varchar(255)");
        ensureColumn("blood_requests", "city_name", "varchar(255)");
        ensureColumn("blood_requests", "latitude", "double");
        ensureColumn("blood_requests", "longitude", "double");
    }

    private void ensureColumn(String tableName, String columnName, String columnDefinition) {
        try {
            if (columnExists(tableName, columnName)) {
                return;
            }

            jdbcTemplate.execute("alter table " + tableName + " add column " + columnName + " " + columnDefinition);
            logger.info("Added missing column {}.{} to keep the local schema compatible", tableName, columnName);
        } catch (Exception exception) {
            logger.warn("Could not verify or update column {}.{}: {}", tableName, columnName, exception.getMessage());
        }
    }

    private boolean columnExists(String tableName, String columnName) throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            String normalizedTable = tableName.toUpperCase(Locale.ROOT);
            String normalizedColumn = columnName.toUpperCase(Locale.ROOT);

            try (ResultSet columns = metaData.getColumns(null, null, normalizedTable, normalizedColumn)) {
                if (columns.next()) {
                    return true;
                }
            }

            try (ResultSet columns = metaData.getColumns(null, null, tableName, columnName)) {
                return columns.next();
            }
        }
    }
}
