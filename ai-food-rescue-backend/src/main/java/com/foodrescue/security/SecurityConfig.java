package com.foodrescue.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {


private final JwtAuthenticationFilter jwtAuthenticationFilter;

public SecurityConfig(
        JwtAuthenticationFilter jwtAuthenticationFilter) {

    this.jwtAuthenticationFilter = jwtAuthenticationFilter;
}

// =========================================================
// PASSWORD ENCODER
// =========================================================

@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

// =========================================================
// CORS CONFIGURATION
// =========================================================

@Bean
public CorsConfigurationSource corsConfigurationSource() {

    CorsConfiguration configuration = new CorsConfiguration();

    configuration.setAllowedOrigins(
            List.of("http://localhost:5173")
    );

    configuration.setAllowedMethods(
            List.of(
                    "GET",
                    "POST",
                    "PUT",
                    "DELETE",
                    "OPTIONS"
            )
    );

    configuration.setAllowedHeaders(
            List.of(
                    "Authorization",
                    "Content-Type",
                    "Accept"
            )
    );

    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

    source.registerCorsConfiguration(
            "/**",
            configuration
    );

    return source;
}

// =========================================================
// SECURITY FILTER CHAIN
// =========================================================

@Bean
public SecurityFilterChain securityFilterChain(
        HttpSecurity http) throws Exception {

    http

        // -------------------------------------------------
        // CORS
        // -------------------------------------------------

        .cors(cors -> cors.configurationSource(
                corsConfigurationSource()
        ))

        // -------------------------------------------------
        // CSRF
        // -------------------------------------------------

        .csrf(csrf -> csrf.disable())

        // -------------------------------------------------
        // STATELESS JWT SESSION
        // -------------------------------------------------

        .sessionManagement(session ->
            session.sessionCreationPolicy(
                SessionCreationPolicy.STATELESS
            )
        )

        // -------------------------------------------------
        // AUTHORIZATION
        // -------------------------------------------------

        .authorizeHttpRequests(auth -> auth

            // =============================================
            // PUBLIC AUTH
            // =============================================

            .requestMatchers(
                "/api/auth/register",
                "/api/auth/login"
            ).permitAll()

            // =============================================
            // PUBLIC FOOD GET APIs
            // =============================================

            .requestMatchers(
                HttpMethod.GET,
                "/api/food/**"
            ).permitAll()

            // =============================================
            // DONOR + ADMIN FOOD APIs
            // =============================================

            .requestMatchers(
                HttpMethod.POST,
                "/api/food/**",
                "/api/donor/**"
            ).hasAnyRole(
                "DONOR",
                "ADMIN"
            )

            .requestMatchers(
                HttpMethod.PUT,
                "/api/food/**",
                "/api/donor/**"
            ).hasAnyRole(
                "DONOR",
                "ADMIN"
            )

            .requestMatchers(
                HttpMethod.DELETE,
                "/api/food/**",
                "/api/donor/**"
            ).hasAnyRole(
                "DONOR",
                "ADMIN"
            )

            // =============================================
            // ADMIN USER MANAGEMENT
            // =============================================

            .requestMatchers(
                "/api/admin/**"
            ).hasRole("ADMIN")

            // =============================================
            // ADMIN ORDER MANAGEMENT
            // =============================================

            .requestMatchers(
                "/api/orders/all",
                "/api/orders/status/**"
            ).hasRole("ADMIN")

            // =============================================
            // DONOR + ADMIN UPDATE DELIVERY STATUS
            // =============================================

            .requestMatchers(
                HttpMethod.PUT,
                "/api/orders/*/status"
            ).hasAnyRole(
                "DONOR",
                "ADMIN"
            )

            // =============================================
            // CART
            // =============================================

            .requestMatchers(
                "/api/cart/**"
            ).authenticated()

            // =============================================
            // ORDERS
            // =============================================

            .requestMatchers(
                "/api/orders/**"
            ).authenticated()

            // =============================================
            // USER PROFILE
            // =============================================

            .requestMatchers(
                "/api/user/**"
            ).authenticated()

            // =============================================
            // EVERYTHING ELSE
            // =============================================

            .anyRequest().authenticated()
        )

        // -------------------------------------------------
        // JWT FILTER
        // -------------------------------------------------

        .addFilterBefore(
            jwtAuthenticationFilter,
            UsernamePasswordAuthenticationFilter.class
        );

    return http.build();
}


}
