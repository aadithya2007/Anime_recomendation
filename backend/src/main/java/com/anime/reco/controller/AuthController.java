package com.anime.reco.controller;

import com.anime.reco.dto.AuthRequest;
import com.anime.reco.dto.AuthResponse;
import com.anime.reco.dto.RegisterRequest;
import com.anime.reco.model.User;
import com.anime.reco.repository.UserRepository;
import com.anime.reco.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(new AuthResponse(authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(new AuthResponse(authService.login(request)));
    }

    @GetMapping("/me")
    public UserInfo me(@AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        return new UserInfo(user.getId(), user.getUsername(), user.getEmail());
    }

    public record UserInfo(Long id, String username, String email) {}
}
