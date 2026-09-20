package com.sportx.service;

import com.sportx.dto.UserProfileRequest;
import com.sportx.entity.User;
import com.sportx.exception.BadRequestException;
import com.sportx.exception.ResourceNotFoundException;
import com.sportx.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found for " + email));
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User " + id + " was not found"));
    }

    public List<User> findAll() {
        List<User> users = userRepository.findAll();
        users.forEach(u -> u.setPassword(null));
        return users;
    }

    public User updateProfile(String email, UserProfileRequest request) {
        User user = findByEmail(email);
        user.setName(request.getName().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        User saved = userRepository.save(user);
        saved.setPassword(null);
        return saved;
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = findByEmail(email);
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("Your current password is incorrect");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public User setActive(Long id, boolean active) {
        User user = findById(id);
        user.setActive(active);
        User saved = userRepository.save(user);
        saved.setPassword(null);
        return saved;
    }
}
