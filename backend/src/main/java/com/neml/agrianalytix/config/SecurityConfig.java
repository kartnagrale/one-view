package com.neml.agrianalytix.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    UserDetailsService users(AgriAnalytixProperties properties, PasswordEncoder encoder) {
        var auth = properties.getAuth();
        var internal = User.withUsername(auth.getInternalUser())
                .password(encoder.encode(auth.getInternalPassword()))
                .roles("INTERNAL")
                .build();
        var marketwatch = User.withUsername(auth.getMarketwatchUser())
                .password(encoder.encode(auth.getMarketwatchPassword()))
                .roles("INTERNAL", "MARKETWATCH")
                .build();
        return new InMemoryUserDetailsManager(internal, marketwatch);
    }

    @Bean
    SecurityFilterChain security(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                    .anyRequest().authenticated())
            .httpBasic(Customizer.withDefaults());
        return http.build();
    }
}
